import { describe, expect, it } from 'vitest';
import {
  addDays,
  isValidLocalDate,
  wallClockAt,
  weekdayOf,
  zonedTimeToUtc,
} from '../src/lib/time/zoned';

describe('zonedTimeToUtc', () => {
  it('resolves an ordinary wall time', () => {
    const r = zonedTimeToUtc('2026-07-15', 9 * 60, 'America/New_York');
    expect(r).toEqual({ status: 'ok', utc: new Date('2026-07-15T13:00:00.000Z') });
  });

  it('reports the spring-forward gap instead of shifting the time', () => {
    // 2026-03-08 02:30 does not exist in New York.
    expect(zonedTimeToUtc('2026-03-08', 2 * 60 + 30, 'America/New_York')).toEqual({
      status: 'gap',
    });
  });

  it('reports the repeated fall-back hour and returns the earlier instant', () => {
    const r = zonedTimeToUtc('2026-11-01', 60 + 30, 'America/New_York');
    expect(r.status).toBe('ambiguous');
    if (r.status !== 'ambiguous') return;
    expect(r.utc.toISOString()).toBe('2026-11-01T05:30:00.000Z');
    expect(r.later.toISOString()).toBe('2026-11-01T06:30:00.000Z');
  });

  it('handles zones east of UTC across the date line', () => {
    const r = zonedTimeToUtc('2026-01-01', 8 * 60, 'Pacific/Auckland');
    expect(r).toEqual({ status: 'ok', utc: new Date('2025-12-31T19:00:00.000Z') });
  });
});

describe('date helpers', () => {
  it('reads the merchant wall clock, not the host clock', () => {
    const clock = wallClockAt(new Date('2026-07-15T23:30:00Z'), 'Asia/Tokyo');
    expect(clock).toEqual({ localDate: '2026-07-16', minutes: 8 * 60 + 30 });
  });

  it('adds days and names weekdays without timezone drift', () => {
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
    expect(addDays('2026-03-07', 2)).toBe('2026-03-09');
    expect(weekdayOf('2026-10-27')).toBe('tue');
  });

  it('validates calendar dates', () => {
    expect(isValidLocalDate('2026-02-29')).toBe(false);
    expect(isValidLocalDate('2028-02-29')).toBe(true);
    expect(isValidLocalDate('2026-13-01')).toBe(false);
  });
});
