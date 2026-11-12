import { datadogLogs } from '@datadog/browser-logs';

/**
 * API host failover.
 *
 * Some ISPs (mobile networks under regional restrictions especially) drop
 * traffic to the primary API address for minutes at a time while other
 * routes still work. When a request to the primary gets no response, we check
 * the primary's /health; if that fails too we switch to the backup domain,
 * then poll the primary and switch back once it has answered several times in
 * a row.
 *
 * Only network failures count (no HTTP response at all). Any HTTP status,
 * even a 500, proves the host is reachable and never triggers a switch.
 */

const PRIMARY: string = import.meta.env.VITE_API_URL;
const BACKUP: string | undefined =
  import.meta.env.VITE_API_URL_BACKUP || undefined;

const STORAGE_KEY = 'onvi.apiActiveHost';

/** How often the primary is checked while we are on the backup. */
const PROBE_INTERVAL_MS = 30_000;
const PROBE_TIMEOUT_MS = 5_000;
/** Consecutive healthy probes required before switching back. */
const PROBE_SUCCESSES_TO_RECOVER = 3;

const safeGet = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSet = (key: string, value: string | null) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Storage blocked (private mode etc.): failover still works in memory.
  }
};

const readStoredHost = (): string => {
  const saved = safeGet(STORAGE_KEY);
  return saved && BACKUP && saved === BACKUP ? BACKUP : PRIMARY;
};

let activeHost = readStoredHost();
let confirmProbe: Promise<void> | null = null;
let probeTimer: ReturnType<typeof setInterval> | null = null;
let probeInFlight = false;
let probeSuccesses = 0;

export const isFailoverEnabled = (): boolean =>
  Boolean(BACKUP && BACKUP !== PRIMARY);

export const getActiveHost = (): string => activeHost;

async function isHealthy(host: string): Promise<boolean> {
  try {
    const res = await fetch(`${host}/health`, {
      method: 'GET',
      cache: 'no-store',
      credentials: 'omit',
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
    await res.text(); // drain, so the timeout signal does not abort the body
    return res.ok;
  } catch {
    return false;
  }
}

const setActiveHost = (host: string, reason: string) => {
  if (host === activeHost) return;
  const from = activeHost;
  activeHost = host;
  safeSet(STORAGE_KEY, host === PRIMARY ? null : host);

  const event = host === PRIMARY ? 'api_failback' : 'api_failover';
  datadogLogs.logger.warn(event, { from, to: host, reason });

  if (host === PRIMARY) stopPrimaryProbe();
  else startPrimaryProbe();
};

async function probePrimaryOnce() {
  if (probeInFlight) return;
  probeInFlight = true;
  try {
    probeSuccesses = (await isHealthy(PRIMARY)) ? probeSuccesses + 1 : 0;
  } finally {
    probeInFlight = false;
  }

  if (probeSuccesses >= PROBE_SUCCESSES_TO_RECOVER) {
    setActiveHost(PRIMARY, 'primary_healthy');
  }
}

function startPrimaryProbe() {
  if (probeTimer || !isFailoverEnabled()) return;
  probeSuccesses = 0;
  probeTimer = setInterval(probePrimaryOnce, PROBE_INTERVAL_MS);
}

function stopPrimaryProbe() {
  if (probeTimer) clearInterval(probeTimer);
  probeTimer = null;
  probeSuccesses = 0;
}

/**
 * Handle a request that got no HTTP response. If it went to the primary and
 * the primary's /health does not answer either, switch to the backup.
 * Concurrent failures share one check. Resolves once the decision is made;
 * the caller compares getActiveHost() with the failed host to decide on a
 * retry.
 */
export async function handleNetworkFailure(
  failedHost: string | undefined
): Promise<void> {
  if (!isFailoverEnabled() || !BACKUP) return;
  // A failure on the backup, or on a host we already left, says nothing new.
  if (failedHost !== PRIMARY || activeHost !== PRIMARY) return;

  if (!confirmProbe) {
    confirmProbe = (async () => {
      if (!(await isHealthy(PRIMARY))) {
        setActiveHost(BACKUP, 'primary_unreachable');
      }
    })().finally(() => {
      confirmProbe = null;
    });
  }
  await confirmProbe;
}

// Keep tabs in sync: a switch in one tab applies to all.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', e => {
    if (e.key !== STORAGE_KEY) return;
    const next = readStoredHost();
    if (next === activeHost) return;
    activeHost = next;
    if (next === PRIMARY) stopPrimaryProbe();
    else startPrimaryProbe();
  });
}

// Restored onto the backup after a reload: start checking the primary again.
if (activeHost !== PRIMARY) startPrimaryProbe();
