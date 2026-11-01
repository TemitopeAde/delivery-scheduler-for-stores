import { isLockActive, type LockRecord, type LockStore } from '../capacity/locks';
import { COLLECTIONS } from '../constants';
import type { UsageCounter } from '../engine/types';
import type { FulfilmentMethod } from '../schemas';
import { db, isDuplicateItemError, str, toDate, withRetry } from './data';

type Item = Record<string, unknown>;

function toLock(item: Item): LockRecord {
  return {
    _id: str(item._id),
    scopeKey: str(item.scopeKey),
    kind: item.kind === 'day' ? 'day' : 'slot',
    method: item.method === 'pickup' ? 'pickup' : 'delivery',
    localDate: str(item.localDate),
    slotId: str(item.slotId),
    reservationId: str(item.reservationId),
    expiresAt: toDate(item.expiresAt),
  };
}

export const wixDataLockStore: LockStore = {
  async insert(lock) {
    try {
      await db.insert(COLLECTIONS.slotLocks, { ...lock });
      return 'inserted';
    } catch (error) {
      if (isDuplicateItemError(error)) return 'duplicate';
      throw error;
    }
  },
  async get(id) {
    const item = (await withRetry(() =>
      db.get(COLLECTIONS.slotLocks, id, { consistentRead: true }),
    )) as Item | null;
    return item ? toLock(item) : null;
  },
  async remove(id) {
    await withRetry(() => db.remove(COLLECTIONS.slotLocks, id));
  },
  async listByScope(scopeKey) {
    const result = await withRetry(() =>
      db.query(COLLECTIONS.slotLocks).eq('scopeKey', scopeKey).limit(1000).find({ consistentRead: true }),
    );
    return result.items.map((i) => toLock(i as Item));
  },
  async setExpiry(id, expiresAt) {
    const item = (await db.get(COLLECTIONS.slotLocks, id, { consistentRead: true })) as Item | null;
    if (!item) return;
    await withRetry(() =>
      db.update(COLLECTIONS.slotLocks, { ...item, _id: id, expiresAt } as Item & { _id: string }),
    );
  },
};

/** Counts active capacity locks per slot and per day for availability display. */
export async function loadUsage(
  method: FulfilmentMethod,
  from: string,
  to: string,
  now: Date,
): Promise<UsageCounter> {
  const slotCounts = new Map<string, number>();
  const dayCounts = new Map<string, number>();
  let page = await withRetry(() =>
    db
      .query(COLLECTIONS.slotLocks)
      .eq('method', method)
      .ge('localDate', from)
      .le('localDate', to)
      .limit(1000)
      .find(),
  );
  for (;;) {
    for (const raw of page.items) {
      const lock = toLock(raw as Item);
      if (!isLockActive(lock, now)) continue;
      const counts = lock.kind === 'day' ? dayCounts : slotCounts;
      const key = lock.kind === 'day' ? lock.localDate : `${lock.localDate}|${lock.slotId}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    if (!page.hasNext()) break;
    page = await page.next();
  }
  return {
    slotCount: (_m, date, slotId) => slotCounts.get(`${date}|${slotId}`) ?? 0,
    dayCount: (_m, date) => dayCounts.get(date) ?? 0,
  };
}
