import { Component, computed, inject, signal, OnInit, effect } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Address, ServerCountry, ServerCurrency, ServerPaymentMethod } from '../../core/models';
import { AuthStore } from '../../core/stores/auth.store';
import { CartStore } from '../../core/stores/cart.store';
import { CouponStore } from '../../core/stores/coupon.store';
import { AddressStore } from '../../core/stores/address.store';
import { OrdersStore } from '../../core/stores/orders.store';
import { StripeService } from '../../core/services/stripe.service';
import { CatalogService } from '../../core/services/catalog.service';
import { formatPrice, effectivePrice } from '../../core/utils/price';
import { pickText } from '../../core/utils/localize';
import { normalizeApiError } from '../../core/services/api-error';
import { ToastService } from '../../shared/toast/toast.service';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';

interface CountryOption {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
  currencyCode: string;
  methods: ServerPaymentMethod[];
}

interface PaymentOption {
  code: string;
  name: string;
  icon: string;
  color: string;
  stripe: boolean;
  cod: boolean;
  bankTransfer: boolean;
  enabled: boolean;
}

interface CheckoutDraft {
  street: string;
  apartment: string;
  city: string;
  zip: string;
  country: string;
  countryCode: string;
  phoneDialCode: string;
  phone: string;
  couponCode: string;
  paymentGateway: string;
  saveAsAddress: boolean;
  rememberInfo: boolean;
}

const FALLBACK_CURRENCY = { code: 'EGP', symbol: 'E£', rate: 1 };

const DRAFT_KEY = 'ecom.checkout.draft';

const FALLBACK_CARD: ServerPaymentMethod = {
  id: '',
  code: 'credit-card',
  name: { en: 'Credit / Debit Card (Stripe)', ar: '' },
  icon: 'bi-credit-card',
  color: '#6366F1',
};

