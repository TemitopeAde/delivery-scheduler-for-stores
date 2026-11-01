import type { APIRoute } from 'astro';
import { availabilityQuerySchema } from '../../lib/schemas';
import { handler, json, queryParams } from '../../lib/server/http';
import { widgetPayload } from '../../lib/server/widget-config';

/** GET /api/availability?checkoutId=…&method=delivery&from=YYYY-MM-DD&to=YYYY-MM-DD */
export const GET: APIRoute = handler('site', 'availability.get', async (request) => {
  const query = availabilityQuerySchema.parse(queryParams(request));
  return json(await widgetPayload(query));
});
