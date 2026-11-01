import type { APIRoute } from 'astro';
import { bulkStatusSchema } from '../../../../lib/schemas';
import { handler, json, readJson } from '../../../../lib/server/http';
import { bulkSetStatus } from '../../../../lib/server/order-admin';

export const POST: APIRoute = handler('dashboard', 'orders.bulkStatus', async (request) => {
  const body = bulkStatusSchema.parse(await readJson(request));
  return json(await bulkSetStatus(body.orderIds, body.scheduleStatus));
});
