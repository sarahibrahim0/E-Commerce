import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ServerCountry, ServerCurrency } from '../models';
import { CatalogService } from '../services/catalog.service';
import { formatPrice } from '../utils/price';
import { pickText } from '../utils/localize';

const STORAGE_KEY = 'ecom.region.country';
const CURRENCY_STORAGE_KEY = 'ecom.region.currency';

export interface DisplayCurrency {
  code: string;
  symbol: string;
  rate: number;
}

export interface RegionCountryOption {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
  currencyCode: string;
}

export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
  flag: string;
}

const BASE_CURRENCY: DisplayCurrency = { code: 'EGP', symbol: 'E£', rate: 1 };

// Single source of truth for the shopper's country (and therefore the currency
// every price is shown in). Product prices are stored in the base currency, so
// the displayed amount is always `base * rate`. No country selected => base
// currency (Egypt/EGP).
@Injectable({ providedIn: 'root' })
export class RegionStore {
  private catalog = inject(CatalogService);

  readonly countries = signal<ServerCountry[]>([]);
  readonly currencies = signal<ServerCurrency[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly countryCode = signal<string>(this.readStoredCountry());
  /** Explicit display-currency choice made in the header dropdown. */
  readonly currencyOverride = signal<string>(this.readStoredCurrency());

  private loaded = false;
  private pending: Promise<void> | null = null;

  readonly selectedCountry = computed(() => {
    const code = this.countryCode();
    return code ? this.countries().find((c) => c.code === code) ?? null : null;
  });

  readonly currency = computed<DisplayCurrency>(() => {
    const explicit = this.currencyOverride();
    const explicitFound = explicit ? this.currencies().find((c) => c.code === explicit) : undefined;
    if (explicitFound) return this.toDisplay(explicitFound);
    const code = this.selectedCountry()?.currencyId?.code;
    if (code) {
      const found = this.currencies().find((c) => c.code === code);
      if (found) return this.toDisplay(found);
    }
    const base = this.currencies().find((c) => c.isDefault);
    if (base) return this.toDisplay(base);
    return BASE_CURRENCY;
  });

  readonly options = computed<RegionCountryOption[]>(() =>
    this.countries().map((c) => ({
      code: c.code,
      name: pickText(c.name) || c.code,
      flag: c.flag || '',
      dialCode: c.phoneCode || '+',
      currencyCode: c.currencyId?.code || '',
    })),
  );

  /** Currencies for the header dropdown, default first, then alphabetical by code. */
  readonly currencyOptions = computed<CurrencyOption[]>(() => {
    const countries = this.countries();
    const defaultCode = this.currencies().find((c) => c.isDefault)?.code;
    return this.currencies()
      .map((c) => ({
        code: c.code,
        symbol: c.symbol || c.code,
        name: pickText(c.name) || c.code,
        flag: countries.find((ct) => ct.currencyId?.code === c.code)?.flag || '',
      }))
      .sort((a, b) => {
        if (a.code === defaultCode) return -1;
        if (b.code === defaultCode) return 1;
        return a.code.localeCompare(b.code);
      });
  });

  format(amountBase: number): string {
    const c = this.currency();
    return formatPrice(amountBase, c.code, c.rate);
  }

  setCountry(code: string): void {
    const next = String(code || '').toUpperCase();
    this.countryCode.set(next);
    try {
      if (next) localStorage.setItem(STORAGE_KEY, next);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage may be unavailable (private mode) */
    }
  }

  /** Pick a display currency; the shopper's country follows it so checkout payloads stay valid. */
  setCurrency(code: string): void {
    const next = String(code || '').toUpperCase();
    if (!next) return;
    this.currencyOverride.set(next);
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, next);
    } catch {
      /* storage may be unavailable (private mode) */
    }
    const country = this.countries().find((c) => c.currencyId?.code === next);
    if (country) this.setCountry(country.code);
  }

  private toDisplay(c: ServerCurrency): DisplayCurrency {
    return { code: c.code, symbol: c.symbol || c.code, rate: Number(c.rate) || 1 };
  }

  ensureLoaded(): Promise<void> {
    if (this.loaded) return Promise.resolve();
    if (this.pending) return this.pending;
    this.pending = this.load();
    return this.pending;
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const [countriesRes, currenciesRes] = await Promise.all([
        firstValueFrom(this.catalog.getCountries()),
        firstValueFrom(this.catalog.getCurrencies()),
      ]);
      this.countries.set(countriesRes.data ?? []);
      this.currencies.set(currenciesRes.data ?? []);
      this.loaded = true;
    } catch {
      this.error.set($localize`:@@region.loadError:Could not load country and currency options.`);
    } finally {
      this.loading.set(false);
      this.pending = null;
    }
  }

  private readStoredCountry(): string {
    try {
      return localStorage.getItem(STORAGE_KEY) || '';
    } catch {
      return '';
    }
  }

  private readStoredCurrency(): string {
    try {
      return localStorage.getItem(CURRENCY_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  }
}
