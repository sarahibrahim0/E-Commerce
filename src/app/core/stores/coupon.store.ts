import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CartItem, Coupon } from '../models';
import { CouponsService } from '../services/coupons.service';
import { normalizeApiError } from '../services/api-error';
import { clearStorageKey, readStorage, writeStorage } from '../utils/storage';
import { effectivePrice } from '../utils/price';

const COUPON_KEY = 'ecom.coupon';

@Injectable({ providedIn: 'root' })
export class CouponStore {
  private api = inject(CouponsService);

  readonly code = signal('');
  readonly applied = signal<Coupon | null>(readStorage<Coupon | null>(COUPON_KEY, null));
  readonly validating = signal(false);
  readonly error = signal<string | null>(null);

  private idSet(coupon: Coupon | null, key: 'productIds' | 'categoryIds'): Set<string> {
    if (!coupon) return new Set();
    const list = (coupon[key] ?? []) as (string | { id?: string })[];
    return new Set(
      list
        .map((v) => (typeof v === 'object' && v ? String(v.id ?? '') : String(v)))
        .filter(Boolean),
    );
  }

  eligibleSubtotal(subtotal: number, items: CartItem[] = []): number {
    const coupon = this.applied();
    if (!coupon) return 0;
    const productIds = this.idSet(coupon, 'productIds');
    const categoryIds = this.idSet(coupon, 'categoryIds');
    if (productIds.size === 0 && categoryIds.size === 0) return subtotal;

    let amount = 0;
    for (const item of items) {
      const productId = item.product.id;
      const categoryId =
        typeof item.product.category === 'string'
          ? item.product.category
          : item.product.category?.id ?? '';
      if (productIds.has(productId) || (categoryId && categoryIds.has(categoryId))) {
        amount += effectivePrice(item.product) * item.quantity;
      }
    }
    return amount;
  }

  minSubtotalMet(subtotal: number, items: CartItem[] = []): boolean {
    const coupon = this.applied();
    if (!coupon || !(coupon.minSubtotal > 0)) return true;
    return this.eligibleSubtotal(subtotal, items) >= coupon.minSubtotal;
  }

  async validate(code: string, subtotal?: number): Promise<boolean> {
    this.validating.set(true);
    this.error.set(null);
    try {
      const coupon = await firstValueFrom(this.api.validate(code, subtotal));
      this.applied.set(coupon);
      this.code.set(coupon.code);
      writeStorage(COUPON_KEY, coupon);
      return true;
    } catch (err) {
      this.applied.set(null);
      this.code.set('');
      this.error.set(normalizeApiError(err).message);
      clearStorageKey(COUPON_KEY);
      return false;
    } finally {
      this.validating.set(false);
    }
  }

  discountFor(subtotal: number, items: CartItem[] = []): number {
    const coupon = this.applied();
    if (!coupon) return 0;
    const eligible = this.eligibleSubtotal(subtotal, items);
    if (coupon.minSubtotal > 0 && eligible < coupon.minSubtotal) return 0;
    if (coupon.type === 'percent') {
      return Math.round(eligible * (coupon.value / 100));
    }
    return Math.min(coupon.value, eligible);
  }

  clear(): void {
    this.applied.set(null);
    this.code.set('');
    this.error.set(null);
    clearStorageKey(COUPON_KEY);
  }
}