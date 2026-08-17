import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Address } from '../../core/models';
import { AuthStore } from '../../core/stores/auth.store';
import { CartStore } from '../../core/stores/cart.store';
import { CouponStore } from '../../core/stores/coupon.store';
import { AddressStore } from '../../core/stores/address.store';
import { OrdersStore } from '../../core/stores/orders.store';
import { StripeService } from '../../core/services/stripe.service';
import { formatPrice } from '../../core/utils/price';
import { normalizeApiError } from '../../core/services/api-error';
import { ToastService } from '../../shared/toast/toast.service';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink, FormsModule, EmptyStateComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit {
  protected readonly auth = inject(AuthStore);
  protected readonly cart = inject(CartStore);
  protected readonly coupon = inject(CouponStore);
  protected readonly addresses = inject(AddressStore);
  protected readonly orders = inject(OrdersStore);

  protected street = signal('');
  protected apartment = signal('');
  protected city = signal('');
  protected zip = signal('');
  protected country = signal('');
  protected phone = signal('');
  protected saveAsAddress = signal(false);
  protected addressLabel = signal('Home');
  protected couponCode = signal('');
  protected paying = signal(false);
  protected error = signal<string | null>(null);

  private stripe = inject(StripeService);
  private toasts = inject(ToastService);

  protected readonly formatPrice = formatPrice;

  protected readonly subtotal = computed(() => this.cart.subtotal());
  protected readonly discount = computed(() => this.coupon.discountFor(this.cart.subtotal()));
  protected readonly total = computed(() => this.cart.subtotal() - this.discount());

  ngOnInit(): void {
    this.addresses.setUser(this.auth.userId());
    if (this.addresses.list().length === 0 && this.auth.isLoggedIn()) {
      void this.addresses.load();
    }
    this.prefillFromUser();
  }

  private prefillFromUser(): void {
    const user = this.auth.user();
    if (!user) return;
    this.street.set(user.street || '');
    this.apartment.set(user.apartment || '');
    this.city.set(user.city || '');
    this.zip.set(user.zip || '');
    this.country.set(user.country || '');
    this.phone.set(user.phone || '');
  }

  applyAddress(address: Address): void {
    this.street.set(address.street);
    this.apartment.set(address.apartment);
    this.city.set(address.city);
    this.zip.set(address.zip);
    this.country.set(address.country);
    this.phone.set(address.phone);
  }

  async applyCoupon(): Promise<void> {
    const code = this.couponCode().trim();
    if (!code) return;
    const ok = await this.coupon.validate(code);
    if (ok) {
      this.toasts.show('Coupon applied', 'success');
    } else {
      this.toasts.show(this.coupon.error() ?? 'Invalid coupon', 'error');
    }
  }

  removeCoupon(): void {
    this.coupon.clear();
    this.couponCode.set('');
  }

  canPay(): boolean {
    return (
      this.cart.count() > 0 &&
      !!this.street().trim() &&
      !!this.city().trim() &&
      !!this.country().trim() &&
      !!this.phone().trim()
    );
  }

  async pay(): Promise<void> {
    if (!this.canPay() || this.paying()) return;
    this.paying.set(true);
    this.error.set(null);
    try {
      const orderItems = this.cart.items().map((i) => ({ product: i.product.id, quantity: i.quantity }));
      const shippingAddress = {
        street: this.street().trim(),
        apartment: this.apartment().trim(),
        city: this.city().trim(),
        zip: this.zip().trim(),
        country: this.country().trim(),
        phone: this.phone().trim(),
      };
      const res = await this.orders.checkout({
        orderItems,
        shippingAddress,
        couponCode: this.coupon.applied()?.code,
        customerEmail: this.auth.user()?.email,
      });

      if (this.saveAsAddress()) {
        await this.addresses.create({
          label: this.addressLabel().trim() || 'Home',
          street: shippingAddress.street,
          apartment: shippingAddress.apartment,
          city: shippingAddress.city,
          zip: shippingAddress.zip,
          country: shippingAddress.country,
          phone: shippingAddress.phone,
          isDefault: this.addresses.list().length === 0,
        });
      }

      await this.stripe.redirectToCheckout(res.sessionId);
    } catch (err) {
      this.error.set(normalizeApiError(err).message);
      this.toasts.show(this.error() ?? 'Checkout failed', 'error');
    } finally {
      this.paying.set(false);
    }
  }
}
