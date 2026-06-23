import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { TypeTechTask } from '@/services/api/equipment';
import { getTechTaskBusinessTimezone } from '@/config/techTaskTimezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const WALL_CLOCK_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export function wallClockToUtcDate(picked: Dayjs, tz: string): Date {
  if (!picked.isValid()) {
    throw new Error('Invalid schedule datetime');
  }
  const wall = picked.format(WALL_CLOCK_FORMAT);
  const inBusinessTz = dayjs.tz(wall, WALL_CLOCK_FORMAT, tz);
  if (!inBusinessTz.isValid()) {
    throw new Error(`Invalid wall clock in timezone ${tz}`);
  }
  return inBusinessTz.utc().toDate();
}

export function endDateToUtcDate(picked: Dayjs, tz: string): Date {
  if (!picked.isValid()) {
    throw new Error('Invalid end date');
  }
  const wall = picked.format('YYYY-MM-DD');
  return dayjs.tz(wall, 'YYYY-MM-DD', tz).endOf('day').utc().toDate();
}

export function defaultScheduleStartInBusinessTz(): Date {
  const tz = getTechTaskBusinessTimezone();
  return dayjs.tz(dayjs(), tz).startOf('hour').utc().toDate();
}

export function toTechTaskStartDate(
  type: TypeTechTask,
  scheduleStart?: Dayjs | null
): Date {
  if (type === TypeTechTask.REGULAR) {
    if (!scheduleStart?.isValid()) {
      throw new Error('REGULAR tech tasks require a valid schedule start datetime');
    }
    return wallClockToUtcDate(scheduleStart, getTechTaskBusinessTimezone());
  }
  return new Date();
}

export function assertScheduleBeforeEnd(
  scheduleStart: Dayjs,
  endDate?: Dayjs | null
): void {
  if (!endDate?.isValid()) {
    return;
  }
  const tz = getTechTaskBusinessTimezone();
  const startUtc = wallClockToUtcDate(scheduleStart, tz);
  const endUtc = endDateToUtcDate(endDate, tz);
  if (startUtc.getTime() > endUtc.getTime()) {
    throw new Error('Schedule start must be on or before end date');
  }
}
