import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CheckoutRequest, CheckoutResponse, Order } from '../models';
import { OrdersService } from '../services/orders.service';
import { normalizeApiError } from '../services/api-error';

@Injectable({ providedIn: 'root' })
export class OrdersStore {
  private api = inject(OrdersService);

  readonly orders = signal<Order[]>([]);
  readonly current = signal<Order | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async loadOrders(userId: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.orders.set(await firstValueFrom(this.api.listByUser(userId)));
    } catch (err) {
      this.error.set(normalizeApiError(err).message);
    } finally {
      this.loading.set(false);
    }
  }

  async loadOrder(orderId: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.current.set(await firstValueFrom(this.api.get(orderId)));
    } catch (err) {
      this.error.set(normalizeApiError(err).message);
    } finally {
      this.loading.set(false);
    }
  }

  async checkout(req: CheckoutRequest): Promise<CheckoutResponse> {
    this.loading.set(true);
    this.error.set(null);
    try {
      return await firstValueFrom(this.api.checkout(req));
    } catch (err) {
      this.error.set(normalizeApiError(err).message);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async confirm(sessionId: string): Promise<Order> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const order = await firstValueFrom(this.api.confirm(sessionId));
      this.current.set(order);
      return order;
    } catch (err) {
      this.error.set(normalizeApiError(err).message);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async cancel(orderId: string): Promise<void> {
    const updated = await firstValueFrom(this.api.cancel(orderId));
    this.orders.update((list) => list.map((o) => (o.id === orderId ? updated : o)));
    this.current.update((c) => (c?.id === orderId ? updated : c));
  }
}
