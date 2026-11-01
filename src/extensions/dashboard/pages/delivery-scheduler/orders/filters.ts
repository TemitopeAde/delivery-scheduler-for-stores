import { dateRangeFilter, stringsArrayFilter } from '@wix/patterns';
import { SCHEDULE_STATUSES, type ScheduleStatus } from '../../../../../lib/schemas';
import {
  FULFILLMENT_STATUS_LABELS,
  METHOD_LABELS,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  SCHEDULE_STATUS_LABELS,
} from '../labels';

// Module level: one filter per page, not one per render.
export const methodFilter = stringsArrayFilter<'delivery' | 'pickup'>({
  name: 'Method',
  itemKey: (m) => m,
  itemName: (m) => METHOD_LABELS[m],
});

export const scheduleStatusFilter = stringsArrayFilter<ScheduleStatus>({
  name: 'Schedule status',
  itemKey: (s) => s,
  itemName: (s) => SCHEDULE_STATUS_LABELS[s],
});

export const orderStatusFilter = stringsArrayFilter<string>({
  name: 'Order status',
  itemKey: (s) => s,
  itemName: (s) => ORDER_STATUS_LABELS[s] ?? s,
});

export const paymentStatusFilter = stringsArrayFilter<string>({
  name: 'Payment status',
  itemKey: (s) => s,
  itemName: (s) => PAYMENT_STATUS_LABELS[s] ?? s,
});

export const fulfillmentStatusFilter = stringsArrayFilter<string>({
  name: 'Fulfillment status',
  itemKey: (s) => s,
  itemName: (s) => FULFILLMENT_STATUS_LABELS[s] ?? s,
});

export const scheduledDateFilter = dateRangeFilter({ name: 'Scheduled date' });

export const ORDER_FILTERS = {
  method: methodFilter,
  scheduleStatus: scheduleStatusFilter,
  orderStatus: orderStatusFilter,
  paymentStatus: paymentStatusFilter,
  fulfillmentStatus: fulfillmentStatusFilter,
  scheduledDate: scheduledDateFilter,
};

export type OrderFilters = typeof ORDER_FILTERS;

export const SCHEDULE_STATUS_OPTIONS = [...SCHEDULE_STATUSES];
export const ORDER_STATUS_OPTIONS = Object.keys(ORDER_STATUS_LABELS);
export const PAYMENT_STATUS_OPTIONS = Object.keys(PAYMENT_STATUS_LABELS);
export const FULFILLMENT_STATUS_OPTIONS = Object.keys(FULFILLMENT_STATUS_LABELS);
