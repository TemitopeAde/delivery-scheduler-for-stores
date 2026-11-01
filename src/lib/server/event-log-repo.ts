import { COLLECTIONS } from '../constants';
import { db, num, str, toDate, withRetry } from './data';

export type ProcessingStatus = 'processing' | 'processed' | 'skipped' | 'failed' | 'dead_letter';

export interface EventLogEntry {
  id: string;
  eventId: string;
  eventType: string;
  orderId: string | null;
  reservationId: string | null;
  idempotencyKey: string;
  processingStatus: ProcessingStatus;
  attemptCount: number;
  lastErrorCode: string | null;
  receivedAt: string;
  processedAt: string | null;
}

type Item = Record<string, unknown>;

function toEntry(item: Item): EventLogEntry {
  return {
    id: str(item._id),
    eventId: str(item.eventId),
    eventType: str(item.eventType),
    orderId: str(item.orderId) || null,
    reservationId: str(item.reservationId) || null,
    idempotencyKey: str(item.idempotencyKey),
    processingStatus: str(item.processingStatus, 'processing') as ProcessingStatus,
    attemptCount: num(item.attemptCount),
    lastErrorCode: str(item.lastErrorCode) || null,
    receivedAt: toDate(item.receivedAt)?.toISOString() ?? new Date(0).toISOString(),
    processedAt: toDate(item.processedAt)?.toISOString() ?? null,
  };
}

/** Item IDs are derived from the idempotency key, so a redelivered event maps to the same row. */
export function logIdFor(idempotencyKey: string): string {
  return idempotencyKey.replace(/[^A-Za-z0-9_.:-]/g, '_').slice(0, 200);
}

export async function getLogEntry(idempotencyKey: string): Promise<EventLogEntry | null> {
  const item = (await withRetry(() =>
    db.get(COLLECTIONS.eventLog, logIdFor(idempotencyKey), { consistentRead: true }),
  )) as Item | null;
  return item ? toEntry(item) : null;
}

export async function saveLogEntry(entry: EventLogEntry): Promise<void> {
  await withRetry(() =>
    db.save(COLLECTIONS.eventLog, {
      _id: entry.id,
      eventId: entry.eventId,
      eventType: entry.eventType,
      orderId: entry.orderId,
      reservationId: entry.reservationId,
      idempotencyKey: entry.idempotencyKey,
      processingStatus: entry.processingStatus,
      attemptCount: entry.attemptCount,
      lastErrorCode: entry.lastErrorCode,
      receivedAt: new Date(entry.receivedAt),
      processedAt: entry.processedAt ? new Date(entry.processedAt) : null,
    }),
  );
}

export async function listByStatus(statuses: ProcessingStatus[], limit: number): Promise<EventLogEntry[]> {
  const result = await db
    .query(COLLECTIONS.eventLog)
    .hasSome('processingStatus', statuses)
    .descending('receivedAt')
    .limit(limit)
    .find();
  return result.items.map((i) => toEntry(i as Item));
}

export async function countByProcessingStatus(statuses: ProcessingStatus[]): Promise<number> {
  return db.query(COLLECTIONS.eventLog).hasSome('processingStatus', statuses).count();
}

export async function lastProcessedEntry(): Promise<EventLogEntry | null> {
  const [entry] = await listByStatus(['processed', 'skipped'], 1);
  return entry ?? null;
}
