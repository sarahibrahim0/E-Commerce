import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { OrdersStore } from '../../core/stores/orders.store';
import { CartStore } from '../../core/stores/cart.store';
import { CatalogService } from '../../core/services/catalog.service';
import { ServerCurrency } from '../../core/models';
import { formatPrice, effectivePrice } from '../../core/utils/price';
import { pickText } from '../../core/utils/localize';
import { normalizeApiError } from '../../core/services/api-error';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './order-success.component.html',
  styleUrl: './order-success.component.scss',
})
export class OrderSuccessComponent {
  protected readonly orders = inject(OrdersStore);
  protected readonly cart = inject(CartStore);

  readonly confirming = signal(false);
  readonly confirmed = computed(() => this.orders.current());
  readonly error = signal<string | null>(null);
  readonly missingSession = signal(false);
  readonly cod = signal(false);

  private readonly currencies = signal<ServerCurrency[]>([]);

  protected readonly priceCode = computed(() => this.orders.current()?.currency || 'EGP');

  protected readonly confirmingLabel = computed(() =>
    this.cod() ? $localize`Loading your order...` : $localize`Verifying your payment...`,
  );

  protected readonly placedTitle = computed(() =>
    this.cod() ? $localize`Your order has been placed!` : $localize`Thank you for your order!`,
  );

  protected readonly pickText = pickText;

  protected readonly currencyRate = computed(() => {
    const code = this.priceCode();
    if (code === 'EGP') return 1;
    const found = this.currencies().find((c) => c.code === code);
    return found && Number(found.rate) > 0 ? Number(found.rate) : 1;
  });

  protected fmt = (amount: number): string =>
    formatPrice(amount, this.priceCode(), this.currencyRate());

  protected readonly effectivePrice = effectivePrice;

  private route = inject(ActivatedRoute);
  private catalog = inject(CatalogService);

  constructor() {
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');
    const orderId = this.route.snapshot.queryParamMap.get('order_id');
    const gateway = this.route.snapshot.queryParamMap.get('payment');

    if (!sessionId && !orderId) {
      this.missingSession.set(true);
    } else if (orderId && gateway === 'paypal') {
      void this.confirmPaypal(orderId as string);
    } else if (orderId) {
      void this.confirmLocal(orderId);
    } else {
      void this.confirm(sessionId as string);
    }
  }

  private async loadCurrencies(): Promise<void> {
    try {
      const res = await firstValueFrom(this.catalog.getCurrencies());
      this.currencies.set(res.data ?? []);
    } catch {
      /* currency formatting falls back to EGP */
    }
  }

  private async confirmLocal(orderId: string): Promise<void> {
    this.confirming.set(true);
    try {
      await this.orders.loadOrder(orderId);
      this.cart.clear();
      this.cod.set(this.orders.current()?.paymentMethod === 'cod');
    } catch (err) {
      this.error.set(normalizeApiError(err).message);
    } finally {
      this.confirming.set(false);
    }
  }

  private async confirmPaypal(orderId: string): Promise<void> {
    this.confirming.set(true);
    try {
      await this.orders.confirmPaypal(orderId);
      this.cart.clear();
    } catch (err) {
      this.error.set(normalizeApiError(err).message);
    } finally {
      this.confirming.set(false);
    }
  }

  private async confirm(sessionId: string): Promise<void> {
    this.confirming.set(true);
    this.cod.set(false);
    try {
      await this.orders.confirm(sessionId);
      this.cart.clear();
    } catch (err) {
      this.error.set(normalizeApiError(err).message);
    } finally {
      this.confirming.set(false);
    }
  }
}
