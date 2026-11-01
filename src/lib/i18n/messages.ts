/**
 * Customer-facing copy, keyed so nothing in the widget or validator is
 * hard-coded. Merchants override any key per locale in Appearance settings;
 * missing keys fall back to the locale's base language, then to English.
 *
 * Only English ships today. TARGET_LOCALES lists the locales the product
 * commits to; each needs a reviewed translation catalogue before launch.
 */
export const MESSAGES_EN = {
  'widget.title': 'Choose your delivery or pickup time',
  'widget.subtitle': '',
  'widget.helper': '',
  'widget.required': 'Required',
  'widget.optional': 'Optional',
  'method.legend': 'How would you like to receive your order?',
  'method.delivery': 'Delivery',
  'method.pickup': 'Pickup',
  'date.label': 'Date',
  'time.label': 'Time',
  'calendar.previousMonth': 'Previous month',
  'calendar.nextMonth': 'Next month',
  'calendar.unavailable': 'Unavailable',
  'slot.remaining': '{count} left',
  'slot.full': 'Full',
  'slot.allDay': 'Any time during opening hours',
  'timezone.note': 'Times are shown in {timezone}.',
  'state.loading': 'Loading available times…',
  'state.saving': 'Saving your selection…',
  'state.empty': 'There are no available times right now. Please contact the store.',
  'state.error': 'We couldn’t load available times. Please try again.',
  'state.retry': 'Try again',
  'state.offline': 'You appear to be offline. Reconnect to choose a time.',
  'selection.confirmed': 'Selected: {date}, {time}',
  'selection.confirmedDateOnly': 'Selected: {date}',
  'selection.change': 'Change',
  'selection.remove': 'Remove selection',
  'selection.removed': 'Your delivery time selection was removed.',
  'selection.expiresSoon': 'We’ll hold this time for {minutes} minutes.',
  'pickup.location': 'Pickup from {location}',
  'reason.closed': 'Closed',
  'reason.blocked_date': 'Unavailable',
  'reason.holiday': 'Holiday',
  'reason.vacation': 'Closed',
  'reason.cutoff': 'Ordering cut-off has passed',
  'reason.too_soon': 'Not enough notice',
  'reason.beyond_horizon': 'Too far ahead',
  'reason.fully_booked': 'Fully booked',
  'error.slotFull': 'That time was just booked. Please choose another.',
  'error.slotUnavailable': 'That time is no longer available. Please choose another.',
  'error.stale': 'Available times have changed. Please choose again.',
  'error.generic': 'Something went wrong. Please try again.',
  'validation.required': 'Please choose a delivery or pickup time before placing your order.',
  'validation.expired': 'Your selected time is no longer reserved. Please choose a time again.',
  'validation.unavailable': 'Your selected time is no longer available. Please choose another time.',
  'validation.unverified': 'We couldn’t confirm your delivery time. Please refresh the page and try again.',
} as const;

export type MessageKey = keyof typeof MESSAGES_EN;
export type Messages = Record<MessageKey, string>;

export const MESSAGE_KEYS = Object.keys(MESSAGES_EN) as MessageKey[];

export const TARGET_LOCALES = [
  'en', 'es', 'fr', 'de', 'pt', 'it', 'nl', 'pl', 'tr', 'ru',
  'ja', 'ko', 'zh', 'ar', 'he', 'hi', 'sv', 'da', 'no', 'cs',
] as const;

const CATALOGUES: Record<string, Partial<Messages>> = { en: MESSAGES_EN };

const RTL_LANGUAGES = new Set(['ar', 'he', 'fa', 'ur']);

export function isRtl(locale: string): boolean {
  return RTL_LANGUAGES.has(locale.split('-')[0] ?? '');
}

export function resolveMessages(
  locale: string,
  overrides: Record<string, Record<string, string>>,
): Messages {
  const base = locale.split('-')[0] ?? 'en';
  const merged: Record<string, string> = { ...MESSAGES_EN };
  for (const layer of [CATALOGUES[base], CATALOGUES[locale], overrides[base], overrides[locale]]) {
    if (!layer) continue;
    for (const [key, value] of Object.entries(layer)) {
      if (key in MESSAGES_EN && typeof value === 'string' && value.trim()) merged[key] = value;
    }
  }
  return merged as Messages;
}

export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in values ? String(values[name]) : match,
  );
}
