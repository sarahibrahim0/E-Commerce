import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrdersStore } from '../../core/stores/orders.store';
import { AuthStore } from '../../core/stores/auth.store';
import { CartStore } from '../../core/stores/cart.store';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { ToastService } from '../../shared/toast/toast.service';
import { normalizeApiError } from '../../core/services/api-error';
import { Order } from '../../core/models';
import { formatPrice } from '../../core/utils/price';

const CANCELLED = ['Cancelled', 'Delivered'];

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './orders-list.component.html',
  styleUrl: './orders-list.component.scss',
})
export class OrdersListComponent implements OnInit {
  protected readonly orders = inject(OrdersStore);
  protected readonly auth = inject(AuthStore);

  protected readonly formatPrice = formatPrice;
  protected readonly statusClass = (status: string): string => {
    if (status === 'Delivered') return 'bg-emerald-50 text-emerald-700';
    if (status === 'Cancelled' || status === 'Refunded') return 'bg-[#fff5f5] text-[#ff4545]';
    if (status === 'Pending') return 'bg-amber-50 text-amber-700';
    return 'bg-[#ecd7cd] text-[#646D77]';
  };

  private cart = inject(CartStore);
  private confirm = inject(ConfirmDialogService);
  private toasts = inject(ToastService);

  ngOnInit(): void {
    const userId = this.auth.userId();
    if (userId) void this.orders.loadOrders(userId);
  }

  canCancel(order: Order): boolean {
    return !CANCELLED.includes(order.status);
  }

  async cancel(order: Order): Promise<void> {
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

  reorder(order: Order): void {
    for (const item of order.orderItems) {
      this.cart.add(item.product, 1);
    }
    this.toasts.show($localize`Items added to cart`, 'success');
  }
}
