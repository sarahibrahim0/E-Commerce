import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartStore } from '../../core/stores/cart.store';
import { CouponStore } from '../../core/stores/coupon.store';
import { WishlistStore } from '../../core/stores/wishlist.store';
import { Product } from '../../core/models';
import { formatPrice, effectivePrice } from '../../core/utils/price';
import { pickText } from '../../core/utils/localize';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, EmptyStateComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit {
  protected readonly cart = inject(CartStore);
  protected readonly wishlist = inject(WishlistStore);
  protected readonly coupon = inject(CouponStore);
  private toasts = inject(ToastService);
  private confirm = inject(ConfirmDialogService);

  protected readonly formatPrice = formatPrice;
  protected readonly effectivePrice = effectivePrice;
  protected readonly pickText = pickText;
  protected readonly couponCode = signal('');
  protected readonly subtotal = computed(() => formatPrice(this.cart.subtotal()));
  protected readonly discount = computed(() =>
    this.coupon.discountFor(this.cart.subtotal(), this.cart.items()),
  );
  protected readonly minSubtotalNotMet = computed(
    () => !!this.coupon.applied() && !this.coupon.minSubtotalMet(this.cart.subtotal(), this.cart.items()),
  );
  protected readonly total = computed(() =>
    formatPrice(this.cart.subtotal() - this.discount() + this.cart.shippingFee()),
  );
  protected readonly shippingFee = computed(() =>
    formatPrice(this.cart.shippingFee()),
  );

  protected readonly freeShippingThreshold = computed(() =>
    Number(this.cart.config()?.freeShippingThreshold) || 0,
  );

  protected readonly freeShipping = computed(() => {
    if (!this.cart.config()) return false;
    const threshold = this.freeShippingThreshold();
    return threshold <= 0 || this.cart.subtotal() >= threshold;
  });

  protected readonly shippingLabel = computed(() => {
    if (!this.cart.config()) return $localize`Calculating...`;
    const threshold = this.freeShippingThreshold();
    if (threshold <= 0 || this.cart.subtotal() >= threshold) return $localize`Free`;
    return $localize`Add ${formatPrice(threshold - this.cart.subtotal())} more for free shipping`;
  });

  ngOnInit(): void {
    void this.cart.loadConfig();
  }

  async applyCoupon(): Promise<void> {
    const code = this.couponCode().trim();
    if (!code) return;
    const ok = await this.coupon.validate(code, this.cart.subtotal());
    if (ok) {
      this.toasts.show($localize`Coupon applied`, 'success');
    } else {
      this.toasts.show(this.coupon.error() ?? $localize`Invalid coupon`, 'error');
    }
  }

  removeCoupon(): void {
    this.coupon.clear();
    this.couponCode.set('');
  }

  async removeItem(product: Product): Promise<void> {
    const result = await this.confirm.confirm({
      title: $localize`Remove from cart`,
      message: $localize`Remove "${pickText(product.name)}" from your cart?`,
      confirmLabel: $localize`Remove`,
      extraLabel: $localize`Move to Wishlist`,
    });
    if (result === false) return;

    this.cart.remove(product.id);

    if (result === 'extra') {
      if (this.wishlist.loggedIn()) {
        const added = await this.wishlist.add(product);
        this.toasts.show(
          added ? $localize`Added to your wishlist` : $localize`Could not add to wishlist`,
          added ? 'success' : 'error',
        );
      } else {
        this.toasts.show($localize`Log in to save items to your wishlist`, 'info');
      }
    } else {
      this.toasts.show($localize`Item removed from cart`, 'success');
    }
  }
}
