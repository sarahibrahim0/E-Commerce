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
  error?: string | { message?: string };
}

export function normalizeApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  const http = err as HttpErrorLike;
  const status = http.status ?? 0;
  let message = $localize`Something went wrong`;
  if (typeof http.error === 'string') {
    message = http.error;
  } else if (http.error?.message) {
    message = http.error.message;
  } else if (err instanceof Error) {
    message = err.message;
  }
  return new ApiError(status, message);
}
