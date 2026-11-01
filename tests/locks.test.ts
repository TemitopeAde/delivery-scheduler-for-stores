import { describe, expect, it } from 'vitest';
import {
  claimSeat,
  ownsAllLocks,
  releaseLocks,
  type LockRecord,
  type LockScope,
  type LockStore,
} from '../src/lib/capacity/locks';

/** In-memory store with the same uniqueness contract as Wix Data `_id`s, and real interleaving. */
class MemoryLockStore implements LockStore {
  items = new Map<string, LockRecord>();
  private tick = () => new Promise<void>((resolve) => setTimeout(resolve, Math.random() * 3));

  async insert(lock: LockRecord) {
    await this.tick();
    if (this.items.has(lock._id)) return 'duplicate' as const;
    this.items.set(lock._id, { ...lock });
    return 'inserted' as const;
  }
  async get(id: string) {
    await this.tick();
    const lock = this.items.get(id);
    return lock ? { ...lock } : null;
  }
  async remove(id: string) {
    await this.tick();
    this.items.delete(id);
  }
  async listByScope(scopeKey: string) {
    await this.tick();
    return [...this.items.values()].filter((l) => l.scopeKey === scopeKey).map((l) => ({ ...l }));
  }
  async setExpiry(id: string, expiresAt: Date | null) {
    const lock = this.items.get(id);
    if (lock) lock.expiresAt = expiresAt;
  }
}

const scope: LockScope = { kind: 'slot', method: 'delivery', localDate: '2026-10-28', slotId: '0900-1100' };
const now = new Date('2026-10-27T10:00:00Z');
const later = new Date('2026-10-27T10:30:00Z');

describe('claimSeat', () => {
  it('lets only one of many simultaneous requests take the final seat', async () => {
    for (let run = 0; run < 25; run += 1) {
      const store = new MemoryLockStore();
      const results = await Promise.all(
        Array.from({ length: 8 }, (_, i) => claimSeat(store, scope, 1, `r${i}`, later, now)),
      );
      expect(results.filter((r) => r !== null)).toHaveLength(1);
      expect(store.items.size).toBe(1);
    }
  });

  it('never grants more seats than capacity under contention', async () => {
    const store = new MemoryLockStore();
    const results = await Promise.all(
      Array.from({ length: 12 }, (_, i) => claimSeat(store, scope, 3, `r${i}`, later, now)),
    );
    expect(results.filter((r) => r !== null)).toHaveLength(3);
  });

  it('is idempotent for the same reservation', async () => {
    const store = new MemoryLockStore();
    const first = await claimSeat(store, scope, 2, 'r1', later, now);
    const again = await claimSeat(store, scope, 2, 'r1', later, now);
    expect(again).toBe(first);
    expect(store.items.size).toBe(1);
  });

  it('reclaims an expired hold but never a confirmed one', async () => {
    const store = new MemoryLockStore();
    await claimSeat(store, scope, 1, 'expired', new Date('2026-10-27T09:00:00Z'), now);
    expect(await claimSeat(store, scope, 1, 'fresh', later, now)).not.toBeNull();

    const confirmed = new MemoryLockStore();
    await claimSeat(confirmed, scope, 1, 'order', null, now);
    expect(await claimSeat(confirmed, scope, 1, 'other', later, now)).toBeNull();
  });

  it('counts unlimited scopes without blocking', async () => {
    const store = new MemoryLockStore();
    const ids = await Promise.all(['a', 'b', 'c'].map((r) => claimSeat(store, scope, 0, r, later, now)));
    expect(ids.every((id) => id !== null)).toBe(true);
    expect(store.items.size).toBe(3);
  });
});

describe('release and ownership', () => {
  it('releases only locks that still belong to the reservation', async () => {
    const store = new MemoryLockStore();
    const id = await claimSeat(store, scope, 1, 'r1', later, now);
    expect(id).not.toBeNull();
    if (!id) return;
    await releaseLocks(store, [id], 'someone-else');
    expect(await ownsAllLocks(store, [id], 'r1')).toBe(true);
    await releaseLocks(store, [id], 'r1');
    expect(await ownsAllLocks(store, [id], 'r1')).toBe(false);
  });
});
