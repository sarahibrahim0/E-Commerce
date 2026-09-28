const hasStorage = typeof localStorage !== 'undefined';

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
  const raw = localStorage.getItem(key);
  return raw == null ? fallback : raw;
}

export function writeStorage(key: string, value: unknown): void {
  if (!hasStorage) return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function writeStorageString(key: string, value: string): void {
  if (!hasStorage) return;
  localStorage.setItem(key, value);
}

export function clearStorageKey(key: string): void {
  if (!hasStorage) return;
  localStorage.removeItem(key);
}

export function hasStoredToken(): boolean {
  if (!hasStorage) return false;
  return localStorage.getItem('ecom.token') !== null;
}