import type { APIRoute } from 'astro';
import { z } from 'zod';
import { handler, json, queryParams } from '../../../lib/server/http';
import { listRules } from '../../../lib/server/product-rules-repo';

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  cursor: z.coerce.number().int().min(0).default(0),
  search: z.string().max(100).optional(),
});

export const GET: APIRoute = handler('dashboard', 'productRules.list', async (request) => {
  const q = querySchema.parse(queryParams(request));
  const { rules, hasNext } = await listRules({ limit: q.limit, offset: q.cursor, search: q.search });
  return json({ rules, nextCursor: hasNext ? q.cursor + q.limit : null });
});
