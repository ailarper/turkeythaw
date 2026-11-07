import {
  calculateColdWaterStartTime,
  calculateColdWaterThawHours,
  calculateFridgeStartTime,
  calculateFridgeThawHours,
  formatDuration,
} from './thaw';

export const WEIGHT_PRESETS = [12, 14, 16, 18, 20, 24] as const;

export type ThawMethod = 'refrigerator' | 'cold-water';

/**
 * Deterministic first paint for the static export. A mount effect rolls the
 * default forward to the next Thanksgiving if the site is opened in a later
 * season, so server HTML and the first client render cannot disagree.
 */
export const DEFAULT_TARGET_DATE = '2026-11-26';
export const DEFAULT_TARGET_TIME = '13:00';
export const DEFAULT_DINNER_TIME = '16:00';

export interface TimeOption {
  value: string;
  label: string;
  minutes: number;
}

function createTimeOptions(startHour: number, endHour: number): TimeOption[] {
  const options: TimeOption[] = [];

  for (let hour = startHour; hour <= endHour; hour += 1) {
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;

    options.push({
      value: `${String(hour).padStart(2, '0')}:00`,
      label: `${String(displayHour).padStart(2, '0')}:00 ${suffix}`,
      minutes: hour * 60,
    });
  }

  return options;
}

export const TARGET_TIME_OPTIONS = createTimeOptions(11, 20);
export const DINNER_TIME_OPTIONS = createTimeOptions(13, 20);

export interface BuildThawScheduleInput {
  weightLb: number;
  method: ThawMethod;
  target: Date;
}

export interface ThawSchedule {
  weightLb: number;
  method: ThawMethod;
  target: Date;
  startTime: Date;
  durationHours: number;
  durationText: string;
  approximateDuration: string;
}

/**
 * Fridge thaw uses the project's USDA-derived 24h per 4.5 lb model.
 * Cold water uses 30 minutes per pound. Start times round earlier to :15.
 */
export function buildThawSchedule({
  weightLb,
  method,
  target,
}: BuildThawScheduleInput): ThawSchedule {
  const durationHours =
    method === 'refrigerator'
      ? calculateFridgeThawHours(weightLb)
      : calculateColdWaterThawHours(weightLb);

  const startTime =
    method === 'refrigerator'
      ? calculateFridgeStartTime(target, durationHours)
      : calculateColdWaterStartTime(target, durationHours);

  return {
    weightLb,
    method,
    target,
    startTime,
    durationHours,
    durationText: formatDuration(durationHours).text,
    approximateDuration: formatApproximateDuration(durationHours),
  };
}

export function formatApproximateDuration(hours: number): string {
  if (!Number.isFinite(hours) || hours <= 0) return '—';
  if (hours >= 24) return `~${Math.ceil(hours / 24)} days`;
  return `~${Math.round(hours)} hours`;
}

/** "Sunday, Nov 22" */
export function formatScheduleDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/** "11:30 PM" */
export function formatClockTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/** "Sunday, Nov 22 · 11:30 PM" */
export function formatScheduleStamp(date: Date): string {
  return `${formatScheduleDate(date)} · ${formatClockTime(date)}`;
}

/** Local YYYY-MM-DD for <input type="date">. */
export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Parses local date + time inputs without timezone drift. */
export function parseLocalDateTime(dateValue: string, timeValue: string): Date | null {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(timeValue);

  if (!dateMatch || !timeMatch) return null;

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);

  if (hours > 23 || minutes > 59) return null;

  const date = new Date(year, month - 1, day, hours, minutes, 0, 0);

  // Reject overflow such as 2026-02-31.
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

/** "07:00 AM" — wraps across midnight for early cook-day starts. */
export function formatTimelineTime(totalMinutes: number): string {
  const minutesInDay = 24 * 60;
  const normalized = ((totalMinutes % minutesInDay) + minutesInDay) % minutesInDay;
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;

  return `${String(displayHour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${suffix}`;
}
