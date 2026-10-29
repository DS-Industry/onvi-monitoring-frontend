export function getTechTaskBusinessTimezone(): string {
  const tz = import.meta.env.VITE_TECH_TASK_BUSINESS_TIMEZONE?.trim();

  if (!tz) {
    console.error(
      'VITE_TECH_TASK_BUSINESS_TIMEZONE is not set. It must match backend TECH_TASK_BUSINESS_TIMEZONE.'
    );
    throw new Error('VITE_TECH_TASK_BUSINESS_TIMEZONE is not configured');
  }

  if (!isValidIanaTimezone(tz)) {
    throw new Error(`Invalid VITE_TECH_TASK_BUSINESS_TIMEZONE: ${tz}`);
  }

  return tz;
}

function isValidIanaTimezone(timeZone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch {
    return false;
  }
}
