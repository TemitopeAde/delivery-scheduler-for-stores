import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '../src/lib/defaults';
import { checkSelection, computeAvailability } from '../src/lib/engine/availability';
import type { AvailabilityInput, UsageCounter } from '../src/lib/engine/types';
import type { ProductRule, Settings } from '../src/lib/schemas';

const noUsage: UsageCounter = { slotCount: () => 0, dayCount: () => 0 };

const allWeek = { start: '09:00', end: '17:00' };
function settings(overrides: Partial<Settings> = {}): Settings {
  return {
    ...DEFAULT_SETTINGS,
    configured: true,
    enabled: true,
    timezone: 'Europe/London',
    minNoticeMinutes: 0,
    sameDayEnabled: true,
    maxDaysAhead: 30,
    delivery: {
      ...DEFAULT_SETTINGS.delivery,
      workingHours: {
        mon: [allWeek],
        tue: [allWeek],
        wed: [allWeek],
        thu: [allWeek],
        fri: [allWeek],
        sat: [],
        sun: [],
      },
    },
    slots: { ...DEFAULT_SETTINGS.slots, durationMinutes: 120, intervalMinutes: 120 },
    ...overrides,
  };
}

// Tuesday 2026-10-27, 08:00 London (GMT after the 25 Oct change).
const NOW = new Date('2026-10-27T08:00:00Z');

function input(s: Settings, extra: Partial<AvailabilityInput> = {}): AvailabilityInput {
  return {
    settings: s,
    method: 'delivery',
    productRules: [],
    from: '2026-10-27',
    to: '2026-11-02',
    now: NOW,
    usage: noUsage,
    plan: 'pro',
    ...extra,
  };
}

const dayOf = (r: ReturnType<typeof computeAvailability>, date: string) =>
  r.days.find((d) => d.date === date);

