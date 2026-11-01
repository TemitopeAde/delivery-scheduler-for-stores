import type { APIRoute } from 'astro';
import { orderPatchSchema } from '../../../../lib/schemas';
import { AppError } from '../../../../lib/server/errors';
import { handler, json, readJson } from '../../../../lib/server/http';
import { orderDetail, patchOrder } from '../../../../lib/server/order-admin';

function orderIdOf(params: Record<string, string | undefined>): string {
  const id = params.orderId;
  if (!id || id.length > 64) throw new AppError('INVALID_REQUEST', 'An order ID is required.');
  return id;
}

export const GET: APIRoute = handler('dashboard', 'orders.get', async (_request, { params }) =>
  json(await orderDetail(orderIdOf(params))),
);

/** PATCH changes app-owned scheduling fields only; the Wix order is never modified. */
export const PATCH: APIRoute = handler('dashboard', 'orders.patch', async (request, { params }) => {
  const patch = orderPatchSchema.parse(await readJson(request));
  return json({ order: await patchOrder(orderIdOf(params), patch) });
});
