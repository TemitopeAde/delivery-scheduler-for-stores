import type { orders } from '@wix/ecom';
import { EVENT_MAX_ATTEMPTS } from '../constants';
import { MERCHANT_SCHEDULE_STATUSES, type ScheduleStatus } from '../schemas';
import { getLogEntry, logIdFor, saveLogEntry, type EventLogEntry, type ProcessingStatus } from './event-log-repo';
import { confirmLocks, endReservation, ensureCapacity } from './holds';
import { log } from './log';
import { fetchOrder, orderItems, orderSnapshot, slotLabelSnapshot } from './order-snapshot';
import { findByOrderId, findForOrder, updateReservation, type Reservation } from './reservations-repo';
import { getScheduledOrder, saveScheduledOrder, type ScheduledOrder } from './scheduled-orders-repo';
import { isSchedulingRequired, loadSchedulingContext } from './scheduling-context';
import { loadSettings } from './settings-repo';

export type OrderEventType = 'order.created' | 'order.approved' | 'order.canceled' | 'manual.retry';

interface SyncOutcome {
  status: Extract<ProcessingStatus, 'processed' | 'skipped'>;
  reservationId: string | null;
}

const MERCHANT_OWNED = new Set<ScheduleStatus>(MERCHANT_SCHEDULE_STATUSES);

function emptyRecord(orderId: string): ScheduledOrder {
  return {
    orderId,
    orderNumber: '',
    reservationId: null,
    fulfilmentMethod: null,
    localDate: null,
    slotId: null,
    slotLabelSnapshot: '',
    slotStartUtc: null,
    slotEndUtc: null,
    timezone: '',
    scheduleStatus: 'missing',
    orderStatusSnapshot: '',
    paymentStatusSnapshot: '',
    fulfillmentStatusSnapshot: '',
    customerDisplayName: '',
    itemSummarySnapshot: '',
    productIds: [],
    merchantNotes: '',
    source: '',
    lastSyncedAt: null,
    createdAt: null,
    updatedAt: null,
  };
}

async function confirmReservation(r: Reservation, orderId: string, now: Date): Promise<Reservation> {
  if (r.status === 'confirmed' && r.orderId === orderId) return r;
  if (r.orderId && r.orderId !== orderId) {
    // The same checkout produced a second order; never move capacity silently.
    return r;
  }
  const settings = await loadSettings();
  const lockIds = await ensureCapacity(r, settings, now);
  if (!lockIds) {
    log.info('reservation.needs_review', { reservationId: r.reservationId, orderId });
    return updateReservation({ ...r, orderId, status: 'needs_review', expiresAt: null });
  }
  await confirmLocks(lockIds);
  return updateReservation({ ...r, orderId, lockIds, status: 'confirmed', expiresAt: null });
}

async function syncOrder(order: orders.Order, orderId: string, now: Date): Promise<SyncOutcome> {
  const snapshot = orderSnapshot(order);
  const existing = await getScheduledOrder(orderId);
  const found = await findForOrder(order.checkoutId ?? null, order.purchaseFlowId ?? null);

  if (!found) {
    if (!existing) {
      const items = orderItems(order);
      const ctx = await loadSchedulingContext(items);
      if (!isSchedulingRequired(ctx, items)) return { status: 'skipped', reservationId: null };
    }
    // Required but no schedule arrived: record it as missing so the merchant sees it.
    await saveScheduledOrder({
      ...(existing ?? emptyRecord(orderId)),
      ...snapshot,
      lastSyncedAt: now.toISOString(),
    });
    return { status: 'processed', reservationId: null };
  }

  const reservation = await confirmReservation(found, orderId, now);
  const conflict = reservation.orderId !== null && reservation.orderId !== orderId;
  const needsReview = conflict || reservation.status === 'needs_review';
  const settledStatus: ScheduleStatus =
    existing && MERCHANT_OWNED.has(existing.scheduleStatus) ? existing.scheduleStatus : 'scheduled';
  const settings = await loadSettings();

  await saveScheduledOrder({
    ...(existing ?? emptyRecord(orderId)),
    ...snapshot,
    reservationId: reservation.reservationId,
    fulfilmentMethod: reservation.fulfilmentMethod,
    localDate: reservation.localDate,
    slotId: reservation.slotId,
    slotLabelSnapshot: existing?.slotLabelSnapshot || slotLabelSnapshot(settings, reservation.slotId),
    slotStartUtc: reservation.slotStartUtc?.toISOString() ?? null,
    slotEndUtc: reservation.slotEndUtc?.toISOString() ?? null,
    timezone: reservation.timezone,
    scheduleStatus: needsReview ? 'needs_review' : settledStatus,
    lastSyncedAt: now.toISOString(),
  });
  return { status: 'processed', reservationId: reservation.reservationId };
}

