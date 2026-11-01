import type { Settings, TimeInterval, WeekHours, FulfilmentMethod } from '../schemas';
import { minutesToHHmm, toMinutes, weekdayOf } from '../time/zoned';

export interface SlotWindow {
  slotId: string;
  startMinutes: number;
  endMinutes: number;
}

export const DATE_ONLY_SLOT_ID = 'day';

export function slotIdFor(startMinutes: number, endMinutes: number): string {
  return `${minutesToHHmm(startMinutes).replace(':', '')}-${minutesToHHmm(endMinutes).replace(':', '')}`;
}

export function methodConfig(settings: Settings, method: FulfilmentMethod) {
  return method === 'delivery' ? settings.delivery : settings.pickup;
}

/** Opening intervals for a method on a date: a date override wins over the weekly hours. */
export function openingIntervals(
  settings: Settings,
  method: FulfilmentMethod,
  localDate: string,
): { intervals: TimeInterval[]; source: 'override' | 'weekly' } {
  const config = methodConfig(settings, method);
  const override = config.dateOverrides.find((o) => o.date === localDate);
  if (override) return { intervals: override.intervals, source: 'override' };
  return { intervals: config.workingHours[weekdayOf(localDate)], source: 'weekly' };
}

export function buildSlotWindows(settings: Settings, intervals: TimeInterval[]): SlotWindow[] {
  const sorted = [...intervals].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (!first || !last) return [];

  if (settings.slots.mode === 'dateOnly') {
    return [
      {
        slotId: DATE_ONLY_SLOT_ID,
        startMinutes: toMinutes(first.start),
        endMinutes: toMinutes(last.end),
      },
    ];
  }

  const { durationMinutes, intervalMinutes, bufferMinutes } = settings.slots;
  const step = Math.max(intervalMinutes, durationMinutes + bufferMinutes);
  const windows: SlotWindow[] = [];
  for (const interval of sorted) {
    const end = toMinutes(interval.end);
    for (let start = toMinutes(interval.start); start + durationMinutes <= end; start += step) {
      windows.push({
        slotId: slotIdFor(start, start + durationMinutes),
        startMinutes: start,
        endMinutes: start + durationMinutes,
      });
    }
  }
  return windows;
}

/** Whether a slot sits entirely inside one of the product's custom intervals for that weekday. */
export function fitsCustomHours(window: SlotWindow, hours: WeekHours, localDate: string): boolean {
  return hours[weekdayOf(localDate)].some(
    (i) => window.startMinutes >= toMinutes(i.start) && window.endMinutes <= toMinutes(i.end),
  );
}