// Methods the storefront is allowed to offer. Keep in step with the `available`
// flags in the backend's helpers/seed-countries.js: a method listed here that the
// backend cannot actually process will fail at the payment step.
const ENABLED_METHODS = new Set([
  'credit-card',
  'cod',
  'bank-transfer',
  'vodafone-cash',
  'paypal',
  // Paymob card checkout. The backend only marks this active once a real card
  // integration is configured, so the server list gates it either way.
  'paymob',
]);

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

  protected readonly countries = signal<CountryOption[]>([]);
  protected readonly countriesLoading = signal(true);

  protected readonly countryCode = signal('');
  protected readonly country = signal('');
  protected readonly paymentGateway = signal('credit-card');

  protected street = signal('');
  protected apartment = signal('');
  protected city = signal('');
  protected zip = signal('');
  protected phoneDialCode = signal('+20');
  protected phone = signal('');
  protected latitude = signal<number | null>(null);
  protected longitude = signal<number | null>(null);
  protected saveAsAddress = signal(false);
  protected rememberInfo = signal(true);
  protected addressLabel = signal($localize`Home`);
  protected couponCode = signal('');
  protected paying = signal(false);
  protected error = signal<string | null>(null);

  private stripe = inject(StripeService);
  private toasts = inject(ToastService);
  private catalog = inject(CatalogService);
  private router = inject(Router);

  protected readonly formatPrice = formatPrice;
  protected readonly effectivePrice = effectivePrice;
  protected readonly pickText = pickText;

  protected readonly subtotal = computed(() => this.cart.subtotal());
  protected readonly discount = computed(() => this.coupon.discountFor(this.cart.subtotal(), this.cart.items()));
  protected readonly minSubtotalNotMet = computed(
    () => !!this.coupon.applied() && !this.coupon.minSubtotalMet(this.cart.subtotal(), this.cart.items()),
  );
  protected readonly shippingFee = computed(() => this.cart.shippingFee());
  protected readonly total = computed(() =>
    this.cart.subtotal() - this.discount() + this.shippingFee(),
  );

  protected readonly selectedCountry = computed(() =>
    this.countries().find((c) => c.code === this.countryCode()),
  );

  protected readonly currencies = signal<ServerCurrency[]>([]);

  protected readonly currencyById = computed<Record<string, ServerCurrency>>(() => {
    const map: Record<string, ServerCurrency> = {};
    for (const c of this.currencies()) if (c.rate) map[c.code] = c;
    return map;
  });

  protected readonly currencyInfo = computed(() => {
    const cc = this.selectedCountry()?.currencyCode;
    const found = cc ? this.currencyById()[cc] : null;
    return found ? { code: found.code, symbol: found.symbol, rate: Number(found.rate) || 1 } : FALLBACK_CURRENCY;
  });

  protected readonly paymentOptions = computed<PaymentOption[]>(() => {
    const methods = this.selectedCountry()?.methods ?? [];
    const hasCard = methods.some((m) => m.code === 'credit-card');
    const list = methods.length > 0 ? methods : [FALLBACK_CARD];
    const items = list.map((m) => this.toPaymentOption(m));
    if (!hasCard) items.push(this.toPaymentOption(FALLBACK_CARD));
    return items;
  });

  private toPaymentOption(m: ServerPaymentMethod): PaymentOption {
    const code = m.code.toLowerCase();
    const enabled = ENABLED_METHODS.has(code);
    return {
      code,
      name: pickText(m.name) || m.code,
      icon: m.icon || 'bi-credit-card',
      color: m.color || '#6366F1',
      stripe: code === 'credit-card',
      cod: code === 'cod',
      bankTransfer: code === 'bank-transfer',
      enabled,
    };
  }

  protected readonly selectedPayMethod = computed<PaymentOption | null>(() => {
    const code = this.paymentGateway();
    return this.paymentOptions().find((o) => o.code === code) ?? null;
  });

  protected fmt = (amountBase: number): string => {
    const c = this.currencyInfo();
    return formatPrice(amountBase, c.code, c.rate);
  };

  ngOnInit(): void {
    this.addresses.setUser(this.auth.userId());
    if (this.addresses.list().length === 0 && this.auth.isLoggedIn()) {
      void this.addresses.load();
    }
    this.prefillFromUser();
    this.restoreDraft();
    void this.restoreCoupon();
    void this.cart.loadConfig();
    this.requestGeolocation();
    void this.loadCatalog();
  }

  private async restoreCoupon(): Promise<void> {
    const code = this.couponCode().trim();
    if (code && !this.coupon.applied()) {
      const ok = await this.coupon.validate(code, this.cart.subtotal());
      if (!ok) {
        this.couponCode.set('');
        this.coupon.clear();
      }
    }
  }

  private restoreDraft(): void {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    try {
      const d = JSON.parse(raw) as Partial<CheckoutDraft>;
      this.rememberInfo.set(d.rememberInfo !== false);
      if (!this.rememberInfo()) {
        localStorage.removeItem(DRAFT_KEY);
        return;
      }
      if (d.street != null) this.street.set(d.street);
      if (d.apartment != null) this.apartment.set(d.apartment);
      if (d.city != null) this.city.set(d.city);
      if (d.zip != null) this.zip.set(d.zip);
      if (d.country != null) this.country.set(d.country);
      if (d.countryCode != null) this.countryCode.set(d.countryCode);
      if (d.phoneDialCode != null) this.phoneDialCode.set(d.phoneDialCode);
      if (d.phone != null) this.phone.set(d.phone);
      if (d.couponCode != null) this.couponCode.set(d.couponCode);
      if (d.paymentGateway != null) this.paymentGateway.set(d.paymentGateway);
      if (d.saveAsAddress != null) this.saveAsAddress.set(d.saveAsAddress);
    } catch {
      localStorage.removeItem(DRAFT_KEY);
    }
  }

  private draftSync = effect(() => {
    const draft: CheckoutDraft = {
      street: this.street(),
      apartment: this.apartment(),
      city: this.city(),
      zip: this.zip(),
      country: this.country(),
      countryCode: this.countryCode(),
      phoneDialCode: this.phoneDialCode(),
      phone: this.phone(),
      couponCode: this.couponCode(),
      paymentGateway: this.paymentGateway(),
      saveAsAddress: this.saveAsAddress(),
      rememberInfo: this.rememberInfo(),
    };
    if (draft.rememberInfo) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } else {
      localStorage.removeItem(DRAFT_KEY);
    }
  });

  private async loadCatalog(): Promise<void> {
    try {
      const [countriesRes, currenciesRes] = await Promise.all([
        firstValueFrom(this.catalog.getCountries()),
        firstValueFrom(this.catalog.getCurrencies()),
      ]);
      this.currencies.set(currenciesRes.data ?? []);
      const options: CountryOption[] = (countriesRes.data ?? []).map((c) => ({
        code: c.code,
        name: pickText(c.name) || c.code,
        flag: c.flag || '',
        dialCode: c.phoneCode || '+',
        currencyCode: c.currencyId?.code || 'EGP',
        methods: (c.paymentMethods ?? []).filter((m) => m && m.code),
      }));
      this.countries.set(options);
      if (!this.countryCode() && options.length > 0) {
        this.applyPrefilledCountry(options);
      }
      this.autoSelectGateway();
    } catch {
      this.toasts.show($localize`Could not load countries, please try again`, 'error');
    } finally {
      this.countriesLoading.set(false);
    }
  }

  private applyPrefilledCountry(options: CountryOption[]): void {
    const name = this.country().trim().toLowerCase();
    const match = options.find((o) => o.name.toLowerCase() === name);
    if (match) {
      this.countryCode.set(match.code);
      this.phoneDialCode.set(match.dialCode);
    }
  }

  private locationSync = effect(() => {
    this.cart.setShippingLocation(this.city(), this.country());
    this.cart.setShippingCoordinates(this.latitude(), this.longitude());
  });

  private requestGeolocation(): void {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.latitude.set(pos.coords.latitude);
        this.longitude.set(pos.coords.longitude);
      },
      () => undefined,
      { timeout: 10000, maximumAge: 600000 },
    );
  }

  private autoSelectGateway(): void {
    const options = this.paymentOptions();
    const current = this.paymentGateway();
    if (options.some((o) => o.code === current && o.enabled)) return;
    const preferred = options.find((o) => o.stripe) ?? options.find((o) => o.cod) ?? options.find((o) => o.enabled);
    if (preferred) this.paymentGateway.set(preferred.code);
  }

  onCountryChange(code: string): void {
    const found = this.countries().find((c) => c.code === code);
    if (found) {
      this.countryCode.set(found.code);
      this.country.set(found.name);
      this.phoneDialCode.set(found.dialCode);
      this.autoSelectGateway();
    }
  }

  selectGateway(code: string): void {
    const option = this.paymentOptions().find((o) => o.code === code);
    if (option?.enabled) this.paymentGateway.set(code);
  }

  private prefillFromUser(): void {
    const user = this.auth.user();
    if (!user) return;
    this.street.set(user.street || '');
    this.apartment.set(user.apartment || '');
    this.city.set(user.city || '');
    this.zip.set(user.zip || '');
    this.country.set(user.country || '');
    this.phoneDialCode.set(user.phoneDialCode || '+20');
    this.phone.set(user.phone || '');
  }

  applyAddress(address: Address): void {
    this.street.set(address.street);
    this.apartment.set(address.apartment);
    this.city.set(address.city);
    this.zip.set(address.zip);
    this.country.set(address.country);
    this.phone.set(address.phone);
    const match = this.countries().find((c) => c.name.toLowerCase() === address.country.toLowerCase());
    if (match) this.countryCode.set(match.code);
    this.autoSelectGateway();
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

  canPay(): boolean {
    return (
      this.cart.count() > 0 &&
      !!this.street().trim() &&
      !!this.city().trim() &&
      !!this.country().trim() &&
      !!this.phone().trim()
    );
  }

  private fullPhone(): string {
    const dial = this.phoneDialCode();
    const number = this.phone().trim();
    if (!number) return '';
    return number.startsWith('+') ? number : `${dial}${number}`;
  }

  protected payButtonLabel(): string {
    if (this.paying()) return $localize`Processing...`;
    const method = this.selectedPayMethod();
    if (!method) return $localize`Place order`;
    if (method.cod) return $localize`Place order (Cash on Delivery)`;
    if (method.stripe) return $localize`Pay with Stripe`;
    return $localize`Pay with ${method.name}`;
  }

  async pay(): Promise<void> {
    if (!this.canPay() || this.paying()) return;
    const method = this.selectedPayMethod();
    if (!method?.enabled) return;
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
        phone: this.fullPhone(),
        latitude: this.latitude() ?? undefined,
        longitude: this.longitude() ?? undefined,
      };
      const res = await this.orders.checkout({
        orderItems,
        shippingAddress,
        couponCode: this.coupon.applied()?.code,
        customerEmail: this.auth.user()?.email,
        paymentMethod: method.stripe ? 'card' : method.code,
      });

      if (this.saveAsAddress()) {
        await this.addresses.create({
          label: this.addressLabel().trim() || $localize`Home`,
          street: shippingAddress.street,
          apartment: shippingAddress.apartment,
          city: shippingAddress.city,
          zip: shippingAddress.zip,
          country: shippingAddress.country,
          phone: shippingAddress.phone,
          isDefault: this.addresses.list().length === 0,
        });
      }

      if (res.sessionId) {
        await this.stripe.redirectToCheckout(res.sessionId as string);
        return;
      }
      if (res.paymentUrl) {
        const gateway = this.selectedPayMethod();
        if (gateway?.code === 'paypal') {
          window.location.assign(res.paymentUrl);
          return;
        }
        window.open(res.paymentUrl, '_blank', 'noopener');
      }
      await this.router.navigate(['/order/success'], { queryParams: { order_id: res.orderId } });
    } catch (err) {
      this.error.set(normalizeApiError(err).message);
      this.toasts.show(this.error() ?? $localize`Checkout failed`, 'error');
    } finally {
      this.paying.set(false);
    }
  }
}