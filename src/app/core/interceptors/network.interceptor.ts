import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { ConnectivityService } from '../services/connectivity.service';
import { ToastService } from '../../shared/toast/toast.service';

const RETRYED_HEADER = 'x-network-retry';
const MAX_RETRIES = 2;

/** Statuses that mean the request never got a real answer from the app. */
function isTransient(err: unknown): boolean {
  const status = statusOf(err);
  if (status === 0) return true;
  if (status === 408 || status === 502 || status === 503 || status === 504) return true;
  return (err as { name?: string } | null)?.name === 'TimeoutError';
}

function statusOf(err: unknown): number {
  if (err instanceof HttpErrorResponse) return err.status;
  const raw = err as { status?: number } | null;
  return typeof raw?.status === 'number' ? raw.status : -1;
}

function isIdempotent(req: HttpRequest<unknown>): boolean {
  return req.method === 'GET' || req.method === 'HEAD';
}

export const networkInterceptor: HttpInterceptorFn = (req, next) => {
  if (isPlatformServer(inject(PLATFORM_ID))) return next(req);

  const connectivity = inject(ConnectivityService);
  const toasts = inject(ToastService);
  let notified = false;

  const run = (request: HttpRequest<unknown>, depth: number): Observable<HttpEvent<unknown>> =>
    next(request).pipe(
      // Any response at all proves the server is reachable.
      tap(() => connectivity.reportReachable()),
      catchError((err: unknown) => {
        if (!isTransient(err)) {
          connectivity.reportReachable();
          return throwError(() => err);
        }

        connectivity.reportUnreachable();
        if (!notified) {
          notified = true;
          toasts.show(
            isBrowserOffline()
              ? $localize`:@@networkOffline:You appear to be offline. Check your connection and try again.`
              : $localize`:@@networkUnreachable:We could not reach the server. Please try again in a moment.`,
            'error',
            6000,
          );
        }

        // Only replay reads, and never more than the budget: a POST that failed
        // on a dropped connection may already have reached the server.
        if (!isIdempotent(request) || depth >= MAX_RETRIES) {
          return throwError(() => err);
        }

        const retryReq = request.clone({ setHeaders: { [RETRYED_HEADER]: String(depth + 1) } });
        return run(retryReq, depth + 1);
      }),
    );

  return run(req, 0);
};

function isBrowserOffline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}
