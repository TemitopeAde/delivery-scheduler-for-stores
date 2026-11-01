import { items } from '@wix/data';
import { auth } from '@wix/essentials';

/**
 * App collections are PRIVILEGED for every operation, so backend code reads and
 * writes them elevated. Callers authorize the request before reaching here.
 */
export const db = {
  get: auth.elevate(items.get),
  query: auth.elevate(items.query),
  insert: auth.elevate(items.insert),
  update: auth.elevate(items.update),
  save: auth.elevate(items.save),
  remove: auth.elevate(items.remove),
  bulkUpdate: auth.elevate(items.bulkUpdate),
};

/** Wix Data rejects an insert whose `_id` already exists with WDE0074. */
export function isDuplicateItemError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const code = (error as { code?: unknown }).code;
  const message = (error as { message?: unknown }).message;
  return (
    code === 'WDE0074' ||
    (typeof message === 'string' && (message.includes('WDE0074') || /already exists/i.test(message)))
  );
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Bounded exponential backoff for transient storage/API failures. */
export async function withRetry<T>(operation: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (isDuplicateItemError(error)) throw error;
      lastError = error;
      if (attempt < attempts - 1) await sleep(150 * 2 ** attempt);
    }
  }
  throw lastError;
}

export function toDate(value: unknown): Date | null {
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (value && typeof value === 'object' && '$date' in value) {
    return toDate((value as { $date: unknown }).$date);
  }
  return null;
}

export const str = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;
export const num = (value: unknown, fallback = 0): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;
export const strArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
