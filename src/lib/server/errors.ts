export type ErrorCode =
  | 'INVALID_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'CONFLICT'
  | 'PLAN_REQUIRED'
  | 'SCHEDULING_DISABLED'
  | 'CHECKOUT_NOT_FOUND'
  | 'CHECKOUT_COMPLETED'
  | 'SLOT_UNAVAILABLE'
  | 'SLOT_FULL'
  | 'STALE_SETTINGS'
  | 'RESERVATION_NOT_FOUND'
  | 'INTERNAL';

const STATUS: Record<ErrorCode, number> = {
  INVALID_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  CONFLICT: 409,
  PLAN_REQUIRED: 402,
  SCHEDULING_DISABLED: 409,
  CHECKOUT_NOT_FOUND: 404,
  CHECKOUT_COMPLETED: 409,
  SLOT_UNAVAILABLE: 409,
  SLOT_FULL: 409,
  STALE_SETTINGS: 409,
  RESERVATION_NOT_FOUND: 404,
  INTERNAL: 500,
};

/** An error whose code and message are safe to return to the caller. */
export class AppError extends Error {
  readonly status: number;
  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.status = STATUS[code];
  }
}
