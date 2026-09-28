import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrdersStore } from '../../core/stores/orders.store';
import { AuthStore } from '../../core/stores/auth.store';
import { CartStore } from '../../core/stores/cart.store';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { ToastService } from '../../shared/toast/toast.service';
import { normalizeApiError } from '../../core/services/api-error';
import { Order } from '../../core/models';
import { formatPrice, effectivePrice } from '../../core/utils/price';
import { pickText } from '../../core/utils/localize';

const STATUS_STEPS = ['Pending', 'Processed', 'Shipped', 'Delivered'];

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.scss',
})
export class OrderDetailsComponent implements OnInit {
  protected readonly orders = inject(OrdersStore);
  protected readonly auth = inject(AuthStore);

  protected readonly formatPrice = formatPrice;
  protected readonly effectivePrice = effectivePrice;
  protected readonly pickText = pickText;
  protected readonly steps = STATUS_STEPS;
  protected readonly orderId = () => this.route.snapshot.paramMap.get('orderId') ?? '';

  private route = inject(ActivatedRoute);
  private cart = inject(CartStore);
  private confirm = inject(ConfirmDialogService);
  private toasts = inject(ToastService);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('orderId');
    if (id) void this.orders.loadOrder(id);
  }

  stepIndex(status: string): number {
    const idx = STATUS_STEPS.indexOf(status);
    return idx === -1 ? 0 : idx;
  }

  protected readonly shortId = (id: string): string => id.slice(0, 8).toUpperCase();

  protected readonly isCancelled = (order: Order): boolean =>
    order.status === 'Cancelled' || order.status === 'Refunded';

  protected readonly statusPill = (status: string): string => {
    if (status === 'Delivered') return 'bg-emerald-50 text-emerald-700';
    if (status === 'Cancelled' || status === 'Refunded') return 'bg-[#fff5f5] text-[#ff4545]';
    if (status === 'Pending') return 'bg-amber-50 text-amber-700';
    return 'bg-[#ecd7cd] text-[#646D77]';
  };

  protected readonly statusIcon = (status: string): string => {
    if (status === 'Delivered') return 'bi-check-circle-fill';
    if (status === 'Cancelled' || status === 'Refunded') return 'bi-x-circle-fill';
    if (status === 'Shipped') return 'bi-truck';
    if (status === 'Processed') return 'bi-gear';
    return 'bi-clock';
  };

  protected readonly paymentIcon = (payment: string): string => {
    if (payment === 'paid') return 'bi-credit-card-2-front-fill';
    if (payment === 'refunded') return 'bi-arrow-counterclockwise';
    if (payment === 'failed') return 'bi-exclamation-circle-fill';
    return 'bi-hourglass';
  };

  protected readonly paymentPill = (payment: string): string => {
    switch (payment) {
      case 'paid':
        return 'bg-emerald-50 text-emerald-700';
      case 'refunded':
      case 'failed':
        return 'bg-[#fff5f5] text-[#ff4545]';
      default:
        return 'bg-[#ecd7cd] text-[#646D77]';
    }
  };

  async cancel(): Promise<void> {
    const order = this.orders.current();
    if (!order) return;
    const ok = await this.confirm.confirm({
      title: $localize`Cancel order`,
      message: $localize`Cancel order #${order.id}? Payment will be refunded if already paid.`,
      confirmLabel: $localize`Cancel order`,
    });
    if (!ok) return;
    try {
      await this.orders.cancel(order.id);
      this.toasts.show($localize`Order cancelled`, 'success');
    } catch (err) {
      this.toasts.show(normalizeApiError(err).message, 'error');
    }
  }

  buyAgain(order: Order): void {
    for (const item of order.orderItems) {
      this.cart.add(item.product, 1);
    }
    this.toasts.show($localize`Items added to cart`, 'success');
  }
}
