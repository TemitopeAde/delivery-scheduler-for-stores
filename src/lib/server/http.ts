import { auth } from '@wix/essentials';
import { z } from 'zod';
import { AppError } from './errors';
import { log } from './log';

interface TokenInfo {
  active: boolean;
  subjectType: 'APP' | 'USER' | 'MEMBER' | 'VISITOR' | 'UNKNOWN';
  subjectId: string;
  siteId: string;
  instanceId?: string;
}

export interface RequestContext {
  requestId: string;
  token: TokenInfo;
  params: Record<string, string | undefined>;
}

const NO_STORE = { 'Cache-Control': 'no-store' };

export function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: NO_STORE });
}

function errorResponse(error: AppError, requestId: string): Response {
  return json({ error: { code: error.code, message: error.message, details: error.details }, requestId }, error.status);
}

async function tokenInfo(): Promise<TokenInfo> {
  try {
    const info = await auth.getTokenInfo();
    if (!info.active) throw new AppError('UNAUTHORIZED', 'Your session has expired.');
    return info;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('UNAUTHORIZED', 'Authentication is required.');
  }
}

type Audience = 'dashboard' | 'site';

/**
 * Wraps an endpoint: authenticates the Wix caller, enforces the audience, and
 * maps errors to stable codes. `dashboard` endpoints accept only Wix users
 * (site owners and collaborators); `site` endpoints accept visitors and members.
 */
export function handler(
  audience: Audience,
  operation: string,
  fn: (request: Request, ctx: RequestContext) => Promise<Response>,
): (context: { request: Request; params: Record<string, string | undefined> }) => Promise<Response> {
  return async ({ request, params }) => {
    const requestId = crypto.randomUUID();
    try {
      const token = await tokenInfo();
      const allowed =
        audience === 'dashboard'
          ? token.subjectType === 'USER'
          : ['VISITOR', 'MEMBER', 'USER'].includes(token.subjectType);
      if (!allowed) throw new AppError('FORBIDDEN', 'You do not have access to this resource.');
      if (audience === 'site') enforceRateLimit(`${token.instanceId ?? token.siteId}:${token.subjectId}`);
      return await fn(request, { requestId, token, params });
    } catch (error) {
      if (error instanceof AppError) {
        if (error.status >= 500) log.error(operation, error, { requestId });
        return errorResponse(error, requestId);
      }
      if (error instanceof z.ZodError) {
        return errorResponse(
          new AppError('INVALID_REQUEST', 'The request is invalid.', {
            issues: error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
          }),
          requestId,
        );
      }
      log.error(operation, error, { requestId });
      return errorResponse(new AppError('INTERNAL', 'Something went wrong. Please try again.'), requestId);
    }
  };
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new AppError('INVALID_REQUEST', 'The request body must be valid JSON.');
  }
}

export function queryParams(request: Request): Record<string, string> {
  return Object.fromEntries(new URL(request.url).searchParams.entries());
}

// Best-effort, per runtime instance. Backend instances are not shared, so this
// throttles bursts from one caller but is not a global quota.
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;
const buckets = new Map<string, { count: number; resetAt: number }>();

function enforceRateLimit(key: string): void {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    if (buckets.size > 5000) {
      for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
    }
    return;
  }
  bucket.count += 1;
  if (bucket.count > MAX_REQUESTS) {
    throw new AppError('RATE_LIMITED', 'Too many requests. Please wait a moment and try again.');
  }
}
