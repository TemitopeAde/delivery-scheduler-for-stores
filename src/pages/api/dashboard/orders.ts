import type { APIRoute } from 'astro';
import { ordersQuerySchema } from '../../../lib/schemas';
import { handler, json, queryParams } from '../../../lib/server/http';
import { queryScheduledOrders } from '../../../lib/server/scheduled-orders-repo';

/** GET /api/dashboard/orders — server-side filtering and offset paging. */
export const GET: APIRoute = handler('dashboard', 'orders.list', async (request) => {
  const query = ordersQuerySchema.parse(queryParams(request));
  return json(await queryScheduledOrders(query));
});
