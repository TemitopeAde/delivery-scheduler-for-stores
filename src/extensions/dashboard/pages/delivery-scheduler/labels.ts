import type { ScheduleStatus } from '../../../../lib/schemas';

export const METHOD_LABELS: Record<'delivery' | 'pickup', string> = {
  delivery: 'Delivery',
  pickup: 'Pickup',
};

export const SCHEDULE_STATUS_LABELS: Record<ScheduleStatus, string> = {
  scheduled: 'Scheduled',
  preparing: 'Preparing',
  ready: 'Ready',
  out_for_delivery: 'Out for delivery',
  completed: 'Completed',
  needs_review: 'Needs review',
  missing: 'Missing schedule',
  cancelled: 'Cancelled',
};

type BadgeSkin = 'standard' | 'success' | 'warning' | 'danger' | 'neutralLight' | 'general';
export const SCHEDULE_STATUS_SKINS: Record<ScheduleStatus, BadgeSkin> = {
  scheduled: 'general',
  preparing: 'standard',
  ready: 'standard',
  out_for_delivery: 'standard',
  completed: 'success',
  needs_review: 'danger',
  missing: 'warning',
  cancelled: 'neutralLight',
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  INITIALIZED: 'Initialized',
  APPROVED: 'Approved',
  PENDING: 'Pending',
  CANCELED: 'Canceled',
  REJECTED: 'Rejected',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  NOT_PAID: 'Not paid',
  PAID: 'Paid',
  PARTIALLY_PAID: 'Partially paid',
  PARTIALLY_REFUNDED: 'Partially refunded',
  FULLY_REFUNDED: 'Refunded',
  PENDING: 'Pending',
  PENDING_MERCHANT: 'Pending merchant',
};

export const FULFILLMENT_STATUS_LABELS: Record<string, string> = {
  NOT_FULFILLED: 'Not fulfilled',
  PARTIALLY_FULFILLED: 'Partially fulfilled',
  FULFILLED: 'Fulfilled',
};

export const label = (map: Record<string, string>, value: string) => map[value] ?? (value || '—');

/** Merchant-local calendar date for display; never shifted through the browser zone. */
export function displayDate(localDate: string | null): string {
  if (!localDate) return '—';
  const [y = 1970, m = 1, d = 1] = localDate.split('-').map(Number);
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeZone: 'UTC' }).format(
    new Date(Date.UTC(y, m - 1, d, 12)),
  );
}

/** A calendar Date picked in the browser, as the YYYY-MM-DD it shows. */
export function pickedDateToLocal(date: Date | null | undefined): string | undefined {
  if (!date) return undefined;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
