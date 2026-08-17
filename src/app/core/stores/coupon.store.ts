import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Coupon } from '../models';
import { CouponsService } from '../services/coupons.service';
import { normalizeApiError } from '../services/api-error';

@Injectable({ providedIn: 'root' })
export class CouponStore {
  private api = inject(CouponsService);

  readonly code = signal('');
  readonly applied = signal<Coupon | null>(null);
  readonly validating = signal(false);
  readonly error = signal<string | null>(null);

  async validate(code: string): Promise<boolean> {
    this.validating.set(true);
    this.error.set(null);
    try {
      const coupon = await firstValueFrom(this.api.validate(code));
      this.applied.set(coupon);
      this.code.set(coupon.code);
      return true;
    } catch (err) {
      this.applied.set(null);
      this.error.set(normalizeApiError(err).message);
      return false;
    } finally {
      this.validating.set(false);
    }
  }

  discountFor(subtotal: number): number {
    const coupon = this.applied();
    if (!coupon) return 0;
    if (coupon.type === 'percent') {
      return Math.round(subtotal * (coupon.value / 100));
    }
    return Math.min(coupon.value, subtotal);
  }

  clear(): void {
    this.applied.set(null);
    this.code.set('');
    this.error.set(null);
  }
}