describe('computeAvailability', () => {
  it('builds slots from working hours and skips non-working days', () => {
    const r = computeAvailability(input(settings()));
    expect(dayOf(r, '2026-10-27')?.slots.map((s) => s.slotId)).toEqual([
      '0900-1100',
      '1100-1300',
      '1300-1500',
      '1500-1700',
    ]);
    expect(dayOf(r, '2026-10-31')).toMatchObject({ available: false, reason: 'closed' });
  });

  it('treats an unconfigured or disabled site as unavailable', () => {
    const r = computeAvailability(input(settings({ configured: false })));
    expect(r.methodAvailable).toBe(false);
    expect(r.methodReason).toBe('disabled');
  });

  it('lets vacation closures win over date overrides that would open the day', () => {
    const s = settings({
      vacationRanges: [{ start: '2026-10-28', end: '2026-10-29', label: 'Away' }],
      delivery: {
        ...settings().delivery,
        dateOverrides: [{ date: '2026-10-28', intervals: [allWeek] }],
      },
    });
    expect(dayOf(computeAvailability(input(s)), '2026-10-28')?.reason).toBe('vacation');
  });

  it('applies global blocked dates and recurring holidays', () => {
    const s = settings({
      blockedDates: ['2026-10-28'],
      holidayRules: [{ name: 'Test', monthDay: '10-29' }],
    });
    const r = computeAvailability(input(s));
    expect(dayOf(r, '2026-10-28')?.reason).toBe('blocked_date');
    expect(dayOf(r, '2026-10-29')?.reason).toBe('holiday');
  });

  it('enforces minimum notice on slot start instants', () => {
    const r = computeAvailability(input(settings({ minNoticeMinutes: 4 * 60 })));
    const today = dayOf(r, '2026-10-27');
    // 08:00 + 4h = 12:00, so 09:00 and 11:00 starts are too soon.
    expect(today?.slots.map((s) => s.available)).toEqual([false, false, true, true]);
  });

  it('moves the first orderable date after the cut-off time', () => {
    const s = settings({ cutoff: { enabled: true, time: '07:00' } });
    const r = computeAvailability(input(s));
    expect(dayOf(r, '2026-10-27')?.reason).toBe('cutoff');
    expect(dayOf(r, '2026-10-28')?.available).toBe(true);
  });

  it('excludes same-day when disabled', () => {
    const r = computeAvailability(input(settings({ sameDayEnabled: false })));
    expect(dayOf(r, '2026-10-27')?.reason).toBe('too_soon');
  });

  it('respects the booking horizon and clamps it on Basic', () => {
    const s = settings({ maxDaysAhead: 60 });
    const far = { from: '2026-12-01', to: '2026-12-01' };
    expect(computeAvailability(input(s, { ...far, plan: 'pro' })).days[0]?.available).toBe(true);
    expect(computeAvailability(input(s, { ...far, plan: 'basic' })).days[0]?.reason).toBe(
      'beyond_horizon',
    );
  });

  it('marks full slots and full days as fully booked', () => {
    const s = settings({
      slots: { ...settings().slots, defaultCapacity: 2 },
      delivery: { ...settings().delivery, dailyCapacity: 5 },
    });
    const usage: UsageCounter = {
      slotCount: (_m, _d, slotId) => (slotId === '0900-1100' ? 2 : 0),
      dayCount: (_m, d) => (d === '2026-10-28' ? 5 : 2),
    };
    const r = computeAvailability(input(s, { usage }));
    const slot = dayOf(r, '2026-10-27')?.slots[0];
    expect(slot).toMatchObject({ available: false, reason: 'fully_booked', remaining: 0 });
    expect(dayOf(r, '2026-10-27')?.slots[1]?.remaining).toBe(2);
    expect(dayOf(r, '2026-10-28')).toMatchObject({ available: false, reason: 'fully_booked' });
  });

  it('applies product preparation time and method eligibility on Pro only', () => {
    const rule: ProductRule = {
      productId: 'p1',
      productName: 'Cake',
      enabled: true,
      preparationMinutes: 48 * 60,
      allowedFulfilmentMethods: ['pickup'],
      requiredScheduling: true,
      customWorkingHours: null,
      updatedAt: null,
    };
    const pro = computeAvailability(input(settings(), { productRules: [rule] }));
    expect(pro.methodReason).toBe('product_ineligible');

    const deliverable = { ...rule, allowedFulfilmentMethods: ['delivery' as const] };
    const prep = computeAvailability(input(settings(), { productRules: [deliverable] }));
    expect(dayOf(prep, '2026-10-28')?.available).toBe(false);
    expect(dayOf(prep, '2026-10-29')?.slots.some((s) => s.available)).toBe(true);

    const basic = computeAvailability(input(settings(), { productRules: [rule], plan: 'basic' }));
    expect(basic.methodAvailable).toBe(true);
  });

  it('requires pickup to have a location before offering it', () => {
    const s = settings({ pickup: { ...settings().pickup, enabled: true, locationName: '' } });
    expect(computeAvailability(input(s, { method: 'pickup' })).methodReason).toBe(
      'method_unavailable',
    );
  });

  it('drops slots that fall into a DST gap', () => {
    const s = settings({
      timezone: 'America/New_York',
      delivery: {
        ...settings().delivery,
        dateOverrides: [{ date: '2026-03-08', intervals: [{ start: '01:00', end: '05:00' }] }],
      },
      slots: { ...settings().slots, durationMinutes: 60, intervalMinutes: 60 },
    });
    const r = computeAvailability(
      input(s, { from: '2026-03-08', to: '2026-03-08', now: new Date('2026-03-01T00:00:00Z') }),
    );
    const ids = r.days[0]?.slots.map((x) => x.slotId);
    expect(ids).toEqual(['0100-0200', '0300-0400', '0400-0500']);
  });

  it('offers one slot per day in date-only mode', () => {
    const s = settings({ slots: { ...settings().slots, mode: 'dateOnly' } });
    const day = dayOf(computeAvailability(input(s)), '2026-10-28');
    expect(day?.slots).toHaveLength(1);
    expect(day?.slots[0]).toMatchObject({ slotId: 'day', startLocal: '09:00', endLocal: '17:00' });
  });
});

describe('checkSelection', () => {
  it('rejects unknown slots and accepts valid ones', () => {
    const base = input(settings());
    expect(checkSelection(base, '2026-10-28', '0800-1000', { ignoreCapacity: false })).toEqual({
      ok: false,
      reason: 'unknown_slot',
    });
    expect(checkSelection(base, '2026-10-28', '0900-1100', { ignoreCapacity: false }).ok).toBe(true);
  });

  it('can ignore capacity for a caller that already owns the lock', () => {
    const s = settings({ slots: { ...settings().slots, defaultCapacity: 1 } });
    const usage: UsageCounter = { slotCount: () => 1, dayCount: () => 1 };
    const base = input(s, { usage });
    expect(checkSelection(base, '2026-10-28', '0900-1100', { ignoreCapacity: false }).ok).toBe(false);
    expect(checkSelection(base, '2026-10-28', '0900-1100', { ignoreCapacity: true }).ok).toBe(true);
  });
});