async function syncCancellation(order: orders.Order, orderId: string, now: Date): Promise<SyncOutcome> {
  const reservation =
    (await findByOrderId(orderId)) ??
    (await findForOrder(order.checkoutId ?? null, order.purchaseFlowId ?? null));
  if (reservation && ['held', 'confirmed', 'needs_review', 'expired'].includes(reservation.status)) {
    // Policy: capacity returns to the pool as soon as the order is canceled.
    await endReservation(reservation, 'cancelled');
  }
  const existing = await getScheduledOrder(orderId);
  if (!existing) return { status: 'skipped', reservationId: reservation?.reservationId ?? null };
  await saveScheduledOrder({
    ...existing,
    ...orderSnapshot(order),
    scheduleStatus: 'cancelled',
    lastSyncedAt: now.toISOString(),
  });
  return { status: 'processed', reservationId: reservation?.reservationId ?? null };
}

/**
 * Idempotent entry point for order events. Each delivery is logged by an
 * idempotency key; processed events are never applied twice, failures are
 * retried up to EVENT_MAX_ATTEMPTS and then dead-lettered for the diagnostics page.
 */
export async function processOrderEvent(args: {
  eventId: string;
  eventType: OrderEventType;
  order: orders.Order | undefined;
}): Promise<ProcessingStatus> {
  const orderId = args.order?._id;
  if (!orderId || !args.order) return 'skipped';
  const idempotencyKey = `${args.eventType}:${args.eventId}`;
  const previous = await getLogEntry(idempotencyKey);
  if (previous && ['processed', 'skipped', 'dead_letter'].includes(previous.processingStatus)) {
    return previous.processingStatus;
  }

  const now = new Date();
  const entry: EventLogEntry = {
    id: logIdFor(idempotencyKey),
    eventId: args.eventId,
    eventType: args.eventType,
    orderId,
    reservationId: previous?.reservationId ?? null,
    idempotencyKey,
    processingStatus: 'processing',
    attemptCount: (previous?.attemptCount ?? 0) + 1,
    lastErrorCode: null,
    receivedAt: previous?.receivedAt ?? now.toISOString(),
    processedAt: null,
  };
  await saveLogEntry(entry);

  try {
    const current = (await fetchOrder(orderId)) ?? args.order;
    const outcome =
      args.eventType === 'order.canceled' || current.status === 'CANCELED'
        ? await syncCancellation(current, orderId, now)
        : await syncOrder(current, orderId, now);
    await saveLogEntry({
      ...entry,
      processingStatus: outcome.status,
      reservationId: outcome.reservationId,
      processedAt: new Date().toISOString(),
    });
    return outcome.status;
  } catch (error) {
    const status: ProcessingStatus = entry.attemptCount >= EVENT_MAX_ATTEMPTS ? 'dead_letter' : 'failed';
    log.error('orderEvent.process', error, { orderId, eventType: args.eventType, attempt: entry.attemptCount });
    await saveLogEntry({ ...entry, processingStatus: status, lastErrorCode: log.errorCode(error) }).catch(
      (logError: unknown) => log.error('orderEvent.log', logError, { orderId }),
    );
    if (status === 'failed') throw error;
    return status;
  }
}

/** Re-runs a failed event from the diagnostics page against the current order state. */
export async function retryEvent(entry: EventLogEntry): Promise<ProcessingStatus> {
  if (!entry.orderId) return 'skipped';
  const order = await fetchOrder(entry.orderId);
  if (!order) return entry.processingStatus;
  const eventType = (
    ['order.created', 'order.approved', 'order.canceled'].includes(entry.eventType)
      ? entry.eventType
      : 'manual.retry'
  ) as OrderEventType;
  const fresh = { ...entry, processingStatus: 'failed' as const, attemptCount: 0 };
  await saveLogEntry(fresh);
  try {
    return await processOrderEvent({ eventId: entry.eventId, eventType, order });
  } catch {
    return 'failed';
  }
}
