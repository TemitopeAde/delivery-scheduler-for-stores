import type { FulfilmentMethod, ProductRule, Settings } from '../schemas';
import type { WeekdayKey } from '../time/zoned';

export type Plan = 'basic' | 'pro';

export type UnavailableReason =
  | 'disabled'
  | 'vacation'
  | 'method_unavailable'
  | 'product_ineligible'
  | 'blocked_date'
  | 'holiday'
  | 'closed'
  | 'cutoff'
  | 'too_soon'
  | 'beyond_horizon'
  | 'fully_booked';

export interface UsageCounter {
  slotCount(method: FulfilmentMethod, localDate: string, slotId: string): number;
  dayCount(method: FulfilmentMethod, localDate: string): number;
}

export interface SlotAvailability {
  slotId: string;
  startLocal: string;
  endLocal: string;
  startUtc: string;
  endUtc: string;
  /** Merchant label, when one is configured and the plan allows custom labels. */
  label: string | null;
  available: boolean;
  reason: UnavailableReason | null;
  /** Remaining capacity, or null when the slot is unlimited. */
  remaining: number | null;
  /** True when the start falls in a repeated DST hour; the earlier instant is used. */
  ambiguous: boolean;
}

export interface DayAvailability {
  date: string;
  weekday: WeekdayKey;
  available: boolean;
  reason: UnavailableReason | null;
  slots: SlotAvailability[];
}

export interface AvailabilityInput {
  settings: Settings;
  method: FulfilmentMethod;
  productRules: ProductRule[];
  from: string;
  to: string;
  now: Date;
  usage: UsageCounter;
  plan: Plan;
}

export interface AvailabilityResult {
  method: FulfilmentMethod;
  timezone: string;
  settingsRevision: number;
  today: string;
  latestDate: string;
  methodAvailable: boolean;
  methodReason: UnavailableReason | null;
  preparationMinutes: number;
  days: DayAvailability[];
}
