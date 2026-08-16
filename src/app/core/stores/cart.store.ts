import { Injectable, computed, signal } from '@angular/core';
import { CartItem, Product } from '../models';
import { readStorage, writeStorage } from '../utils/storage';

@Injectable({ providedIn: 'root' })
export class CartStore {
  readonly items = signal<CartItem[]>(readStorage<CartItem[]>('ecom.cart', []));
  readonly count = computed(() => this.items().reduce((sum, i) => sum + i.quantity, 0));
  readonly subtotal = computed(() =>
    this.items().reduce((sum, i) => sum + i.product.price * i.quantity, 0),
  );

  add(product: Product, quantity = 1): void {
    const existing = this.items().find((i) => i.product.id === product.id);
    let next: CartItem[];
    if (existing) {
      next = this.items().map((i) =>
        i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i,
      );
    } else {
      next = [...this.items(), { product, quantity }];
    }
    this.items.set(next);
    writeStorage('ecom.cart', next);
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.remove(productId);
      return;
    }
    const next = this.items().map((i) =>
      i.product.id === productId ? { ...i, quantity } : i,
    );
    this.items.set(next);
    writeStorage('ecom.cart', next);
  }

  remove(productId: string): void {
    const next = this.items().filter((i) => i.product.id !== productId);
    this.items.set(next);
    writeStorage('ecom.cart', next);
  }

  clear(): void {
    this.items.set([]);
    writeStorage('ecom.cart', []);
  }
}
