import { HttpErrorResponse } from '@angular/common/http';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface HttpErrorLike {
  status?: number;
  error?: string | { message?: string } | ProgressEvent | null;
}

/**
 * A status of 0 means the browser never got a response at all: the device is
 * offline, DNS failed, CORS blocked it, or the request timed out. That is a
 * different situation from the server answering with an error, so it gets its
 * own message instead of leaking "status 0"/"Unknown Error" to the user.
 *
 * Only real HTTP failures count. A plain Error thrown by application code has
 * no status and usually carries a message worth showing.
 */
export function normalizeApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  const http = err as HttpErrorLike;
  const status = http?.status ?? 0;
  const isHttpFailure = err instanceof HttpErrorResponse || typeof http?.status === 'number';

  let message = $localize`Something went wrong`;
  if (typeof http?.error === 'string') {
    message = http.error;
  } else if (http?.error && typeof http.error === 'object' && 'message' in http.error) {
    message = (http.error as { message?: string }).message || message;
  } else if (isHttpFailure && status === 0) {
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
    return new ApiError(
      0,
      offline
        ? $localize`:@@networkOffline:You appear to be offline. Check your connection and try again.`
        : $localize`:@@networkUnreachable:We could not reach the server. Please try again in a moment.`,
    );
  } else if (err instanceof Error && err.message) {
    message = err.message;
  }
  return new ApiError(status, message);
}
