import type { APIRoute } from 'astro';
import { currentHoldQuerySchema } from '../../../lib/schemas';
import { currentHold } from '../../../lib/server/holds';
import { handler, json, queryParams } from '../../../lib/server/http';

/** GET /api/reservations/current?checkoutId=… — restores the selection after a refresh. */
export const GET: APIRoute = handler('site', 'reservations.current', async (request) => {
  const { checkoutId } = currentHoldQuerySchema.parse(queryParams(request));
  return json({ hold: await currentHold(checkoutId) });
});
