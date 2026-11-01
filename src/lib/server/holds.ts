import { claimSeat, ownsAllLocks, releaseLocks, type LockScope } from '../capacity/locks';
import { checkSelection } from '../engine/availability';
import { methodConfig } from '../engine/slots';
import type { SlotAvailability } from '../engine/types';
import type { FulfilmentMethod, ReservationStatus, Settings } from '../schemas';
import { resolveCheckout } from './checkout-context';
import { isDuplicateItemError } from './data';
import { AppError } from './errors';
import { loadUsage, wixDataLockStore } from './lock-store';
import { log } from './log';
import {
  findActiveByCheckout,
  findByIdempotencyKey,
  getReservation,
  insertReservation,
  listExpiredHolds,
  updateReservation,
  type Reservation,
} from './reservations-repo';
import { loadSchedulingContext } from './scheduling-context';

const MINUTE_MS = 60_000;

export interface PublicHold {
  reservationId: string;
  status: ReservationStatus;
  method: FulfilmentMethod;
  localDate: string;
  slotId: string;
  slotStartUtc: string | null;
  slotEndUtc: string | null;
  timezone: string;
  expiresAt: string | null;
  settingsRevision: number;
}

export function toPublicHold(r: Reservation): PublicHold {
  return {
    reservationId: r.reservationId,
    status: r.status,
    method: r.fulfilmentMethod,
    localDate: r.localDate,
    slotId: r.slotId,
    slotStartUtc: r.slotStartUtc?.toISOString() ?? null,
    slotEndUtc: r.slotEndUtc?.toISOString() ?? null,
    timezone: r.timezone,
    expiresAt: r.expiresAt?.toISOString() ?? null,
    settingsRevision: r.settingsRevision,
  };
}

export function isHoldActive(r: Reservation, now: Date): boolean {
  if (r.status === 'confirmed') return true;
  return r.status === 'held' && (r.expiresAt === null || r.expiresAt.getTime() > now.getTime());
}

export function lockScopes(
  method: FulfilmentMethod,
  localDate: string,
  slotId: string,
): { slot: LockScope; day: LockScope } {
  return {
    slot: { kind: 'slot', method, localDate, slotId },
    day: { kind: 'day', method, localDate, slotId: 'day' },
  };
}

/**
 * Claims slot and day capacity together; if the day is full the slot seat is
 * given back so a partial claim never lingers.
 */
export async function claimCapacity(
  settings: Settings,
  method: FulfilmentMethod,
  localDate: string,
  slotId: string,
  reservationId: string,
  expiresAt: Date | null,
  now: Date,
): Promise<string[] | null> {
  const scopes = lockScopes(method, localDate, slotId);
  const store = wixDataLockStore;
  const slotLock = await claimSeat(
    store,
    scopes.slot,
    settings.slots.defaultCapacity,
    reservationId,
    expiresAt,
    now,
  );
  if (!slotLock) return null;
  const dayLock = await claimSeat(
    store,
    scopes.day,
    methodConfig(settings, method).dailyCapacity,
    reservationId,
    expiresAt,
    now,
  );
  if (!dayLock) {
    await releaseLocks(store, [slotLock], reservationId);
    return null;
  }
  return [slotLock, dayLock];
}

async function endReservation(r: Reservation, status: ReservationStatus): Promise<Reservation> {
  await releaseLocks(wixDataLockStore, r.lockIds, r.reservationId);
  return updateReservation({ ...r, status, expiresAt: null });
}

export interface HoldRequest {
  checkoutId: string;
  method: FulfilmentMethod;
  localDate: string;
  slotId: string;
  idempotencyKey: string;
  settingsRevision: number;
}

