import type { APIRoute } from 'astro';
import { handler, json } from '../../../lib/server/http';
import { diagnostics } from '../../../lib/server/insights';

export const GET: APIRoute = handler('dashboard', 'diagnostics.get', async () => json(await diagnostics()));
