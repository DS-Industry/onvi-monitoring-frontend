import { AxiosResponse } from 'axios';
import api from '@/config/axiosConfig';

const FINTABLO_ORG = 'user/manager-paper/fintablo';
const FINTABLO_POS = 'user/manager-paper/fintablo/pos';
const FINTABLO_MANAGER_PAPER = 'user/manager-paper';

export const FINTABLO_PENDING_POLL_MS = 5000;

export const FINTABLO_SYNC_STATUSES = ['pending', 'synced', 'failed'] as const;

export type FintabloSyncStatus = (typeof FINTABLO_SYNC_STATUSES)[number];

export type ManagerPaperFintabloFields = {
  fintabloSyncStatus?: FintabloSyncStatus | null;
  fintabloTransactionId?: string | null;
  fintabloLastError?: string | null;
};

export function isFintabloSyncStatus(value: unknown): value is FintabloSyncStatus {
  return FINTABLO_SYNC_STATUSES.some(status => status === value);
}

export function sanitizeManagerPaperFintabloFields(
  source: unknown
): ManagerPaperFintabloFields {
  if (!source || typeof source !== 'object') {
    return {};
  }

  const record = source as Record<string, unknown>;
  const fields: ManagerPaperFintabloFields = {};

  if (isFintabloSyncStatus(record.fintabloSyncStatus)) {
    fields.fintabloSyncStatus = record.fintabloSyncStatus;
  } else if (record.fintabloSyncStatus === null) {
    fields.fintabloSyncStatus = null;
  }

  if (typeof record.fintabloTransactionId === 'string') {
    fields.fintabloTransactionId = record.fintabloTransactionId;
  } else if (record.fintabloTransactionId === null) {
    fields.fintabloTransactionId = null;
  }

  if (typeof record.fintabloLastError === 'string') {
    const trimmed = record.fintabloLastError.trim();
    fields.fintabloLastError = trimmed.length > 0 ? trimmed : null;
  } else if (record.fintabloLastError === null) {
    fields.fintabloLastError = null;
  }

  return fields;
}

export function applyManagerPaperFintabloProps<T extends object>(
  props: T
): T & ManagerPaperFintabloFields {
  const next = { ...(props as T & Record<string, unknown>) };
  delete next.token;
  delete next.authorization;
  delete next.Authorization;
  return {
    ...(next as T),
    ...sanitizeManagerPaperFintabloFields(props),
  };
}

export function hasPendingFintabloSync(
  papers: Array<{ fintabloSyncStatus?: FintabloSyncStatus | null }>
): boolean {
  return papers.some(paper => paper.fintabloSyncStatus === 'pending');
}

export function shouldShowFintabloRetry(
  status: unknown,
  canRetry: boolean
): boolean {
  return status === 'failed' && canRetry;
}

export type OrganizationFinTabloResponse = {
  objectsEnabled: boolean;
  tokenConfigured: boolean;
  directionId: string | null;
  categoryIds: Record<string, string> | null;
};

export type UpdateOrganizationFinTabloBody = {
  organizationId: number;
  objectsEnabled: boolean;
  token?: string;
};

export type PosFinTabloResponse = {
  posId: number;
  name: string;
  enabled: boolean;
  moneybagId: string | null;
  moneybagName?: string | null;
};

export type PatchPosFinTabloBody = {
  enabled: boolean;
  moneybagName?: string;
};

export function sanitizeOrganizationFinTabloResponse(
  data: OrganizationFinTabloResponse & { token?: unknown }
): OrganizationFinTabloResponse {
  return {
    objectsEnabled: Boolean(data.objectsEnabled),
    tokenConfigured: Boolean(data.tokenConfigured),
    directionId: data.directionId ?? null,
    categoryIds: data.categoryIds ?? null,
  };
}

export function sanitizePosFinTabloResponse(
  data: PosFinTabloResponse
): PosFinTabloResponse {
  const sanitized: PosFinTabloResponse = {
    posId: data.posId,
    name: data.name,
    enabled: Boolean(data.enabled),
    moneybagId: data.moneybagId ?? null,
  };

  if (typeof data.moneybagName === 'string') {
    sanitized.moneybagName = data.moneybagName;
  }

  return sanitized;
}

export function buildUpdateOrganizationFinTabloBody(
  input: UpdateOrganizationFinTabloBody
): UpdateOrganizationFinTabloBody {
  const body: UpdateOrganizationFinTabloBody = {
    organizationId: input.organizationId,
    objectsEnabled: input.objectsEnabled,
  };
  const token = input.token?.trim();
  if (token) {
    body.token = token;
  }
  return body;
}

export function buildPatchPosFinTabloBody(
  input: PatchPosFinTabloBody
): PatchPosFinTabloBody {
  const body: PatchPosFinTabloBody = { enabled: input.enabled };
  const moneybagName = input.moneybagName?.trim();
  if (input.enabled && moneybagName) {
    body.moneybagName = moneybagName;
  }
  return body;
}

export function shouldShowFinTabloPosTab(input: {
  canUpdateOrganization: boolean;
  canUpdateManagerPaper: boolean;
  hasManagerPaperTariff: boolean;
  objectsEnabled: boolean | undefined;
  orgStatusPending?: boolean;
}): boolean {
  if (!input.canUpdateOrganization || !input.canUpdateManagerPaper) {
    return false;
  }
  if (!input.hasManagerPaperTariff) {
    return true;
  }
  if (input.orgStatusPending) {
    return true;
  }
  return input.objectsEnabled === true;
}

export async function getOrganizationFinTablo(
  organizationId: number
): Promise<OrganizationFinTabloResponse> {
  const response: AxiosResponse<OrganizationFinTabloResponse> = await api.get(
    FINTABLO_ORG,
    { params: { organizationId } }
  );
  return sanitizeOrganizationFinTabloResponse(response.data);
}

export async function updateOrganizationFinTablo(
  body: UpdateOrganizationFinTabloBody
): Promise<OrganizationFinTabloResponse> {
  const response: AxiosResponse<OrganizationFinTabloResponse> = await api.put(
    FINTABLO_ORG,
    buildUpdateOrganizationFinTabloBody(body)
  );
  return sanitizeOrganizationFinTabloResponse(response.data);
}

export async function getPosFinTabloList(
  organizationId: number
): Promise<PosFinTabloResponse[]> {
  const response: AxiosResponse<PosFinTabloResponse[]> = await api.get(
    FINTABLO_POS,
    { params: { organizationId } }
  );
  return (response.data ?? []).map(sanitizePosFinTabloResponse);
}

export async function patchPosFinTablo(
  posId: number,
  body: PatchPosFinTabloBody
): Promise<PosFinTabloResponse> {
  const response: AxiosResponse<PosFinTabloResponse> = await api.patch(
    `${FINTABLO_POS}/${posId}`,
    buildPatchPosFinTabloBody(body)
  );
  return sanitizePosFinTabloResponse(response.data);
}

export async function retryManagerPaperFinTablo(paperId: number): Promise<void> {
  await api.post(`${FINTABLO_MANAGER_PAPER}/${paperId}/fintablo/retry`);
}
