import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrdersStore } from '../../core/stores/orders.store';
import { AuthStore } from '../../core/stores/auth.store';
import { CartStore } from '../../core/stores/cart.store';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { ToastService } from '../../shared/toast/toast.service';
import { Order } from '../../core/models';
import { formatPrice } from '../../core/utils/price';

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

  async cancel(): Promise<void> {
    const order = this.orders.current();
    if (!order) return;
    const ok = await this.confirm.confirm({
      title: 'Cancel order',
      message: `Cancel order #${order.id}? Payment will be refunded if already paid.`,
      confirmLabel: 'Cancel order',
    });
    if (!ok) return;
    await this.orders.cancel(order.id);
    this.toasts.show('Order cancelled', 'success');
  }

  buyAgain(order: Order): void {
    for (const item of order.orderItems) {
      this.cart.add(item.product, item.quantity);
    }
    this.toasts.show('Items added to cart', 'success');
  }
}
