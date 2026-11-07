export interface CalendarEvent {
  title: string;
  description: string;
  start: Date;
  end: Date;
  location?: string;
}

/** Google Calendar / ICS UTC stamp: 20261126T180000Z */
function toCompactUtc(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

/**
 * Builds a direct Google Calendar "add event" link.
 * UTC timestamps keep the event correct in every visitor timezone.
 */
export function buildGoogleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    details: event.description,
    dates: `${toCompactUtc(event.start)}/${toCompactUtc(event.end)}`,
  });

  if (event.location) {
    params.set('location', event.location);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Builds a standards-compliant single-event .ICS payload. */
export function buildIcsContent(event: CalendarEvent): string {
  return buildMultiEventIcsContent([event]);
}

/** Builds a standards-compliant multi-event .ICS payload. */
export function buildMultiEventIcsContent(events: CalendarEvent[]): string {
  const stamp = toCompactUtc(new Date());

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TurkeyThaw//Holiday Thaw Schedule//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  events.forEach((ev, idx) => {
    const uid = `${stamp}-${idx}-${Math.random().toString(36).slice(2, 10)}@turkeythaw.com`;
    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${toCompactUtc(ev.start)}`,
      `DTEND:${toCompactUtc(ev.end)}`,
      `SUMMARY:${escapeIcsText(ev.title)}`,
      `DESCRIPTION:${escapeIcsText(ev.description)}`
    );

    if (ev.location) {
      lines.push(`LOCATION:${escapeIcsText(ev.location)}`);
    }

    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}

/** Triggers a client-side .ICS download for single or multi-event payloads. */
export function downloadIcsFile(event: CalendarEvent | CalendarEvent[], filename = 'TurkeyThaw-Schedule.ics'): void {
  if (typeof window === 'undefined') return;

  const events = Array.isArray(event) ? event : [event];
  const content = buildMultiEventIcsContent(events);

  const blob = new Blob([content], {
    type: 'text/calendar;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Builds the complete holiday schedule events:
 * 1) The dynamic Thaw Start event
 * 2) The 5 Cook-Day Timeline milestones on Thanksgiving Day
 */
export function buildFullTurkeyScheduleEvents({
  thawEvent,
  weight,
  dinnerTime = '16:00',
}: {
  thawEvent: CalendarEvent;
  weight: number;
  dinnerTime?: string;
}): CalendarEvent[] {
  const [dinnerH, dinnerM] = dinnerTime.split(':').map(Number);
  const dinnerHour = dinnerH || 16;
  const dinnerMinute = dinnerM || 0;

  // Thanksgiving 2026: Thursday, Nov 26, 2026
  const makeDate = (offsetMinutesFromDinner: number) => {
    const d = new Date(2026, 10, 26, dinnerHour, dinnerMinute, 0);
    d.setMinutes(d.getMinutes() + offsetMinutesFromDinner);
    return d;
  };

  const cookDayEvents: CalendarEvent[] = [
    {
      title: `🦃 Cook-Day Step 1: Temper Turkey at Room Temp (${weight} lbs)`,
      description: `Remove ${weight} lbs thawed turkey from the refrigerator (approx. 60–90 min before prep) to take the extreme chill off the muscle tissue for even roasting. Keep on tray.`,
      start: makeDate(-540), // 9h before dinner
      end: makeDate(-480),
      location: 'Kitchen Counter',
    },
    {
      title: `🔥 Cook-Day Step 2: Preheat Oven to 325°F & Season Bird`,
      description: `Preheat oven to 325°F (163°C). Pat turkey skin thoroughly dry with paper towels. Season cavity with salt, pepper, aromatics. Tuck wings and position on roasting V-rack.`,
      start: makeDate(-255), // 4h15m before dinner
      end: makeDate(-225),
      location: 'Kitchen Oven',
    },
    {
      title: `🍗 Cook-Day Step 3: Roast Bird Unstuffed at 325°F`,
      description: `Slide ${weight} lbs turkey into 325°F oven on lower rack. Unstuffed turkey roasts at ~13–15 min/lb. Avoid opening oven door frequently to maintain ambient heat.`,
      start: makeDate(-150), // 2h30m before dinner
      end: makeDate(-90),
      location: 'Kitchen Oven',
    },
    {
      title: `🌡️ Cook-Day Step 4: Critical 165°F Internal Temperature Check`,
      description: `Insert instant-read meat probe into innermost part of the thigh, thickest part of breast, and wing joint. MUST read minimum 165°F (74°C). Pull once verified!`,
      start: makeDate(-45), // 45m before dinner
      end: makeDate(-40),
      location: 'Kitchen Oven',
    },
    {
      title: `🔪 Cook-Day Step 5: Rest 40 Minutes & Carve!`,
      description: `Transfer roast to carving board and tent loosely with foil. Resting 40 minutes allows muscle fibers to reabsorb up to 15% more juice before slicing. Happy Thanksgiving!`,
      start: makeDate(-40), // 40m before dinner
      end: makeDate(0),
      location: 'Dining / Kitchen Board',
    },
  ];

  return [thawEvent, ...cookDayEvents];
}
