import { BASIC_MAX_DAYS_AHEAD } from '../constants';
import type { FulfilmentMethod, ProductRule, Settings } from '../schemas';
import {
  addDays,
  daysBetween,
  minutesToHHmm,
  toMinutes,
  wallClockAt,
  weekdayOf,
  zonedTimeToUtc,
} from '../time/zoned';
import {
  buildSlotWindows,
  fitsCustomHours,
  methodConfig,
  openingIntervals,
  type SlotWindow,
} from './slots';
import type {
  AvailabilityInput,
  AvailabilityResult,
  DayAvailability,
  Plan,
  SlotAvailability,
  UnavailableReason,
} from './types';

const MINUTE_MS = 60_000;

interface ProductConstraints {
  eligible: boolean;
  preparationMinutes: number;
  customHours: NonNullable<ProductRule['customWorkingHours']>[];
}

/** Product rules are a Pro feature; on Basic they are ignored entirely. */
export function productConstraints(
  rules: ProductRule[],
  method: FulfilmentMethod,
  plan: Plan,
): ProductConstraints {
  const active = plan === 'pro' ? rules.filter((r) => r.enabled) : [];
  return {
    eligible: active.every((r) => r.allowedFulfilmentMethods.includes(method)),
    preparationMinutes: active.reduce((max, r) => Math.max(max, r.preparationMinutes), 0),
    customHours: active.flatMap((r) => (r.customWorkingHours ? [r.customWorkingHours] : [])),
  };
}

export function effectiveMaxDaysAhead(settings: Settings, plan: Plan): number {
  return plan === 'pro' ? settings.maxDaysAhead : Math.min(settings.maxDaysAhead, BASIC_MAX_DAYS_AHEAD);
}

export function methodUnavailableReason(
  settings: Settings,
  method: FulfilmentMethod,
  constraints: ProductConstraints,
): UnavailableReason | null {
  if (!settings.configured || !settings.enabled) return 'disabled';
  const config = methodConfig(settings, method);
  if (!config.enabled) return 'method_unavailable';
  if (method === 'pickup') {
    const hasHours = Object.values(settings.pickup.workingHours).some((d) => d.length > 0);
    const hasOverrideHours = settings.pickup.dateOverrides.some((o) => o.intervals.length > 0);
    if (!settings.pickup.locationName.trim() || (!hasHours && !hasOverrideHours)) {
      return 'method_unavailable';
    }
  }
  if (!constraints.eligible) return 'product_ineligible';
  return null;
}

function isHoliday(settings: Settings, localDate: string): boolean {
  const monthDay = localDate.slice(5);
  return settings.holidayRules.some((h) => h.monthDay === monthDay);
}

function inVacation(settings: Settings, localDate: string): boolean {
  return settings.vacationRanges.some((r) => localDate >= r.start && localDate <= r.end);
}

interface DayContext {
  today: string;
  /** First date orders may target once the cut-off and same-day rules are applied. */
  firstOrderableDate: string;
  cutoffApplied: boolean;
  latestDate: string;
  earliestInstantMs: number;
}

function dayLevelReason(
  settings: Settings,
  method: FulfilmentMethod,
  date: string,
  ctx: DayContext,
): UnavailableReason | null {
  // Precedence follows the spec: closures, then blocks, then hours, then timing, then horizon.
  if (inVacation(settings, date)) return 'vacation';
  if (settings.blockedDates.includes(date)) return 'blocked_date';
  if (isHoliday(settings, date)) return 'holiday';
  if (methodConfig(settings, method).blockedDates.includes(date)) return 'blocked_date';
  if (openingIntervals(settings, method, date).intervals.length === 0) return 'closed';
  if (date < ctx.firstOrderableDate) {
    return ctx.cutoffApplied && date >= ctx.today ? 'cutoff' : 'too_soon';
  }
  if (date > ctx.latestDate) return 'beyond_horizon';
  return null;
}

function slotCapacity(settings: Settings): number {
  return settings.slots.defaultCapacity;
}

function evaluateSlot(
  input: AvailabilityInput,
  date: string,
  window: SlotWindow,
  constraints: ProductConstraints,
  ctx: DayContext,
  dayRemaining: number | null,
): SlotAvailability | null {
  const { settings, method, usage, plan } = input;
  const start = zonedTimeToUtc(date, window.startMinutes, settings.timezone);
  // A slot starting inside a DST gap does not exist on that day, so it is not offered.
  if (start.status === 'gap') return null;
  const end = zonedTimeToUtc(date, window.endMinutes, settings.timezone);
  // An end inside the gap (e.g. 01:00–02:00 on spring-forward day) ends after the real duration.
  const endUtc =
    end.status === 'gap'
      ? new Date(start.utc.getTime() + (window.endMinutes - window.startMinutes) * MINUTE_MS)
      : end.utc;

  const capacity = slotCapacity(settings);
  const used = usage.slotCount(method, date, window.slotId);
  const remaining = capacity > 0 ? Math.max(0, capacity - used) : null;

  let reason: UnavailableReason | null = null;
  if (constraints.customHours.some((hours) => !fitsCustomHours(window, hours, date))) {
    reason = 'closed';
  } else if (start.utc.getTime() < ctx.earliestInstantMs) {
    reason = 'too_soon';
  } else if (remaining === 0 || dayRemaining === 0) {
    reason = 'fully_booked';
  }

  const customLabel = plan === 'pro' ? settings.slots.labels[window.slotId] : undefined;
  return {
    slotId: window.slotId,
    startLocal: minutesToHHmm(window.startMinutes),
    endLocal: minutesToHHmm(window.endMinutes),
    startUtc: start.utc.toISOString(),
    endUtc: endUtc.toISOString(),
    label: customLabel ?? null,
    available: reason === null,
    reason,
    remaining: remaining === null ? null : Math.min(remaining, dayRemaining ?? remaining),
    ambiguous: start.status === 'ambiguous' || end.status === 'ambiguous',
  };
}

