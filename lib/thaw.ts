/**
 * Pure thaw calculation logic for TurkeyThawClock.
 * No React dependencies. Native Date/Intl only.
 */

export const LB_PER_KG = 2.20462;

export function kgToLb(kg: number): number {
  return kg * LB_PER_KG;
}

export function lbToKg(lb: number): number {
  return lb / LB_PER_KG;
}

/**
 * Fridge thaw formula:
 * 24 hours for every 4.5 lbs (approx. 5.33 hours per lb) + brine buffer hours
 */
export function calculateFridgeThawHours(weightInLb: number, brineHours: number = 0): number {
  if (weightInLb <= 0) return 0;
  return (weightInLb / 4.5) * 24 + brineHours;
}

/**
 * Cold-water thaw formula:
 * 30 minutes (0.5 hours) per pound
 */
export function calculateColdWaterThawHours(weightInLb: number): number {
  if (weightInLb <= 0) return 0;
  return weightInLb * 0.5;
}

/**
 * Start time = cooking start minus thaw hours, rounded EARLIER to the nearest 15 minutes.
 */
export function calculateFridgeStartTime(cookingStartTime: Date, thawHours: number): Date {
  const thawMs = thawHours * 60 * 60 * 1000;
  const exactStartMs = cookingStartTime.getTime() - thawMs;
  const exactDate = new Date(exactStartMs);

  // Round EARLIER to nearest 15 minutes in local time
  const minutes = exactDate.getMinutes();
  const remainderMinutes = minutes % 15;
  exactDate.setMinutes(minutes - remainderMinutes, 0, 0);

  return exactDate;
}

/**
 * Cold water start time = cooking start minus cold water thaw hours, rounded EARLIER to nearest 15 minutes.
 */
export function calculateColdWaterStartTime(cookingStartTime: Date, coldWaterHours: number): Date {
  const coldWaterMs = coldWaterHours * 60 * 60 * 1000;
  const exactStartMs = cookingStartTime.getTime() - coldWaterMs;
  const exactDate = new Date(exactStartMs);

  const minutes = exactDate.getMinutes();
  const remainderMinutes = minutes % 15;
  exactDate.setMinutes(minutes - remainderMinutes, 0, 0);

  return exactDate;
}

export interface FormattedDuration {
  days: number;
  hours: number;
  minutes: number;
  text: string;
}

