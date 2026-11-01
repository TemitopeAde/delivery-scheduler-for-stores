import type { APIRoute } from 'astro';
import { resolveEntitlement } from '../../../lib/server/entitlements';
import { handler, json } from '../../../lib/server/http';

export const GET: APIRoute = handler('dashboard', 'plan.get', async () => json(await resolveEntitlement()));
