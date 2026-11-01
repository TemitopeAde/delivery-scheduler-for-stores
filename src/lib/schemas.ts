import { z } from 'zod';
import { MAX_DAYS_AHEAD_LIMIT } from './constants';
import { isValidLocalDate, isValidTimeZone, toMinutes } from './time/zoned';

export const FULFILMENT_METHODS = ['delivery', 'pickup'] as const;
export const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
export const REQUIRED_MODES = ['all', 'selectedProducts', 'optional'] as const;
export const SLOT_MODES = ['timeslots', 'dateOnly'] as const;
export const FONT_FAMILIES = [
  'Arial',
  'Helvetica',
  'Verdana',
  'Tahoma',
  'Trebuchet MS',
  'Georgia',
  'Times New Roman',
  'Courier New',
] as const;
export const SLOT_STYLES = ['outline', 'filled'] as const;
export const HOUR_CYCLES = ['h12', 'h23'] as const;
export const DATE_STYLES = ['short', 'medium', 'long', 'full'] as const;

export const SCHEDULE_STATUSES = [
  'scheduled',
  'preparing',
  'ready',
  'out_for_delivery',
  'completed',
  'needs_review',
  'missing',
  'cancelled',
] as const;
/** Statuses a merchant may set by hand. The rest are owned by the sync logic. */
export const MERCHANT_SCHEDULE_STATUSES = [
  'scheduled',
  'preparing',
  'ready',
  'out_for_delivery',
  'completed',
] as const;

export const RESERVATION_STATUSES = [
  'held',
  'confirmed',
  'released',
  'expired',
  'needs_review',
  'cancelled',
] as const;

export const fulfilmentMethodSchema = z.enum(FULFILMENT_METHODS);
export const weekdaySchema = z.enum(WEEKDAYS);

export const hhmmSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:mm (24-hour) format');

export const localDateSchema = z
  .string()
  .refine(isValidLocalDate, 'Use a valid YYYY-MM-DD date');

export const monthDaySchema = z
  .string()
  .regex(/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, 'Use MM-DD format');

export const hexColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Use a 6-digit hex color such as #1a1a1a');

export const timeIntervalSchema = z
  .object({ start: hhmmSchema, end: hhmmSchema })
  .refine((v) => toMinutes(v.start) < toMinutes(v.end), {
    message: 'Opening time must be before closing time',
  });

export const weekHoursSchema = z.object({
  mon: z.array(timeIntervalSchema).max(6),
  tue: z.array(timeIntervalSchema).max(6),
  wed: z.array(timeIntervalSchema).max(6),
  thu: z.array(timeIntervalSchema).max(6),
  fri: z.array(timeIntervalSchema).max(6),
  sat: z.array(timeIntervalSchema).max(6),
  sun: z.array(timeIntervalSchema).max(6),
});

export const dateOverrideSchema = z.object({
  date: localDateSchema,
  /** Empty list means closed for that date. */
  intervals: z.array(timeIntervalSchema).max(6),
});

const methodBaseSchema = z.object({
  enabled: z.boolean(),
  workingHours: weekHoursSchema,
  blockedDates: z.array(localDateSchema).max(366),
  dateOverrides: z.array(dateOverrideSchema).max(366),
  /** 0 means unlimited. */
  dailyCapacity: z.number().int().min(0).max(100000),
});

export const deliveryConfigSchema = methodBaseSchema.extend({
  note: z.string().max(500),
});

export const pickupConfigSchema = methodBaseSchema.extend({
  locationName: z.string().max(120),
  locationAddress: z.string().max(300),
  instructions: z.string().max(500),
});

export const slotConfigSchema = z
  .object({
    mode: z.enum(SLOT_MODES),
    durationMinutes: z.number().int().min(15).max(720),
    intervalMinutes: z.number().int().min(15).max(720),
    bufferMinutes: z.number().int().min(0).max(240),
    /** 0 means unlimited. */
    defaultCapacity: z.number().int().min(0).max(100000),
    /** Merchant-defined labels keyed by slot ID (`HHmm-HHmm`). */
    labels: z.record(z.string().regex(/^\d{4}-\d{4}$/), z.string().min(1).max(60)),
  })
  .refine((v) => v.intervalMinutes >= v.durationMinutes || v.mode === 'dateOnly', {
    message: 'Slot interval must be at least the slot duration',
    path: ['intervalMinutes'],
  });