export function formatDuration(totalHours: number): FormattedDuration {
  const totalMinutes = Math.round(totalHours * 60);
  const days = Math.floor(totalMinutes / (24 * 60));
  const remainingMinutesAfterDays = totalMinutes % (24 * 60);
  const hours = Math.floor(remainingMinutesAfterDays / 60);
  const minutes = remainingMinutesAfterDays % 60;

  const parts: string[] = [];
  if (days > 0) {
    parts.push(`${days} day${days === 1 ? '' : 's'}`);
  }
  if (hours > 0 || (days === 0 && minutes === 0)) {
    parts.push(`${hours} hour${hours === 1 ? '' : 's'}`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} minute${minutes === 1 ? '' : 's'}`);
  }

  return {
    days,
    hours,
    minutes,
    text: parts.join(', '),
  };
}

export function formatVerdictDate(date: Date): string {
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
  const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
  const day = date.getDate();
  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);

  return `${weekday}, ${month} ${day} at ${time}`;
}

export interface CountdownResult {
  isPast: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  text: string;
}

export function calculateCountdown(targetDate: Date, now: Date = new Date()): CountdownResult {
  const diffMs = targetDate.getTime() - now.getTime();
  if (diffMs <= 0) {
    return {
      isPast: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      text: 'Start time has passed',
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return {
    isPast: false,
    days,
    hours,
    minutes,
    seconds,
    text: parts.join(' '),
  };
}

/**
 * Returns Thanksgiving (4th Thursday of November) for a given year at 12:00 PM local time.
 */
export function getThanksgivingDate(year: number): Date {
  const nov1 = new Date(year, 10, 1, 12, 0, 0, 0);
  const dayOfWeek = nov1.getDay();
  const firstThursday = 1 + ((4 - dayOfWeek + 7) % 7);
  const fourthThursday = firstThursday + 21;
  return new Date(year, 10, fourthThursday, 12, 0, 0, 0);
}

/**
 * Returns the next upcoming Thanksgiving at 12:00 PM local time.
 * If referenceDate is past this year's Thanksgiving, it rolls over to next year automatically.
 */
export function getNextThanksgiving(referenceDate: Date = new Date()): Date {
  const year = referenceDate.getFullYear();
  const thisYearThanksgiving = getThanksgivingDate(year);
  if (referenceDate.getTime() > thisYearThanksgiving.getTime()) {
    return getThanksgivingDate(year + 1);
  }
  return thisYearThanksgiving;
}

/**
 * Returns the next upcoming Christmas at 12:00 PM local time.
 */
export function getNextChristmas(referenceDate: Date = new Date()): Date {
  const year = referenceDate.getFullYear();
  const thisYearChristmas = new Date(year, 11, 25, 12, 0, 0, 0);
  if (referenceDate.getTime() > thisYearChristmas.getTime()) {
    return new Date(year + 1, 11, 25, 12, 0, 0, 0);
  }
  return thisYearChristmas;
}

export function formatToDateTimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function parseFromDateTimeLocal(str: string): Date | null {
  if (!str) return null;
  const [datePart, timePart] = str.split('T');
  if (!datePart || !timePart) return null;
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes)) {
    return null;
  }
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

export interface ThawCalculationInput {
  weightInLb: number;
  cookingStartTime: Date;
  brineBufferHours?: number;
  now?: Date;
}

export interface ThawCalculationResult {
  weightInLb: number;
  cookingStartTime: Date;
  brineBufferHours: number;
  fridgeThawHours: number;
  fridgeStartTime: Date;
  formattedFridgeStartTime: string;
  formattedFridgeDuration: string;
  isFridgeStartInPast: boolean;
  countdownToFridgeStart: CountdownResult;

  coldWaterThawHours: number;
  coldWaterStartTime: Date;
  formattedColdWaterStartTime: string;
  formattedColdWaterDuration: string;
  isColdWaterStartInPast: boolean;
  isCookingTimeInPast: boolean;
  isTooLateForColdWater: boolean;
}

/**
 * Calculates complete thaw timeline for fridge and cold-water methods.
 */
export function calculateThaw(input: ThawCalculationInput): ThawCalculationResult {
  const { weightInLb, cookingStartTime, brineBufferHours = 0, now = new Date() } = input;

  const fridgeThawHours = calculateFridgeThawHours(weightInLb, brineBufferHours);
  const fridgeStartTime = calculateFridgeStartTime(cookingStartTime, fridgeThawHours);
  const isFridgeStartInPast = fridgeStartTime.getTime() <= now.getTime();
  const countdownToFridgeStart = calculateCountdown(fridgeStartTime, now);

  const coldWaterThawHours = calculateColdWaterThawHours(weightInLb);
  const coldWaterStartTime = calculateColdWaterStartTime(cookingStartTime, coldWaterThawHours);
  const isColdWaterStartInPast = coldWaterStartTime.getTime() <= now.getTime();
  const isCookingTimeInPast = cookingStartTime.getTime() <= now.getTime();
  const isTooLateForColdWater = isColdWaterStartInPast || isCookingTimeInPast;

  const fridgeDuration = formatDuration(fridgeThawHours);
  const coldWaterDuration = formatDuration(coldWaterThawHours);

  return {
    weightInLb,
    cookingStartTime,
    brineBufferHours,
    fridgeThawHours,
    fridgeStartTime,
    formattedFridgeStartTime: formatVerdictDate(fridgeStartTime),
    formattedFridgeDuration: fridgeDuration.text,
    isFridgeStartInPast,
    countdownToFridgeStart,

    coldWaterThawHours,
    coldWaterStartTime,
    formattedColdWaterStartTime: formatVerdictDate(coldWaterStartTime),
    formattedColdWaterDuration: coldWaterDuration.text,
    isColdWaterStartInPast,
    isCookingTimeInPast,
    isTooLateForColdWater,
  };
}
