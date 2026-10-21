import {
  APP_INITIALIZER,
  ApplicationConfig,
  ErrorHandler,
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
import { networkInterceptor } from './core/interceptors/network.interceptor';
import { initAppLocale } from './core/utils/locale';
import { pickText } from './core/utils/localize';
import { ChunkReloadErrorHandler } from './core/services/chunk-reload.handler';
import { SettingsService } from './core/services/settings.service';
import localeAr from '@angular/common/locales/ar';

registerLocaleData(localeAr);

const CHUNK_RELOAD_FLAG = 'ecom.chunkReload';

// The error handler sets this flag right before it force-reloads on a stale
// chunk. Clearing it a few seconds after a healthy boot means a *later* stale
// chunk (e.g. the deploy after this one) can trigger another auto-reload.
export function clearChunkReloadFlag(): () => void {
  return () => {
    if (typeof window === 'undefined') return;
    window.setTimeout(() => {
      try {
        sessionStorage.removeItem(CHUNK_RELOAD_FLAG);
      } catch {
        /* storage may be unavailable (private mode) */
      }
    }, 8000);
  };
}

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

export function applyDocumentTitle(settings: SettingsService): () => void {
  return () => {
    settings.get().subscribe((s) => {
      if (!s.title || typeof document === 'undefined') return;
      document.title = pickText(s.title);
    });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: ErrorHandler, useClass: ChunkReloadErrorHandler },
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor, networkInterceptor])),
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
    { provide: APP_INITIALIZER, useFactory: applyDocumentTitle, deps: [SettingsService], multi: true },
    { provide: APP_INITIALIZER, useFactory: clearChunkReloadFlag, multi: true },
  ],
};
