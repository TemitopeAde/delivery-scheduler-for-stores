/**
 * Timezone arithmetic built only on `Intl`, so it behaves the same in the
 * backend runtime, the browser and tests. All merchant rules are evaluated in
 * the merchant's IANA zone; the host and browser zones are never consulted.
 */

const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
export type WeekdayKey = (typeof WEEKDAY_KEYS)[number];

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function partsFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatterCache.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    formatterCache.set(timeZone, formatter);
  }
  return formatter;
}

export function isValidTimeZone(timeZone: string): boolean {
  if (!timeZone) return false;
  try {
    partsFormatter(timeZone);
    return true;
  } catch {
    return false;
  }
}

export function isValidLocalDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [, y, m, d] = match;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  return (
    date.getUTCFullYear() === Number(y) &&
    date.getUTCMonth() === Number(m) - 1 &&
    date.getUTCDate() === Number(d)
  );
}

export function toMinutes(hhmm: string): number {
  const [h = '0', m = '0'] = hhmm.split(':');
  return Number(h) * 60 + Number(m);
}

export function minutesToHHmm(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function localDateToUtcMidnight(localDate: string): number {
  const [y = '1970', m = '01', d = '01'] = localDate.split('-');
  return Date.UTC(Number(y), Number(m) - 1, Number(d));
}

function utcMidnightToLocalDate(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function addDays(localDate: string, days: number): string {
  return utcMidnightToLocalDate(localDateToUtcMidnight(localDate) + days * DAY_MS);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((localDateToUtcMidnight(to) - localDateToUtcMidnight(from)) / DAY_MS);
}

export function weekdayOf(localDate: string): WeekdayKey {
  const index = new Date(localDateToUtcMidnight(localDate)).getUTCDay();
  return WEEKDAY_KEYS[index] ?? 'sun';
}

interface WallClock {
  localDate: string;
  minutes: number;
}

/** The wall-clock date and minute-of-day in `timeZone` at `instant`. */
export function wallClockAt(instant: Date, timeZone: string): WallClock {
  const parts = partsFormatter(timeZone).formatToParts(instant);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '00';
  return {
    localDate: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  };
}

/** Offset of `timeZone` from UTC at `utcMs`, in minutes (east positive). */
function offsetMinutesAt(utcMs: number, timeZone: string): number {
  const parts = partsFormatter(timeZone).formatToParts(new Date(utcMs));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? '0');
  const asUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second'),
  );
  const flooredUtc = Math.floor(utcMs / 1000) * 1000;
  return Math.round((asUtc - flooredUtc) / MINUTE_MS);
}

export type ZonedResolution =
  | { status: 'ok'; utc: Date }
  /** The wall time occurs twice (DST fall-back). `utc` is the earlier instant. */
  | { status: 'ambiguous'; utc: Date; later: Date }
  /** The wall time never occurs (DST spring-forward gap). */
  | { status: 'gap' };

/**
 * Resolves a merchant-local wall time to a UTC instant, reporting DST gaps and
 * repeated times explicitly instead of silently shifting them.
 */
export function zonedTimeToUtc(
  localDate: string,
  minutes: number,
  timeZone: string,
): ZonedResolution {
  const wallMs = localDateToUtcMidnight(localDate) + minutes * MINUTE_MS;
  // DST transitions never happen twice within 48h, so the offsets a day either
  // side bracket every candidate.
  const offsets = new Set([
    offsetMinutesAt(wallMs - DAY_MS, timeZone),
    offsetMinutesAt(wallMs + DAY_MS, timeZone),
    offsetMinutesAt(wallMs, timeZone),
  ]);
  const candidates = [...offsets]
    .map((offset) => wallMs - offset * MINUTE_MS)
    .filter((utcMs) => {
      const clock = wallClockAt(new Date(utcMs), timeZone);
      return clock.localDate === localDate && clock.minutes === minutes;
    })
    .sort((a, b) => a - b);
  const unique = [...new Set(candidates)];
  const [first, second] = unique;
  if (first === undefined) return { status: 'gap' };
  if (second === undefined) return { status: 'ok', utc: new Date(first) };
  return { status: 'ambiguous', utc: new Date(first), later: new Date(second) };
}
