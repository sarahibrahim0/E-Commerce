import { Injectable, computed, signal } from '@angular/core';
import { Product } from '../models';
import { readStorage, writeStorage } from '../utils/storage';

@Injectable({ providedIn: 'root' })
export class WishlistStore {
  private byId = signal<Record<string, Product>>(
    readStorage<Record<string, Product>>('ecom.wishlist', {}),
  );

  readonly list = computed(() => Object.values(this.byId()));
  readonly count = computed(() => this.list().length);

  contains(id: string): boolean {
    return !!this.byId()[id];
  }

  toggle(product: Product): void {
    const current = this.byId();
    const next = { ...current };
    if (next[product.id]) {
      delete next[product.id];
    } else {
      next[product.id] = product;
    }
    this.byId.set(next);
    writeStorage('ecom.wishlist', next);
  }
}
