import type { APIRoute } from 'astro';
import { ordersQuerySchema } from '../../../../lib/schemas';
import { resolveEntitlement } from '../../../../lib/server/entitlements';
import { AppError } from '../../../../lib/server/errors';
import { handler, queryParams } from '../../../../lib/server/http';
import { exportCsv } from '../../../../lib/server/insights';

/** GET /api/dashboard/orders/export — CSV of the filtered records (Pro). */
export const GET: APIRoute = handler('dashboard', 'orders.export', async (request) => {
  const { plan } = await resolveEntitlement();
  if (plan !== 'pro') throw new AppError('PLAN_REQUIRED', 'Upgrade to Pro to export orders.');
  const { limit: _limit, cursor: _cursor, ...query } = ordersQuerySchema.parse(queryParams(request));
  const csv = await exportCsv(query);
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="scheduled-orders.csv"',
      'Cache-Control': 'no-store',
    },
  });
});
