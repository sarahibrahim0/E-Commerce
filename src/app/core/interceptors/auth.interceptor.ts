import { HttpClient, HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { BehaviorSubject, Observable, catchError, filter, switchMap, take, throwError, timer } from 'rxjs';
import { environment } from '../../../environments/environment';

let isRefreshing = false;
const refreshSubject = new BehaviorSubject<string | null>(null);
let refreshTimeoutId: any = null;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (isPlatformServer(inject(PLATFORM_ID))) {
    return next(req);
  }
  const http = inject(HttpClient);
  const token = localStorage.getItem('ecom.token');
  const needsAuth = !isPublicUrl(req.url);
  const authReq = token && needsAuth
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  scheduleProactiveRefresh(http);

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && needsAuth) {
        return refreshTokenAndRetry(http, req, next);
      }
      if (error.status === 403 && error.error?.message?.includes('token already used')) {
        return refreshTokenAndRetry(http, req, next);
      }
      return throwError(() => error);
    }),
  );
};

function isPublicUrl(url: string): boolean {
  return (
    url.includes('/users/login') ||
    url.includes('/users/register') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/logout') ||
    url.includes('/forgot-password') ||
    url.includes('/reset-password') ||
    url.includes('/verify-email')
  );
}

function scheduleProactiveRefresh(http: HttpClient): void {
  if (refreshTimeoutId) return;
  const token = localStorage.getItem('ecom.token');
  if (!token) return;
  const payload = parseJwt(token);
  if (!payload?.exp) return;
  const expiryMs = payload.exp * 1000;
  const now = Date.now();
  const timeUntilExpiry = expiryMs - now;
  const refreshBeforeExpiry = 2 * 60 * 1000;
  const delay = Math.max(timeUntilExpiry - refreshBeforeExpiry, 1000);
  if (delay < timeUntilExpiry) {
    refreshTimeoutId = setTimeout(() => {
      refreshTimeoutId = null;
      const rt = localStorage.getItem('ecom.refreshToken');
      if (rt) {
        http.post<{ accessToken: string; refreshToken: string }>(
          `${environment.apiUrl}auth/refresh`,
          { refreshToken: rt },
        ).subscribe({
          next: (res) => {
            localStorage.setItem('ecom.token', res.accessToken);
            localStorage.setItem('ecom.refreshToken', res.refreshToken);
            scheduleProactiveRefresh(http);
          },
          error: () => { /* ignore; interceptor will handle on next 401 */ },
        });
      }
    }, delay);
  }
}

function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function refreshTokenAndRetry(
  http: HttpClient,
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const refreshToken = localStorage.getItem('ecom.refreshToken');
  if (!refreshToken) {
    clearSession();
    return throwError(() => new Error($localize`Session expired. Please sign in again.`));
  }

  if (!isRefreshing) {
    isRefreshing = true;
    refreshSubject.next(null);

    return http
      .post<{ accessToken: string; refreshToken: string }>(
        `${environment.apiUrl}auth/refresh`,
        { refreshToken },
      )
      .pipe(
        switchMap((res) => {
          isRefreshing = false;
          localStorage.setItem('ecom.token', res.accessToken);
          localStorage.setItem('ecom.refreshToken', res.refreshToken);
          refreshSubject.next(res.accessToken);
          scheduleProactiveRefresh(http);
          return next(req.clone({ setHeaders: { Authorization: `Bearer ${res.accessToken}` } }));
        }),
        catchError((err: HttpErrorResponse) => {
          isRefreshing = false;
          refreshSubject.next(null);
          if (err.status === 401) {
            clearSession();
          }
          return throwError(() => err);
        }),
      );
  }

  return refreshSubject.pipe(
    filter((value): value is string => value !== null),
    take(1),
    switchMap((token) => next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }))),
  );
}

function clearSession(): void {
  localStorage.removeItem('ecom.token');
  localStorage.removeItem('ecom.userId');
  localStorage.removeItem('ecom.refreshToken');
  if (refreshTimeoutId) {
    clearTimeout(refreshTimeoutId);
    refreshTimeoutId = null;
  }
  if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
    window.location.href = '/login';
  }
}