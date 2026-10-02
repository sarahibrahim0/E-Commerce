import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LocalizedText, SiteSettings } from '../models';

const LOCALIZED_FIELDS = ['title', 'description', 'keywords', 'about', 'faq', 'terms'] as const;

const STRING_FIELDS = [
  'logoUrl',
  'faviconUrl',
  'socialImageUrl',
  'canonicalUrl',
  'footerAddress',
  'footerPhone',
  'footerEmail',
  'footerWhatsapp',
  'businessHours',
  'footerFacebook',
  'footerTwitter',
  'footerInstagram',
  'footerAboutEn',
  'footerAboutAr',
  'defaultCurrency',
] as const;

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function localized(value: unknown): LocalizedText {
  if (typeof value === 'string') return value;
  const source = (value ?? {}) as { en?: string; ar?: string };
  return { en: text(source.en), ar: text(source.ar) };
}

function normalizeSiteSettings(raw: any): SiteSettings {
  const settings = {} as Record<string, unknown>;
  for (const field of LOCALIZED_FIELDS) settings[field] = localized(raw?.[field]);
  for (const field of STRING_FIELDS) settings[field] = text(raw?.[field]);
  return {
    ...(settings as unknown as SiteSettings),
    footerCategories: Array.isArray(raw?.footerCategories)
      ? raw.footerCategories.filter((id: unknown): id is string => typeof id === 'string')
      : [],
    enableCashOnDelivery: raw?.enableCashOnDelivery !== false,
  };
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private http = inject(HttpClient);

  // Shared across the footer and any other consumer, so the request is made once.
  private readonly settings$ = this.http
    .get(`${environment.apiUrl}settings/seo`)
    .pipe(map(normalizeSiteSettings), shareReplay({ bufferSize: 1, refCount: false }));

  get(): Observable<SiteSettings> {
    return this.settings$;
  }
}
