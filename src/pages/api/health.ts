import type { APIRoute } from 'astro';

/** GET /api/health — liveness only; reveals nothing about the site or its data. */
export const GET: APIRoute = async () =>
  Response.json({ ok: true, time: new Date().toISOString() }, { headers: { 'Cache-Control': 'no-store' } });
