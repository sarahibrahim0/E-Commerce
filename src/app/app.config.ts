import {
  APP_INITIALIZER,
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { initAppLocale } from './core/utils/locale';
import localeAr from '@angular/common/locales/ar';

registerLocaleData(localeAr);

export function applyDocumentLocale(localeId: string): () => void {
  return () => {
    initAppLocale(localeId);
    const isAr = String(localeId ?? 'en')
      .toLowerCase()
      .startsWith('ar');
    if (typeof document !== 'undefined') {
      document.documentElement.lang = isAr ? 'ar' : 'en';
      document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    }
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: false,
        },
      },
    }),
    { provide: APP_INITIALIZER, useFactory: applyDocumentLocale, deps: [LOCALE_ID], multi: true },
  ],
};
