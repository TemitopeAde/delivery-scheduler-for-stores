import type { APIRoute } from 'astro';
import { handler, json } from '../../../lib/server/http';
import { overview } from '../../../lib/server/insights';

export const GET: APIRoute = handler('dashboard', 'overview.get', async () => json(await overview()));
