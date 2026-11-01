import type { APIRoute } from 'astro';
import { holdRequestSchema } from '../../../lib/schemas';
import { createHold } from '../../../lib/server/holds';
import { handler, json, readJson } from '../../../lib/server/http';

/** POST /api/reservations/hold — validates the selection and claims capacity atomically. */
export const POST: APIRoute = handler('site', 'reservations.hold', async (request) => {
  const body = holdRequestSchema.parse(await readJson(request));
  return json({ hold: await createHold(body) }, 201);
});
