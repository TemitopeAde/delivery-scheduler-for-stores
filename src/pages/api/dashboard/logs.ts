import type { APIRoute } from 'astro';
import { items as dataItems } from '@wix/data';
import { z } from 'zod';
import { COLLECTIONS } from '../../../lib/constants';
import { db, str, toDate, withRetry } from '../../../lib/server/data';
import { handler, json, queryParams } from '../../../lib/server/http';

const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  cursor: z.coerce.number().int().min(0).optional(),
  search: z.string().trim().max(120).optional(),
});

type LogItem = Record<string, unknown>;

function toLog(item: LogItem) {
  return {
    id: str(item._id),
    operation: str(item.operation),
    outcome: str(item.outcome),
    reason: str(item.reason),
    requestId: str(item.requestId),
    purchaseFlowId: str(item.purchaseFlowId),
    source: str(item.source),
    reservationId: str(item.reservationId),
    errorCode: str(item.errorCode),
    createdAt: toDate(item.createdAt)?.toISOString() ?? '',
  };
}

export const GET: APIRoute = handler('dashboard', 'logs.list', async (request) => {
  const { limit = 50, cursor = 0, search = '' } = listQuerySchema.parse(queryParams(request));
  const result = await withRetry(() => {
    let query = db.query(COLLECTIONS.logs);
    if (search) {
      const matches = dataItems
        .filter()
        .contains('operation', search)
        .or(dataItems.filter().contains('outcome', search))
        .or(dataItems.filter().contains('reason', search))
        .or(dataItems.filter().contains('errorCode', search))
        .or(dataItems.filter().contains('requestId', search))
        .or(dataItems.filter().contains('purchaseFlowId', search))
        .or(dataItems.filter().contains('reservationId', search));
      query = query.and(matches);
    }
    return query
      .descending('createdAt')
      .skip(cursor)
      .limit(limit + 1)
      .fields('_id', 'operation', 'outcome', 'reason', 'requestId', 'purchaseFlowId', 'source', 'reservationId', 'errorCode', 'createdAt')
      .find();
  });
  const hasNext = result.items.length > limit;
  const rows = result.items.slice(0, limit).map((item) => toLog(item));

  return json({ logs: rows, nextCursor: hasNext ? cursor + limit : null });
});
