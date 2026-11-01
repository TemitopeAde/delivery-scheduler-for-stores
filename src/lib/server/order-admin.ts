import { MAX_DAYS_AHEAD_LIMIT } from '../constants';
import { checkSelection } from '../engine/availability';
import type { FulfilmentMethod, MerchantScheduleStatus } from '../schemas';
import { AppError } from './errors';
import { resolveEntitlement } from './entitlements';
import { claimCapacity, endReservation } from './holds';
import { log } from './log';
import { slotLabelSnapshot } from './order-snapshot';
import { rulesForProducts } from './product-rules-repo';
import { getReservation, insertReservation, type Reservation } from './reservations-repo';
import { getScheduledOrder, saveScheduledOrder, type ScheduledOrder } from './scheduled-orders-repo';
import { loadSettings } from './settings-repo';

async function requireOrder(orderId: string): Promise<ScheduledOrder> {
  const order = await getScheduledOrder(orderId);
  if (!order) throw new AppError('NOT_FOUND', 'No scheduling record exists for this order.');
  return order;
}

export async function orderDetail(orderId: string) {
  const order = await requireOrder(orderId);
  const reservation = order.reservationId ? await getReservation(order.reservationId) : null;
  return {
    order,
    reservation: reservation && {
      reservationId: reservation.reservationId,
      status: reservation.status,
      expiresAt: reservation.expiresAt?.toISOString() ?? null,
      settingsRevision: reservation.settingsRevision,
      createdAt: reservation.createdAt.toISOString(),
    },
  };
}

/** Moves an order to another slot. Capacity for the new slot is claimed before the old one is freed. */
async function reschedule(
  order: ScheduledOrder,
  target: { method: FulfilmentMethod; localDate: string; slotId: string },
): Promise<ScheduledOrder> {
  const now = new Date();
  const [settings, entitlement, rules] = await Promise.all([
    loadSettings(),
    resolveEntitlement(now),
    rulesForProducts(order.productIds),
  ]);
  if (!settings.configured) throw new AppError('SCHEDULING_DISABLED', 'Configure scheduling first.');

  // Merchants may move an order inside opening hours regardless of customer-only
  // rules (notice, cut-off, horizon), but never into the past or onto a closed
  // day. Capacity is enforced by the locks below.
  const check = checkSelection(
    {
      settings: {
        ...settings,
        enabled: true,
        minNoticeMinutes: 0,
        sameDayEnabled: true,
        maxDaysAhead: MAX_DAYS_AHEAD_LIMIT,
        cutoff: { ...settings.cutoff, enabled: false },
      },
      method: target.method,
      productRules: rules,
      now,
      usage: { slotCount: () => 0, dayCount: () => 0 },
      plan: entitlement.plan,
    },
    target.localDate,
    target.slotId,
    { ignoreCapacity: true },
  );
  if (!check.ok) {
    throw new AppError('SLOT_UNAVAILABLE', 'That date or time is not open for this method.', {
      reason: check.reason,
    });
  }

  const previous = order.reservationId ? await getReservation(order.reservationId) : null;
  const reservationId = crypto.randomUUID();
  const lockIds = await claimCapacity(
    settings,
    target.method,
    target.localDate,
    target.slotId,
    reservationId,
    null,
    now,
  );
  if (!lockIds) throw new AppError('SLOT_FULL', 'That time is fully booked.');

  const startUtc = new Date(check.slot.startUtc);
  const endUtc = new Date(check.slot.endUtc);
  const next: Reservation = {
    reservationId,
    orderId: order.orderId,
    checkoutId: previous?.checkoutId ?? '',
    purchaseFlowId: previous?.purchaseFlowId ?? null,
    idempotencyKey: `reschedule-${reservationId}`,
    fulfilmentMethod: target.method,
    localDate: target.localDate,
    slotId: target.slotId,
    slotStartUtc: startUtc,
    slotEndUtc: endUtc,
    timezone: settings.timezone,
    status: 'confirmed',
    expiresAt: null,
    settingsRevision: settings.settingsRevision,
    lockIds,
    createdAt: now,
    updatedAt: now,
  };
  await insertReservation(next);
  if (previous && ['held', 'confirmed', 'needs_review'].includes(previous.status)) {
    await endReservation(previous, 'released');
  }
  log.info('order.rescheduled', { orderId: order.orderId, reservationId });

  return {
    ...order,
    reservationId,
    fulfilmentMethod: target.method,
    localDate: target.localDate,
    slotId: target.slotId,
    slotLabelSnapshot: slotLabelSnapshot(settings, target.slotId),
    slotStartUtc: startUtc.toISOString(),
    slotEndUtc: endUtc.toISOString(),
    timezone: settings.timezone,
    scheduleStatus:
      order.scheduleStatus === 'missing' || order.scheduleStatus === 'needs_review'
        ? 'scheduled'
        : order.scheduleStatus,
  };
}

/** Changes only app-owned fields; the Wix order itself is never modified. */
export async function patchOrder(
  orderId: string,
  patch: {
    scheduleStatus?: MerchantScheduleStatus | undefined;
    merchantNotes?: string | undefined;
    reschedule?: { method: FulfilmentMethod; localDate: string; slotId: string } | undefined;
  },
): Promise<ScheduledOrder> {
  let order = await requireOrder(orderId);
  if (order.scheduleStatus === 'cancelled' && (patch.reschedule || patch.scheduleStatus)) {
    throw new AppError('CONFLICT', 'This order was canceled.');
  }
  if (patch.reschedule) order = await reschedule(order, patch.reschedule);
  if (patch.scheduleStatus) {
    if (!order.localDate) {
      throw new AppError('CONFLICT', 'Schedule this order before changing its fulfilment status.');
    }
    order = { ...order, scheduleStatus: patch.scheduleStatus };
  }
  if (patch.merchantNotes !== undefined) order = { ...order, merchantNotes: patch.merchantNotes };
  return saveScheduledOrder(order);
}

export async function bulkSetStatus(
  orderIds: string[],
  scheduleStatus: MerchantScheduleStatus,
): Promise<{ updated: string[]; skipped: string[] }> {
  const updated: string[] = [];
  const skipped: string[] = [];
  for (const orderId of orderIds) {
    const order = await getScheduledOrder(orderId);
    if (!order || !order.localDate || order.scheduleStatus === 'cancelled') {
      skipped.push(orderId);
      continue;
    }
    await saveScheduledOrder({ ...order, scheduleStatus });
    updated.push(orderId);
  }
  return { updated, skipped };
}
