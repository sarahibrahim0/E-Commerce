let activeLocale: 'ar' | 'en' = 'en';

export function initAppLocale(localeId: string): void {
  activeLocale = String(localeId ?? 'en').toLowerCase().startsWith('ar') ? 'ar' : 'en';
}

export function appLocale(): 'ar' | 'en' {
  return activeLocale;
}