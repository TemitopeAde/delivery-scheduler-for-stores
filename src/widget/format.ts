/**
 * Locale-aware formatting. Dates are formatted as calendar dates (never shifted
 * by the browser zone); times are formatted in the merchant's zone.
 */

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeLocale(locale: string): string {
  try {
    return Intl.DateTimeFormat.supportedLocalesOf([locale])[0] ?? 'en';
  } catch {
    return 'en';
  }
}

function calendarDate(localDate: string): Date {
  const [y = '1970', m = '01', d = '01'] = localDate.split('-');
  return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d), 12));
}

export function formatDate(
  localDate: string,
  locale: string,
  dateStyle: 'short' | 'medium' | 'long' | 'full',
): string {
  return new Intl.DateTimeFormat(safeLocale(locale), { dateStyle, timeZone: 'UTC' }).format(
    calendarDate(localDate),
  );
}

export function formatMonth(month: string, locale: string): string {
  return new Intl.DateTimeFormat(safeLocale(locale), {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(calendarDate(`${month}-01`));
}

export function weekdayNames(locale: string, firstDay: number): Array<{ short: string; long: string }> {
  const shortFmt = new Intl.DateTimeFormat(safeLocale(locale), { weekday: 'short', timeZone: 'UTC' });
  const longFmt = new Intl.DateTimeFormat(safeLocale(locale), { weekday: 'long', timeZone: 'UTC' });
  // 2023-01-01 was a Sunday (day 0); ISO firstDay 7 also means Sunday.
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(Date.UTC(2023, 0, 1 + ((firstDay % 7) + i), 12));
    return { short: shortFmt.format(day), long: longFmt.format(day) };
  });
}

export function formatTime(
  isoInstant: string,
  timeZone: string,
  locale: string,
  hourCycle: 'h12' | 'h23',
): string {
  return new Intl.DateTimeFormat(safeLocale(locale), {
    hour: 'numeric',
    minute: '2-digit',
    hourCycle,
    timeZone,
  }).format(new Date(isoInstant));
}

export function formatTimeRange(
  startUtc: string,
  endUtc: string,
  timeZone: string,
  locale: string,
  hourCycle: 'h12' | 'h23',
): string {
  return `${formatTime(startUtc, timeZone, locale, hourCycle)} – ${formatTime(endUtc, timeZone, locale, hourCycle)}`;
}

export function timeZoneLabel(timeZone: string, locale: string): string {
  try {
    const parts = new Intl.DateTimeFormat(safeLocale(locale), {
      timeZone,
      timeZoneName: 'long',
    }).formatToParts(new Date());
    return parts.find((p) => p.type === 'timeZoneName')?.value ?? timeZone;
  } catch {
    return timeZone;
  }
}

/** First day of week from the locale (1 = Monday … 7 = Sunday), Monday when unknown. */
export function firstDayOfWeek(locale: string): number {
  try {
    const info: unknown = Reflect.get(new Intl.Locale(safeLocale(locale)), 'weekInfo');
    if (info && typeof info === 'object' && 'firstDay' in info) {
      const day = (info as { firstDay: unknown }).firstDay;
      if (typeof day === 'number') return day;
    }
  } catch {
    // Older engines have no weekInfo.
  }
  return 1;
}