export const cutoffSchema = z.object({
  enabled: z.boolean(),
  /** After this merchant-local time, today counts as already closed for ordering. */
  time: hhmmSchema,
});

export const holidayRuleSchema = z.object({
  name: z.string().min(1).max(80),
  monthDay: monthDaySchema,
});

export const vacationRangeSchema = z
  .object({
    start: localDateSchema,
    end: localDateSchema,
    label: z.string().max(80),
  })
  .refine((v) => v.start <= v.end, { message: 'Start must be on or before end' });

export const appearanceSchema = z.object({
  fontFamily: z.enum(FONT_FAMILIES),
  fontSize: z.number().int().min(12).max(22),
  fontWeight: z.union([z.literal(400), z.literal(500), z.literal(600), z.literal(700)]),
  textColor: hexColorSchema,
  backgroundColor: hexColorSchema,
  borderColor: hexColorSchema,
  accentColor: hexColorSchema,
  accentTextColor: hexColorSchema,
  borderRadius: z.number().int().min(0).max(24),
  spacing: z.number().int().min(4).max(24),
  slotStyle: z.enum(SLOT_STYLES),
  /** When false, colours come from the checkout's own brand (`slotBrand`). */
  useCustomColors: z.boolean(),
});

export const translationsSchema = z.object({
  /** BCP 47 locale used when the checkout does not supply one. */
  defaultLocale: z.string().regex(/^[a-z]{2,3}(-[A-Z]{2})?$/),
  dateStyle: z.enum(DATE_STYLES),
  hourCycle: z.enum(HOUR_CYCLES),
  /** Merchant copy overrides keyed by locale, then by message key. */
  overrides: z.record(z.string(), z.record(z.string(), z.string().max(300))),
});

export const notificationSettingsSchema = z.object({
  customerScheduled: z.boolean(),
  merchantNewOrder: z.boolean(),
  scheduleChanged: z.boolean(),
  needsReview: z.boolean(),
  upcomingSummary: z.boolean(),
  merchantEmail: z.union([z.literal(''), z.email()]),
});

export const settingsInputSchema = z
  .object({
    enabled: z.boolean(),
    requiredMode: z.enum(REQUIRED_MODES),
    timezone: z.string().refine(isValidTimeZone, 'Choose a valid IANA time zone'),
    delivery: deliveryConfigSchema,
    pickup: pickupConfigSchema,
    minNoticeMinutes: z.number().int().min(0).max(60 * 24 * 60),
    maxDaysAhead: z.number().int().min(0).max(MAX_DAYS_AHEAD_LIMIT),
    sameDayEnabled: z.boolean(),
    cutoff: cutoffSchema,
    slots: slotConfigSchema,
    blockedDates: z.array(localDateSchema).max(366),
    holidayRules: z.array(holidayRuleSchema).max(100),
    vacationRanges: z.array(vacationRangeSchema).max(50),
    holdMinutes: z.number().int().min(5).max(120),
    appearance: appearanceSchema,
    translations: translationsSchema,
    notificationSettings: notificationSettingsSchema,
  })
  .refine((v) => !v.enabled || v.delivery.enabled || v.pickup.enabled, {
    message: 'Enable delivery, pickup, or both before turning scheduling on',
    path: ['enabled'],
  })
  .refine((v) => !v.pickup.enabled || v.pickup.locationName.trim().length > 0, {
    message: 'Pickup needs a location name',
    path: ['pickup', 'locationName'],
  });

export type SettingsInput = z.infer<typeof settingsInputSchema>;

export interface Settings extends SettingsInput {
  schemaVersion: number;
  settingsRevision: number;
  /** False until the merchant saves settings once; unconfigured sites never block checkout. */
  configured: boolean;
  updatedAt: string | null;
}

