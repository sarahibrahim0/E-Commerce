const hasStorage = typeof localStorage !== 'undefined';
const hasSessionStorage = typeof sessionStorage !== 'undefined';

export function readStorage<T>(key: string, fallback: T): T {
  if (!hasStorage) return fallback;
  const raw = localStorage.getItem(key);
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function readStorageString(key: string, fallback: string | null): string | null {
  if (!hasStorage) return fallback;
  const raw = localStorage.getItem(key) ?? (hasSessionStorage ? sessionStorage.getItem(key) : null);
  return raw == null ? fallback : raw;
}

export function writeStorage(key: string, value: unknown): void {
  if (!hasStorage) return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function writeStorageString(key: string, value: string, persistent = true): void {
  if (!hasStorage) return;
  if (persistent) {
    if (hasSessionStorage) sessionStorage.removeItem(key);
    localStorage.setItem(key, value);
  } else {
    localStorage.removeItem(key);
    if (hasSessionStorage) sessionStorage.setItem(key, value);
  }
}

export function clearStorageKey(key: string): void {
  if (!hasStorage) return;
  localStorage.removeItem(key);
  if (hasSessionStorage) sessionStorage.removeItem(key);
}

export function hasStoredToken(): boolean {
  if (!hasStorage) return false;
  return localStorage.getItem('ecom.token') !== null ||
    (hasSessionStorage && sessionStorage.getItem('ecom.token') !== null);
}

/**
 * Writes freshly rotated tokens back to whichever storage currently holds the
 * session, so a session-scoped ("keep me logged in" off) login is not promoted
 * to persistent storage by a background refresh.
 */
export function persistRotatedTokens(token: string, refreshToken: string): void {
  if (!hasStorage) return;
  const sessionOnly = hasSessionStorage &&
    sessionStorage.getItem('ecom.token') !== null &&
    localStorage.getItem('ecom.token') === null;
  const store = sessionOnly ? sessionStorage : localStorage;
  store.setItem('ecom.token', token);
  store.setItem('ecom.refreshToken', refreshToken);
}