export async function createHold(req: HoldRequest, now = new Date()): Promise<PublicHold> {
  const previous = await findByIdempotencyKey(req.idempotencyKey);
  if (previous) {
    if (previous.checkoutId !== req.checkoutId) {
      throw new AppError('CONFLICT', 'This request was already used for another checkout.');
    }
    if (isHoldActive(previous, now)) return toPublicHold(previous);
  }

  const checkoutCtx = await resolveCheckout(req.checkoutId);
  if (checkoutCtx.completed) {
    throw new AppError('CHECKOUT_COMPLETED', 'This checkout is already complete.');
  }
  const ctx = await loadSchedulingContext(checkoutCtx.items);
  const { settings, plan, rules } = ctx;
  if (!settings.configured || !settings.enabled) {
    throw new AppError('SCHEDULING_DISABLED', 'Scheduling is not available right now.');
  }
  if (req.settingsRevision !== settings.settingsRevision) {
    throw new AppError('STALE_SETTINGS', 'Availability has changed. Please choose again.');
  }

  const usage = await loadUsage(req.method, req.localDate, req.localDate, now);
  const check = checkSelection(
    { settings, method: req.method, productRules: rules, now, usage, plan },
    req.localDate,
    req.slotId,
    { ignoreCapacity: false },
  );
  if (!check.ok) {
    throw new AppError(
      check.reason === 'fully_booked' ? 'SLOT_FULL' : 'SLOT_UNAVAILABLE',
      check.reason === 'fully_booked' ? 'That time is fully booked.' : 'That time is no longer available.',
      { reason: check.reason },
    );
  }

  for (const active of await findActiveByCheckout(req.checkoutId)) {
    if (active.status === 'confirmed') {
      throw new AppError('CONFLICT', 'This checkout already has a confirmed schedule.');
    }
    await endReservation(active, 'released');
  }

  return placeHold(req, checkoutCtx.purchaseFlowId, settings, check.slot, now);
}

async function placeHold(
  req: HoldRequest,
  purchaseFlowId: string | null,
  settings: Settings,
  slot: SlotAvailability,
  now: Date,
): Promise<PublicHold> {
  const reservationId = crypto.randomUUID();
  const expiresAt = new Date(now.getTime() + settings.holdMinutes * MINUTE_MS);
  const lockIds = await claimCapacity(
    settings,
    req.method,
    req.localDate,
    req.slotId,
    reservationId,
    expiresAt,
    now,
  );
  if (!lockIds) throw new AppError('SLOT_FULL', 'That time was just booked. Please choose another.');

  const reservation: Reservation = {
    reservationId,
    orderId: null,
    checkoutId: req.checkoutId,
    purchaseFlowId,
    idempotencyKey: req.idempotencyKey,
    fulfilmentMethod: req.method,
    localDate: req.localDate,
    slotId: req.slotId,
    slotStartUtc: new Date(slot.startUtc),
    slotEndUtc: new Date(slot.endUtc),
    timezone: settings.timezone,
    status: 'held',
    expiresAt,
    settingsRevision: settings.settingsRevision,
    lockIds,
    createdAt: now,
    updatedAt: now,
  };
  try {
    await insertReservation(reservation);
  } catch (error) {
    await releaseLocks(wixDataLockStore, lockIds, reservationId);
    if (isDuplicateItemError(error)) {
      // A concurrent retry with the same idempotency key won the unique index.
      const winner = await findByIdempotencyKey(req.idempotencyKey);
      if (winner) return toPublicHold(winner);
    }
    throw error;
  }
  log.info('hold.created', { reservationId, method: req.method, localDate: req.localDate });
  return toPublicHold(reservation);
}

export async function releaseHold(checkoutId: string, reservationId: string): Promise<PublicHold> {
  const reservation = await getReservation(reservationId);
  if (!reservation || reservation.checkoutId !== checkoutId) {
    throw new AppError('RESERVATION_NOT_FOUND', 'That selection was not found.');
  }
  if (reservation.status === 'confirmed') {
    throw new AppError('CONFLICT', 'A confirmed schedule cannot be released from checkout.');
  }
  if (reservation.status !== 'held') return toPublicHold(reservation);
  return toPublicHold(await endReservation(reservation, 'released'));
}

export async function currentHold(checkoutId: string, now = new Date()): Promise<PublicHold | null> {
  const active = (await findActiveByCheckout(checkoutId)).find((r) => isHoldActive(r, now));
  return active ? toPublicHold(active) : null;
}

/** Ensures a reservation still owns its capacity, re-claiming seats if its hold lapsed. */
export async function ensureCapacity(
  r: Reservation,
  settings: Settings,
  now: Date,
): Promise<string[] | null> {
  if (r.lockIds.length > 0 && (await ownsAllLocks(wixDataLockStore, r.lockIds, r.reservationId))) {
    return r.lockIds;
  }
  return claimCapacity(settings, r.fulfilmentMethod, r.localDate, r.slotId, r.reservationId, null, now);
}

export async function confirmLocks(lockIds: string[]): Promise<void> {
  for (const id of lockIds) await wixDataLockStore.setExpiry(id, null);
}

export async function expireStaleHolds(now = new Date(), limit = 50): Promise<number> {
  const stale = await listExpiredHolds(now, limit);
  for (const r of stale) {
    try {
      await endReservation(r, 'expired');
    } catch (error) {
      log.error('hold.expire', error, { reservationId: r.reservationId });
    }
  }
  return stale.length;
}

export { endReservation };
