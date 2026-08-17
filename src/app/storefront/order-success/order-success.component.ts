import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrdersStore } from '../../core/stores/orders.store';
import { CartStore } from '../../core/stores/cart.store';
import { formatPrice } from '../../core/utils/price';
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

  protected readonly formatPrice = formatPrice;

  private route = inject(ActivatedRoute);

  constructor() {
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');
    if (!sessionId) {
      this.missingSession.set(true);
    } else {
      void this.confirm(sessionId);
    }
  }

  private async confirm(sessionId: string): Promise<void> {
    this.confirming.set(true);
    try {
      await this.orders.confirm(sessionId);
      this.cart.clear();
    } catch (err) {
      const e = normalizeApiError(err);
      this.error.set(e.status === 402 ? 'Payment was not completed.' : e.message);
    } finally {
      this.confirming.set(false);
    }
  }
}
