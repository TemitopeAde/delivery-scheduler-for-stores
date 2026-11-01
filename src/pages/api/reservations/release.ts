import type { APIRoute } from 'astro';
import { releaseRequestSchema } from '../../../lib/schemas';
import { releaseHold } from '../../../lib/server/holds';
import { handler, json, readJson } from '../../../lib/server/http';

/** POST /api/reservations/release — gives back a held (not confirmed) selection. */
export const POST: APIRoute = handler('site', 'reservations.release', async (request) => {
  const body = releaseRequestSchema.parse(await readJson(request));
  return json({ hold: await releaseHold(body.checkoutId, body.reservationId) });
});
