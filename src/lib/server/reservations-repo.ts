import { COLLECTIONS } from '../constants';
import type { FulfilmentMethod, ReservationStatus } from '../schemas';
import { db, num, str, strArray, toDate, withRetry } from './data';

export interface Reservation {
  reservationId: string;
  orderId: string | null;
  checkoutId: string;
  purchaseFlowId: string | null;
  idempotencyKey: string;
  fulfilmentMethod: FulfilmentMethod;
  localDate: string;
  slotId: string;
  slotStartUtc: Date | null;
  slotEndUtc: Date | null;
  timezone: string;
  status: ReservationStatus;
  expiresAt: Date | null;
  settingsRevision: number;
  lockIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

type Item = Record<string, unknown>;
const ACTIVE: ReservationStatus[] = ['held', 'confirmed'];

function toReservation(item: Item): Reservation {
  return {
    reservationId: str(item._id),
    orderId: str(item.orderId) || null,
    checkoutId: str(item.checkoutId),
    purchaseFlowId: str(item.purchaseFlowId) || null,
    idempotencyKey: str(item.idempotencyKey),
    fulfilmentMethod: item.fulfilmentMethod === 'pickup' ? 'pickup' : 'delivery',
    localDate: str(item.localDate),
    slotId: str(item.slotId),
    slotStartUtc: toDate(item.slotStartUtc),
    slotEndUtc: toDate(item.slotEndUtc),
    timezone: str(item.timezone),
    status: str(item.status, 'held') as ReservationStatus,
    expiresAt: toDate(item.expiresAt),
    settingsRevision: num(item.settingsRevision),
    lockIds: strArray(item.lockIds),
    createdAt: toDate(item.createdAt) ?? new Date(0),
    updatedAt: toDate(item.updatedAt) ?? new Date(0),
  };
}

function toItem(r: Reservation): Item {
  return {
    _id: r.reservationId,
    reservationId: r.reservationId,
    orderId: r.orderId,
    checkoutId: r.checkoutId,
    purchaseFlowId: r.purchaseFlowId,
    idempotencyKey: r.idempotencyKey,
    fulfilmentMethod: r.fulfilmentMethod,
    localDate: r.localDate,
    slotId: r.slotId,
    slotStartUtc: r.slotStartUtc,
    slotEndUtc: r.slotEndUtc,
    timezone: r.timezone,
    status: r.status,
    expiresAt: r.expiresAt,
    settingsRevision: r.settingsRevision,
    lockIds: r.lockIds,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export async function insertReservation(r: Reservation): Promise<void> {
  await db.insert(COLLECTIONS.reservations, toItem(r));
}

export async function updateReservation(r: Reservation): Promise<Reservation> {
  const next = { ...r, updatedAt: new Date() };
  await withRetry(() => db.update(COLLECTIONS.reservations, toItem(next) as Item & { _id: string }));
  return next;
}

export async function getReservation(reservationId: string): Promise<Reservation | null> {
  const item = (await db.get(COLLECTIONS.reservations, reservationId)) as Item | null;
  return item ? toReservation(item) : null;
}

export async function findByIdempotencyKey(key: string): Promise<Reservation | null> {
  const result = await db.query(COLLECTIONS.reservations).eq('idempotencyKey', key).limit(1).find();
  const item = result.items[0];
  return item ? toReservation(item as Item) : null;
}

export async function findActiveByCheckout(checkoutId: string): Promise<Reservation[]> {
  const result = await db
    .query(COLLECTIONS.reservations)
    .eq('checkoutId', checkoutId)
    .hasSome('status', ACTIVE)
    .descending('createdAt')
    .limit(20)
    .find();
  return result.items.map((i) => toReservation(i as Item));
}

/** Most recent non-released reservation for a purchase flow (validator correlation). */
export async function findLatestByPurchaseFlow(purchaseFlowId: string): Promise<Reservation | null> {
  const result = await withRetry(() =>
    db
      .query(COLLECTIONS.reservations)
      .eq('purchaseFlowId', purchaseFlowId)
      .hasSome('status', ['held', 'confirmed', 'expired', 'needs_review'])
      .descending('createdAt')
      .limit(1)
      .find(),
  );
  const item = result.items[0];
  return item ? toReservation(item as Item) : null;
}

/** Most recent reservation for an order's checkout or purchase flow (event correlation). */
export async function findForOrder(
  checkoutId: string | null,
  purchaseFlowId: string | null,
): Promise<Reservation | null> {
  const candidates: Reservation[] = [];
  for (const [field, value] of [
    ['checkoutId', checkoutId],
    ['purchaseFlowId', purchaseFlowId],
  ] as const) {
    if (!value) continue;
    const result = await withRetry(() =>
      db
        .query(COLLECTIONS.reservations)
        .eq(field, value)
        .hasSome('status', ['held', 'confirmed', 'expired', 'needs_review'])
        .descending('createdAt')
        .limit(1)
        .find(),
    );
    const item = result.items[0];
    if (item) candidates.push(toReservation(item as Item));
  }
  return candidates.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] ?? null;
}

export async function findByOrderId(orderId: string): Promise<Reservation | null> {
  const result = await db
    .query(COLLECTIONS.reservations)
    .eq('orderId', orderId)
    .descending('createdAt')
    .limit(1)
    .find();
  const item = result.items[0];
  return item ? toReservation(item as Item) : null;
}

export async function listExpiredHolds(now: Date, limit: number): Promise<Reservation[]> {
  const result = await db
    .query(COLLECTIONS.reservations)
    .eq('status', 'held')
    .lt('expiresAt', now)
    .limit(limit)
    .find();
  return result.items.map((i) => toReservation(i as Item));
}

export async function countByStatus(status: ReservationStatus): Promise<number> {
  return db.query(COLLECTIONS.reservations).eq('status', status).count();
}
