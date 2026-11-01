import { items } from '@wix/data';
import { COLLECTIONS } from '../constants';
import type { FulfilmentMethod, OrdersQuery, ScheduleStatus } from '../schemas';
import { db, str, strArray, toDate, withRetry } from './data';
import { log } from './log';

export interface ScheduledOrder {
  orderId: string;
  orderNumber: string;
  reservationId: string | null;
  fulfilmentMethod: FulfilmentMethod | null;
  localDate: string | null;
  slotId: string | null;
  slotLabelSnapshot: string;
  slotStartUtc: string | null;
  slotEndUtc: string | null;
  timezone: string;
  scheduleStatus: ScheduleStatus;
  orderStatusSnapshot: string;
  paymentStatusSnapshot: string;
  fulfillmentStatusSnapshot: string;
  customerDisplayName: string;
  itemSummarySnapshot: string;
  productIds: string[];
  merchantNotes: string;
  source: string;
  lastSyncedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

type Item = Record<string, unknown>;

const iso = (value: unknown) => toDate(value)?.toISOString() ?? null;

function toOrder(item: Item): ScheduledOrder {
  const method = str(item.fulfilmentMethod);
  return {
    orderId: str(item._id),
    orderNumber: str(item.orderNumber),
    reservationId: str(item.reservationId) || null,
    fulfilmentMethod: method === 'delivery' || method === 'pickup' ? method : null,
    localDate: str(item.localDate) || null,
    slotId: str(item.slotId) || null,
    slotLabelSnapshot: str(item.slotLabelSnapshot),
    slotStartUtc: iso(item.slotStartUtc),
    slotEndUtc: iso(item.slotEndUtc),
    timezone: str(item.timezone),
    scheduleStatus: str(item.scheduleStatus, 'missing') as ScheduleStatus,
    orderStatusSnapshot: str(item.orderStatusSnapshot),
    paymentStatusSnapshot: str(item.paymentStatusSnapshot),
    fulfillmentStatusSnapshot: str(item.fulfillmentStatusSnapshot),
    customerDisplayName: str(item.customerDisplayName),
    itemSummarySnapshot: str(item.itemSummarySnapshot),
    productIds: strArray(item.productIds),
    merchantNotes: str(item.merchantNotes),
    source: str(item.source),
    lastSyncedAt: iso(item.lastSyncedAt),
    createdAt: iso(item.createdAt),
    updatedAt: iso(item.updatedAt),
  };
}

const toItemDate = (value: string | null) => (value ? new Date(value) : null);

export async function getScheduledOrder(orderId: string): Promise<ScheduledOrder | null> {
  const item = (await withRetry(() => db.get(COLLECTIONS.scheduledOrders, orderId))) as Item | null;
  return item ? toOrder(item) : null;
}

/** Upserts by order ID, which is the item `_id`, so there is exactly one record per order. */
export async function saveScheduledOrder(order: ScheduledOrder): Promise<ScheduledOrder> {
  const now = new Date().toISOString();
  const next = { ...order, createdAt: order.createdAt ?? now, updatedAt: now };
  await withRetry(() =>
    db.save(COLLECTIONS.scheduledOrders, {
      ...next,
      _id: next.orderId,
      slotStartUtc: toItemDate(next.slotStartUtc),
      slotEndUtc: toItemDate(next.slotEndUtc),
      lastSyncedAt: toItemDate(next.lastSyncedAt),
      createdAt: toItemDate(next.createdAt),
      updatedAt: toItemDate(next.updatedAt),
    }),
  );
  return next;
}

const list = (value: string | undefined) =>
  (value ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20);

function buildQuery(q: Omit<OrdersQuery, 'limit' | 'cursor'>) {
  let query = db.query(COLLECTIONS.scheduledOrders);
  if (q.unscheduledOnly === '1') {
    query = query.hasSome('scheduleStatus', ['missing', 'needs_review']);
  } else {
    if (q.from) query = query.ge('localDate', q.from);
    if (q.to) query = query.le('localDate', q.to);
  }
  if (q.method.length) query = query.hasSome('fulfilmentMethod', q.method);
  if (q.scheduleStatus.length) query = query.hasSome('scheduleStatus', q.scheduleStatus);
  const orderStatus = list(q.orderStatus);
  if (orderStatus.length) query = query.hasSome('orderStatusSnapshot', orderStatus);
  const paymentStatus = list(q.paymentStatus);
  if (paymentStatus.length) query = query.hasSome('paymentStatusSnapshot', paymentStatus);
  const fulfillmentStatus = list(q.fulfillmentStatus);
  if (fulfillmentStatus.length) query = query.hasSome('fulfillmentStatusSnapshot', fulfillmentStatus);
  if (q.slotId) query = query.eq('slotId', q.slotId);
  if (q.productId) query = query.hasSome('productIds', [q.productId]);
  const term = q.search?.trim();
  if (term) {
    const bySearch = items
      .filter()
      .eq('orderNumber', term)
      .or(items.filter().eq('_id', term))
      .or(items.filter().contains('customerDisplayName', term));
    query = query.and(bySearch);
  }
  return query.ascending('localDate', 'slotId').descending('orderNumber');
}

export async function queryScheduledOrders(
  q: OrdersQuery,
): Promise<{ orders: ScheduledOrder[]; nextCursor: number | null; total: number | null }> {
  const result = await buildQuery(q).skip(q.cursor).limit(q.limit).find({ returnTotalCount: true });
  return {
    orders: result.items.map((i) => toOrder(i as Item)),
    nextCursor: result.hasNext() ? q.cursor + q.limit : null,
    total: result.totalCount ?? null,
  };
}

/** Iterates every matching record in pages (CSV export), capped to keep within backend limits. */
export async function allScheduledOrders(
  q: Omit<OrdersQuery, 'limit' | 'cursor'>,
  cap = 5000,
): Promise<ScheduledOrder[]> {
  const out: ScheduledOrder[] = [];
  let page = await buildQuery(q).limit(1000).find();
  for (;;) {
    out.push(...page.items.map((i) => toOrder(i as Item)));
    if (!page.hasNext() || out.length >= cap) break;
    page = await page.next();
  }
  return out.slice(0, cap);
}

export async function countScheduledOrders(filter: {
  localDate?: string;
  from?: string;
  to?: string;
  method?: FulfilmentMethod;
  statuses?: ScheduleStatus[];
}): Promise<number> {
  try {
    let query = db.query(COLLECTIONS.scheduledOrders);
    if (filter.localDate) query = query.eq('localDate', filter.localDate);
    if (filter.from) query = query.ge('localDate', filter.from);
    if (filter.to) query = query.le('localDate', filter.to);
    if (filter.method) query = query.eq('fulfilmentMethod', filter.method);
    if (filter.statuses) query = query.hasSome('scheduleStatus', filter.statuses);
    return await query.count();
  } catch (error) {
    log.error('scheduled-orders.count', error, {
      collection: COLLECTIONS.scheduledOrders,
      localDate: filter.localDate ?? null,
      from: filter.from ?? null,
      to: filter.to ?? null,
      method: filter.method ?? null,
      statuses: filter.statuses?.join(',') ?? null,
    });
    throw error;
  }
}
