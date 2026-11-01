import type { ScheduleStatus } from '../../../../lib/schemas';
import type { DashboardMessageKey } from '../../../../lib/i18n/dashboard-messages';

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

export function getMethodLabel(method: string, t?: (k: DashboardMessageKey) => string): string {
  if (t) {
    if (method === 'delivery') return t('common.delivery');
    if (method === 'pickup') return t('common.pickup');
  }
  return METHOD_LABELS[method as 'delivery' | 'pickup'] ?? method;
}

export function getScheduleStatusLabel(status: string, t?: (k: DashboardMessageKey) => string): string {
  if (t) {
    const map: Record<string, DashboardMessageKey> = {
      scheduled: 'common.scheduled',
      preparing: 'common.preparing',
      ready: 'common.ready',
      out_for_delivery: 'common.outForDelivery',
      completed: 'common.completed',
      needs_review: 'common.needsReview',
      missing: 'common.missingSchedule',
      cancelled: 'common.cancelled',
    };
    if (map[status]) return t(map[status]);
  }
  return SCHEDULE_STATUS_LABELS[status as ScheduleStatus] ?? status;
}

export function getOrderStatusLabel(status: string, t?: (k: DashboardMessageKey) => string): string {
  if (t) {
    const map: Record<string, DashboardMessageKey> = {
      INITIALIZED: 'common.initialized',
      APPROVED: 'common.approved',
      PENDING: 'common.pending',
      CANCELED: 'common.canceled',
      REJECTED: 'common.rejected',
    };
    if (map[status]) return t(map[status]);
  }
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function getPaymentStatusLabel(status: string, t?: (k: DashboardMessageKey) => string): string {
  if (t) {
    const map: Record<string, DashboardMessageKey> = {
      NOT_PAID: 'common.notPaid',
      PAID: 'common.paid',
      PARTIALLY_PAID: 'common.partiallyPaid',
      PARTIALLY_REFUNDED: 'common.partiallyRefunded',
      FULLY_REFUNDED: 'common.refunded',
      PENDING: 'common.pending',
      PENDING_MERCHANT: 'common.pendingMerchant',
    };
    if (map[status]) return t(map[status]);
  }
  return PAYMENT_STATUS_LABELS[status] ?? status;
}

export function getFulfillmentStatusLabel(status: string, t?: (k: DashboardMessageKey) => string): string {
  if (t) {
    const map: Record<string, DashboardMessageKey> = {
      NOT_FULFILLED: 'common.notFulfilled',
      PARTIALLY_FULFILLED: 'common.partiallyFulfilled',
      FULFILLED: 'common.fulfilled',
    };
    if (map[status]) return t(map[status]);
  }
  return FULFILLMENT_STATUS_LABELS[status] ?? status;
}

export const label = (map: Record<string, string>, value: string) => map[value] ?? (value || '—');

/** Merchant-local calendar date for display; formatted according to the locale. */
export function displayDate(localDate: string | null, locale?: string): string {
  if (!localDate) return '—';
  const [y = 1970, m = 1, d = 1] = localDate.split('-').map(Number);
  try {
    return new Intl.DateTimeFormat(locale || undefined, { dateStyle: 'medium', timeZone: 'UTC' }).format(
      new Date(Date.UTC(y, m - 1, d, 12)),
    );
  } catch {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeZone: 'UTC' }).format(
      new Date(Date.UTC(y, m - 1, d, 12)),
    );
  }
}

/** A calendar Date picked in the browser, as the YYYY-MM-DD it shows. */
export function pickedDateToLocal(date: Date | null | undefined): string | undefined {
  if (!date) return undefined;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
