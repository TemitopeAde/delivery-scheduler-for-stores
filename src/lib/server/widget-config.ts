import { MAX_AVAILABILITY_RANGE_DAYS } from '../constants';
import { computeAvailability, productConstraints, methodUnavailableReason } from '../engine/availability';
import type { AvailabilityResult, UnavailableReason } from '../engine/types';
import { resolveMessages, type Messages } from '../i18n/messages';
import { FULFILMENT_METHODS, type Appearance, type FulfilmentMethod } from '../schemas';
import { addDays, daysBetween, wallClockAt } from '../time/zoned';
import { resolveCheckout } from './checkout-context';
import { currentHold, type PublicHold } from './holds';
import { loadUsage } from './lock-store';
import { isSchedulingRequired, loadSchedulingContext } from './scheduling-context';

export interface WidgetPayload {
  enabled: boolean;
  required: boolean;
  settingsRevision: number;
  timezone: string;
  slotMode: 'timeslots' | 'dateOnly';
  showRemaining: boolean;
  holdMinutes: number;
  methods: Array<{ method: FulfilmentMethod; available: boolean; reason: UnavailableReason | null }>;
  availability: AvailabilityResult | null;
  appearance: Appearance;
  locale: string;
  dateStyle: 'short' | 'medium' | 'long' | 'full';
  hourCycle: 'h12' | 'h23';
  messages: Messages;
  pickup: { locationName: string; locationAddress: string; instructions: string } | null;
  deliveryNote: string;
  currentHold: PublicHold | null;
}

/**
 * Everything the checkout widget needs in one response. Products come from the
 * checkout itself (server-side), so a client cannot change rules by lying about its cart.
 */
export async function widgetPayload(args: {
  checkoutId: string;
  method?: FulfilmentMethod | undefined;
  from?: string | undefined;
  to?: string | undefined;
  locale?: string | undefined;
}): Promise<WidgetPayload> {
  const now = new Date();
  const checkoutCtx = await resolveCheckout(args.checkoutId);
  const ctx = await loadSchedulingContext(checkoutCtx.items);
  const { settings, plan, rules } = ctx;
  const locale = args.locale || settings.translations.defaultLocale;
  const hold = await currentHold(args.checkoutId, now);

  const methods = FULFILMENT_METHODS.map((method) => {
    const reason = methodUnavailableReason(settings, method, productConstraints(rules, method, plan));
    return { method, available: reason === null, reason };
  });
  const enabled = checkoutCtx.items.length > 0 && methods.some((m) => m.available);
  const method =
    args.method ??
    hold?.method ??
    (methods.length === 1 || methods.filter((m) => m.available).length === 1
      ? methods.find((m) => m.available)?.method
      : undefined);

  let availability: AvailabilityResult | null = null;
  if (enabled && method) {
    const today = wallClockAt(now, settings.timezone).localDate;
    const from = args.from && args.from >= today ? args.from : today;
    let to = args.to ?? addDays(from, MAX_AVAILABILITY_RANGE_DAYS - 1);
    if (daysBetween(from, to) >= MAX_AVAILABILITY_RANGE_DAYS) to = addDays(from, MAX_AVAILABILITY_RANGE_DAYS - 1);
    if (to < from) to = from;
    const usage = await loadUsage(method, from, to, now);
    availability = computeAvailability({ settings, method, productRules: rules, from, to, now, usage, plan });
  }

  return {
    enabled,
    required: isSchedulingRequired(ctx, checkoutCtx.items),
    settingsRevision: settings.settingsRevision,
    timezone: settings.timezone,
    slotMode: settings.slots.mode,
    showRemaining: settings.slots.defaultCapacity > 0,
    holdMinutes: settings.holdMinutes,
    methods,
    availability,
    appearance: settings.appearance,
    locale,
    dateStyle: settings.translations.dateStyle,
    hourCycle: settings.translations.hourCycle,
    messages: resolveMessages(locale, plan === 'pro' ? settings.translations.overrides : {}),
    pickup: settings.pickup.enabled
      ? {
          locationName: settings.pickup.locationName,
          locationAddress: settings.pickup.locationAddress,
          instructions: settings.pickup.instructions,
        }
      : null,
    deliveryNote: settings.delivery.note,
    currentHold: hold,
  };
}
