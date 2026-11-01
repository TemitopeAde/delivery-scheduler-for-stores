import type { FulfilmentMethod } from '../schemas';

/**
 * Capacity is enforced with one lock item per unit of capacity ("seat"). A seat
 * item's `_id` is deterministic (`<scope>|<seat>`), and claiming it is an
 * insert: the store's primary-key uniqueness makes exactly one concurrent
 * insert win, so two requests can never both take the last seat. This avoids
 * read-then-write counting, which cannot prevent overbooking.
 */

export type LockKind = 'slot' | 'day';

export interface LockScope {
  kind: LockKind;
  method: FulfilmentMethod;
  localDate: string;
  /** `day` for day-level locks. */
  slotId: string;
}

export interface LockRecord extends LockScope {
  _id: string;
  scopeKey: string;
  reservationId: string;
  /** Null once the reservation is confirmed against an order. */
  expiresAt: Date | null;
}

export interface LockStore {
  /** Must fail with 'duplicate' when an item with the same `_id` already exists. */
  insert(lock: LockRecord): Promise<'inserted' | 'duplicate'>;
  get(id: string): Promise<LockRecord | null>;
  remove(id: string): Promise<void>;
  listByScope(scopeKey: string): Promise<LockRecord[]>;
  setExpiry(id: string, expiresAt: Date | null): Promise<void>;
}

export function scopeKeyOf(scope: LockScope): string {
  return `${scope.kind}|${scope.method}|${scope.localDate}|${scope.slotId}`;
}

export function isLockActive(lock: Pick<LockRecord, 'expiresAt'>, now: Date): boolean {
  return lock.expiresAt === null || lock.expiresAt.getTime() > now.getTime();
}

async function reclaimIfExpired(store: LockStore, seen: LockRecord, now: Date): Promise<void> {
  // Re-read right before removing so a lock re-claimed since the listing is left alone.
  const fresh = await store.get(seen._id);
  if (fresh && fresh.reservationId === seen.reservationId && !isLockActive(fresh, now)) {
    await store.remove(seen._id);
  }
}

/**
 * Claims one seat of `capacity` for `reservationId`. With `capacity` 0 the
 * scope is unlimited: a seat keyed by the reservation is still written so usage
 * can be counted. Returns the lock ID, or null when every seat is taken.
 */
export async function claimSeat(
  store: LockStore,
  scope: LockScope,
  capacity: number,
  reservationId: string,
  expiresAt: Date | null,
  now: Date,
): Promise<string | null> {
  const scopeKey = scopeKeyOf(scope);
  const base = { ...scope, scopeKey, reservationId, expiresAt };

  if (capacity <= 0) {
    const id = `${scopeKey}|r:${reservationId}`;
    const result = await store.insert({ ...base, _id: id });
    if (result === 'inserted') return id;
    const existing = await store.get(id);
    return existing?.reservationId === reservationId ? id : null;
  }

  const existing = new Map((await store.listByScope(scopeKey)).map((l) => [l._id, l]));
  for (const held of existing.values()) {
    if (held.reservationId === reservationId && isLockActive(held, now)) return held._id;
  }

  for (let seat = 0; seat < capacity; seat += 1) {
    const id = `${scopeKey}|${seat}`;
    const seen = existing.get(id);
    if (seen && isLockActive(seen, now)) continue;
    if (seen) await reclaimIfExpired(store, seen, now);

    const result = await store.insert({ ...base, _id: id });
    if (result === 'duplicate') continue;
    // Confirm ownership: guards the narrow window where a concurrent reclaim
    // removed and replaced this seat between our insert and now.
    const verify = await store.get(id);
    if (verify?.reservationId === reservationId) return id;
  }
  return null;
}

/** Removes locks only when they still belong to `reservationId`. */
export async function releaseLocks(
  store: LockStore,
  lockIds: string[],
  reservationId: string,
): Promise<void> {
  for (const id of lockIds) {
    const lock = await store.get(id);
    if (lock && lock.reservationId === reservationId) await store.remove(id);
  }
}

/** True when every lock still exists and belongs to the reservation. */
export async function ownsAllLocks(
  store: LockStore,
  lockIds: string[],
  reservationId: string,
): Promise<boolean> {
  for (const id of lockIds) {
    const lock = await store.get(id);
    if (!lock || lock.reservationId !== reservationId) return false;
  }
  return true;
}
