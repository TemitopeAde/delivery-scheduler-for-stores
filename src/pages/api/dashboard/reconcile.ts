import type { APIRoute } from 'astro';
import { listByStatus } from '../../../lib/server/event-log-repo';
import { expireStaleHolds } from '../../../lib/server/holds';
import { handler, json } from '../../../lib/server/http';
import { retryEvent } from '../../../lib/server/order-sync';

/**
 * POST /api/dashboard/reconcile — expires lapsed holds and retries failed and
 * dead-lettered order events against the current order state. Bounded per call
 * to stay inside backend request limits; run again to continue.
 */
export const POST: APIRoute = handler('dashboard', 'reconcile', async () => {
  const expiredHolds = await expireStaleHolds(new Date(), 25);
  const failed = await listByStatus(['failed', 'dead_letter'], 5);
  const retried: Array<{ orderId: string | null; status: string }> = [];
  for (const entry of failed) {
    retried.push({ orderId: entry.orderId, status: await retryEvent(entry) });
  }
  return json({ expiredHolds, retried });
});
