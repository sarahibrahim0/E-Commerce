import { Injectable, computed, inject, signal } from '@angular/core';
import { CartItem, Product, ShippingConfig } from '../models';
import { ShippingService } from '../services/shipping.service';
import { readStorage, writeStorage } from '../utils/storage';
import { effectivePrice } from '../utils/price';

export interface ShippingLocation {
  city: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
}

@Injectable({ providedIn: 'root' })
export class CartStore {
  readonly items = signal<CartItem[]>(readStorage<CartItem[]>('ecom.cart', []));
  readonly count = computed(() => this.items().reduce((sum, i) => sum + i.quantity, 0));
  readonly subtotal = computed(() =>
    this.items().reduce((sum, i) => sum + effectivePrice(i.product) * i.quantity, 0),
  );

  readonly config = signal<ShippingConfig | null>(null);
  readonly configError = signal<string | null>(null);
  readonly location = signal<ShippingLocation>({ city: '', country: '' });

  private shipping = inject(ShippingService);

  readonly shippingFee = computed(() => {
    const subtotal = this.subtotal();
    const config = this.config();
    if (!config) return 0;
    return computeShippingFee(config, subtotal, this.location());
  });

  readonly total = computed(() => this.subtotal() + this.shippingFee());

  loadConfig(): Promise<void> {
    if (this.config()) return Promise.resolve();
    return new Promise((resolve) => {
      this.shipping.getConfig().subscribe({
        next: (c) => {
          this.config.set(c);
          this.configError.set(null);
          resolve();
        },
        error: (err) => {
          this.configError.set(err?.message ?? 'Failed to load shipping settings');
          resolve();
        },
      });
    });
  }

  setShippingLocation(city: string, country: string): void {
    this.location.update((loc) => ({ ...loc, city: city.trim(), country: country.trim() }));
  }

  setShippingCoordinates(latitude: number | null, longitude: number | null): void {
    this.location.update((loc) => ({
      ...loc,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
    }));
  }

  add(product: Product, quantity = 1): void {
    const existing = this.items().find((i) => i.product.id === product.id);
    let next: CartItem[];
    if (existing) {
      next = this.items().map((i) =>
        i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i,
      );
    } else {
      next = [...this.items(), { product, quantity }];
    }
    this.items.set(next);
    writeStorage('ecom.cart', next);
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.remove(productId);
      return;
    }
    const next = this.items().map((i) =>
      i.product.id === productId ? { ...i, quantity } : i,
    );
    this.items.set(next);
    writeStorage('ecom.cart', next);
  }

  remove(productId: string): void {
    const next = this.items().filter((i) => i.product.id !== productId);
    this.items.set(next);
    writeStorage('ecom.cart', next);
  }

  clear(): void {
    this.items.set([]);
    writeStorage('ecom.cart', []);
  }
}

function computeShippingFee(config: ShippingConfig, subtotal: number, location: ShippingLocation): number {
  const threshold = Number(config.freeShippingThreshold) || 0;
  if (threshold > 0 && subtotal >= threshold) return 0;

  const distanceRate = distanceRateFor(config, location);
  if (distanceRate != null) return Math.max(0, distanceRate);

  const city = location.city.trim().toLowerCase();
  const country = location.country.trim().toLowerCase();
  const rates = config.rates ?? [];

  const exact = rates.find(
    (r) =>
      r.city.trim().toLowerCase() === city && r.country.trim().toLowerCase() === country,
  );
  if (exact) return Math.max(0, Number(exact.rate));

  const countryMatch = rates.find(
    (r) => !r.city && r.country.trim().toLowerCase() === country,
  );
  if (countryMatch) return Math.max(0, Number(countryMatch.rate));

  return Math.max(0, Number(config.baseRate) || 0);
}

function distanceRateFor(config: ShippingConfig, location: ShippingLocation): number | null {
  const distanceRate = Number(config.distanceRate) || 0;
  if (distanceRate <= 0) return null;

  const originLat = toFinite(config.originLatitude);
  const originLng = toFinite(config.originLongitude);
  const lat = toFinite(location.latitude);
  const lng = toFinite(location.longitude);
  if (originLat === null || originLng === null || lat === null || lng === null) return null;

  const km = haversineKm(originLat, originLng, lat, lng);
  return km * distanceRate;
}

function toFinite(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number): number => (deg * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(a));
}
