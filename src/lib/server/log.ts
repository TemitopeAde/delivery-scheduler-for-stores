/**
 * Structured logs with safe fields only: IDs, operation names and error codes.
 * Never pass tokens, emails, addresses or full order payloads here.
 */
type LogFields = Record<string, string | number | boolean | null | undefined>;

type UnknownRecord = Record<string, unknown>;

function errorCode(error: unknown): string {
  if (error && typeof error === 'object') {
    const code = (error as { code?: unknown }).code;
    if (typeof code === 'string') return code;
    const name = (error as { name?: unknown }).name;
    if (typeof name === 'string') return name;
  }
  return 'UNKNOWN';
}

function errorDetails(error: unknown): Partial<Pick<LogFields, 'errorMessage' | 'errorRequestId' | 'errorStatus'>> {
  if (!error || typeof error !== 'object') return {};
  const value = error as UnknownRecord;
  const details = value.details as UnknownRecord | undefined;
  const applicationError = details?.applicationError as UnknownRecord | undefined;
  const data = applicationError?.data as UnknownRecord | undefined;
  return {
    errorMessage: typeof value.message === 'string' ? value.message : null,
    errorRequestId: typeof data?.requestId === 'string' ? data.requestId : null,
    errorStatus:
      typeof applicationError?.code === 'number'
        ? applicationError.code
        : typeof value.status === 'number'
          ? value.status
          : null,
  };
}

export const log = {
  info(operation: string, fields: LogFields = {}) {
    console.log(JSON.stringify({ level: 'info', operation, ...fields }));
  },
  error(operation: string, error: unknown, fields: LogFields = {}) {
    console.error(JSON.stringify({ level: 'error', operation, errorCode: errorCode(error), ...errorDetails(error), ...fields }));
  },
  errorCode,
};