export const productRuleInputSchema = z.object({
  productId: z.string().min(1).max(64),
  productName: z.string().max(200),
  enabled: z.boolean(),
  preparationMinutes: z.number().int().min(0).max(60 * 24 * 60),
  allowedFulfilmentMethods: z.array(fulfilmentMethodSchema).min(1),
  requiredScheduling: z.boolean(),
  /** Optional: restricts slots to these hours. Never widens the global hours. */
  customWorkingHours: weekHoursSchema.nullable(),
});

export type ProductRuleInput = z.infer<typeof productRuleInputSchema>;
export interface ProductRule extends ProductRuleInput {
  updatedAt: string | null;
}

export type FulfilmentMethod = z.infer<typeof fulfilmentMethodSchema>;
export type Weekday = z.infer<typeof weekdaySchema>;
export type WeekHours = z.infer<typeof weekHoursSchema>;
export type TimeInterval = z.infer<typeof timeIntervalSchema>;
export type ScheduleStatus = (typeof SCHEDULE_STATUSES)[number];
export type MerchantScheduleStatus = (typeof MERCHANT_SCHEDULE_STATUSES)[number];
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];
export type Appearance = z.infer<typeof appearanceSchema>;

// ---- Public API payloads -------------------------------------------------

const guid = z.string().min(8).max(64).regex(/^[A-Za-z0-9-]+$/);

export const availabilityQuerySchema = z.object({
  checkoutId: guid,
  method: fulfilmentMethodSchema.optional(),
  from: localDateSchema.optional(),
  to: localDateSchema.optional(),
  locale: z.string().max(20).optional(),
});

export const holdRequestSchema = z.object({
  checkoutId: guid,
  method: fulfilmentMethodSchema,
  localDate: localDateSchema,
  slotId: z.string().regex(/^(\d{4}-\d{4}|day)$/),
  idempotencyKey: z.string().min(8).max(100).regex(/^[A-Za-z0-9_-]+$/),
  settingsRevision: z.number().int().min(0),
});

export const releaseRequestSchema = z.object({
  checkoutId: guid,
  reservationId: guid,
});

export const currentHoldQuerySchema = z.object({ checkoutId: guid });

// ---- Dashboard API payloads ----------------------------------------------

export const orderPatchSchema = z
  .object({
    scheduleStatus: z.enum(MERCHANT_SCHEDULE_STATUSES).optional(),
    merchantNotes: z.string().max(2000).optional(),
    reschedule: z
      .object({
        method: fulfilmentMethodSchema,
        localDate: localDateSchema,
        slotId: z.string().regex(/^(\d{4}-\d{4}|day)$/),
      })
      .optional(),
  })
  .refine((v) => Object.values(v).some((x) => x !== undefined), {
    message: 'Nothing to update',
  });

export const bulkStatusSchema = z.object({
  orderIds: z.array(z.string().min(1).max(64)).min(1).max(100),
  scheduleStatus: z.enum(MERCHANT_SCHEDULE_STATUSES),
});

const csvList = <T extends string>(values: readonly [T, ...T[]]) =>
  z
    .string()
    .optional()
    .transform((s) => (s ? s.split(',').filter(Boolean) : []))
    .pipe(z.array(z.enum(values)));

export const ordersQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  cursor: z.coerce.number().int().min(0).default(0),
  search: z.string().max(100).optional(),
  from: localDateSchema.optional(),
  to: localDateSchema.optional(),
  method: csvList(FULFILMENT_METHODS),
  scheduleStatus: csvList(SCHEDULE_STATUSES),
  orderStatus: z.string().max(200).optional(),
  paymentStatus: z.string().max(200).optional(),
  fulfillmentStatus: z.string().max(200).optional(),
  slotId: z.string().max(20).optional(),
  productId: z.string().max(64).optional(),
  unscheduledOnly: z.enum(['1', '0']).optional(),
});

export type OrdersQuery = z.infer<typeof ordersQuerySchema>;