function summarizeDayReason(slots: SlotAvailability[]): UnavailableReason {
  if (slots.length === 0) return 'closed';
  if (slots.every((s) => s.reason === 'fully_booked')) return 'fully_booked';
  const firstReason = slots.find((s) => s.reason !== null)?.reason;
  return firstReason ?? 'closed';
}

export function buildDayContext(input: AvailabilityInput, preparationMinutes: number): DayContext {
  const { settings, now, plan } = input;
  const clock = wallClockAt(now, settings.timezone);
  const today = clock.localDate;
  const cutoffApplied =
    settings.cutoff.enabled && clock.minutes >= toMinutes(settings.cutoff.time);
  const effectiveToday = cutoffApplied ? addDays(today, 1) : today;
  const firstOrderableDate = settings.sameDayEnabled ? effectiveToday : addDays(effectiveToday, 1);
  const noticeMinutes = Math.max(settings.minNoticeMinutes, preparationMinutes);
  return {
    today,
    firstOrderableDate,
    cutoffApplied,
    latestDate: addDays(today, effectiveMaxDaysAhead(settings, plan)),
    earliestInstantMs: now.getTime() + noticeMinutes * MINUTE_MS,
  };
}

export function computeAvailability(input: AvailabilityInput): AvailabilityResult {
  const { settings, method, productRules, plan, usage } = input;
  const constraints = productConstraints(productRules, method, plan);
  const ctx = buildDayContext(input, constraints.preparationMinutes);
  const methodReason = methodUnavailableReason(settings, method, constraints);

  const days: DayAvailability[] = [];
  const span = Math.max(0, daysBetween(input.from, input.to));
  for (let offset = 0; offset <= span; offset += 1) {
    const date = addDays(input.from, offset);
    const weekday = weekdayOf(date);
    const dayReason = methodReason ?? dayLevelReason(settings, method, date, ctx);
    if (dayReason) {
      days.push({ date, weekday, available: false, reason: dayReason, slots: [] });
      continue;
    }

    const dailyCapacity = methodConfig(settings, method).dailyCapacity;
    const dayRemaining =
      dailyCapacity > 0 ? Math.max(0, dailyCapacity - usage.dayCount(method, date)) : null;
    const windows = buildSlotWindows(settings, openingIntervals(settings, method, date).intervals);
    const slots = windows
      .map((w) => evaluateSlot(input, date, w, constraints, ctx, dayRemaining))
      .filter((s): s is SlotAvailability => s !== null);
    const available = slots.some((s) => s.available);
    days.push({
      date,
      weekday,
      available,
      reason: available ? null : summarizeDayReason(slots),
      slots,
    });
  }

  return {
    method,
    timezone: settings.timezone,
    settingsRevision: settings.settingsRevision,
    today: ctx.today,
    latestDate: ctx.latestDate,
    methodAvailable: methodReason === null,
    methodReason,
    preparationMinutes: constraints.preparationMinutes,
    days,
  };
}

export type SelectionCheck =
  | { ok: true; slot: SlotAvailability }
  | { ok: false; reason: UnavailableReason | 'unknown_slot' };

/**
 * Re-evaluates one selection. With `ignoreCapacity`, capacity is skipped: used
 * when the caller already owns the capacity lock and only the rules must hold.
 */
export function checkSelection(
  input: Omit<AvailabilityInput, 'from' | 'to'>,
  localDate: string,
  slotId: string,
  options: { ignoreCapacity: boolean },
): SelectionCheck {
  const usage = options.ignoreCapacity
    ? { slotCount: () => 0, dayCount: () => 0 }
    : input.usage;
  const result = computeAvailability({ ...input, usage, from: localDate, to: localDate });
  const day = result.days[0];
  if (!day) return { ok: false, reason: 'unknown_slot' };
  if (day.reason && day.slots.length === 0) return { ok: false, reason: day.reason };
  const slot = day.slots.find((s) => s.slotId === slotId);
  if (!slot) return { ok: false, reason: 'unknown_slot' };
  if (!slot.available) return { ok: false, reason: slot.reason ?? 'closed' };
  return { ok: true, slot };
}
