export type GoalStatus = 'normal' | 'attention' | 'critical';

export type GoalStatusResult = {
  expectedPacePercent: number;
  conversionPercent: number;
  status: GoalStatus;
  color: string;
  bgColor: string;
};

const STATUS_COLORS: Record<
  GoalStatus,
  { color: string; bgColor: string }
> = {
  normal: { color: '#00A355', bgColor: '#E6F7EF' },
  attention: { color: '#F58A00', bgColor: '#FFF4E5' },
  critical: { color: '#EB5757', bgColor: '#FDECEC' },
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function getExpectedPacePercent(
  dateStart: string | Date,
  dateEnd: string | Date,
  now: Date = new Date()
): number {
  const start = new Date(dateStart).getTime();
  const end = new Date(dateEnd).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 100;
  }

  const nowMs = clamp(now.getTime(), start, end);
  return clamp(((nowMs - start) / (end - start)) * 100, 0, 100);
}

export function getGoalStatus(
  planFulfillmentPercent: number | null | undefined,
  dateStart: string | Date,
  dateEnd: string | Date,
  now: Date = new Date()
): GoalStatusResult {
  const plan = Number(planFulfillmentPercent) || 0;
  const expectedPacePercent = getExpectedPacePercent(dateStart, dateEnd, now);
  const conversionPercent =
    expectedPacePercent > 0
      ? (plan / expectedPacePercent) * 100
      : plan;

  let status: GoalStatus = 'critical';
  if (conversionPercent >= 95) status = 'normal';
  else if (conversionPercent >= 85) status = 'attention';

  return {
    expectedPacePercent: Math.round(expectedPacePercent * 10) / 10,
    conversionPercent: Math.round(conversionPercent * 10) / 10,
    status,
    ...STATUS_COLORS[status],
  };
}

export function getIdleLoadStatus(minutesPerHour: number): GoalStatus {
  if (minutesPerHour < 20) return 'normal';
  if (minutesPerHour <= 35) return 'attention';
  return 'critical';
}

export function getIdleLoadColor(minutesPerHour: number): string {
  return STATUS_COLORS[getIdleLoadStatus(minutesPerHour)].color;
}
