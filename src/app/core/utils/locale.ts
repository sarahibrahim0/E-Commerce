let activeLocale: 'ar' | 'en' = 'en';

export function initAppLocale(localeId: string): void {
  activeLocale = String(localeId ?? 'en').toLowerCase().startsWith('ar') ? 'ar' : 'en';
}

export function appLocale(): 'ar' | 'en' {
  return activeLocale;
}

// The locale segment the app is currently served under (`/en/`, `/ar/`), or null
// for non-localized builds (`ng serve` serves at the root). Used to build
// locale-aware return URLs for payment gateways.
export function appLocalePath(): 'ar' | 'en' | null {
  if (typeof document === 'undefined') return null;
  const base = document.querySelector('base')?.getAttribute('href') || '';
  const match = /^\/(en|ar)(?:\/|$)/.exec(base);
  return match ? (match[1] as 'ar' | 'en') : null;
}