import { Injectable, signal } from '@angular/core';
import { Product } from '../models';
import { readStorage, writeStorage } from '../utils/storage';

const LIMIT = 6;

@Injectable({ providedIn: 'root' })
export class RecentlyViewedStore {
  private byId = signal<Record<string, Product>>(
    readStorage<Record<string, Product>>('ecom.recentProducts', {}),
  );
  private ids = signal<string[]>(readStorage<string[]>('ecom.recent', []));

  readonly products = signal<Product[]>(
    readStorage<string[]>('ecom.recent', []).map(
      (id) => readStorage<Record<string, Product>>('ecom.recentProducts', {})[id],
    ).filter((p): p is Product => !!p),
  );

  add(product: Product): void {
    const nextIds = [product.id, ...this.ids().filter((id) => id !== product.id)].slice(0, LIMIT);
    const nextMap = { ...this.byId(), [product.id]: product };
    this.ids.set(nextIds);
    this.byId.set(nextMap);
    writeStorage('ecom.recent', nextIds);
    writeStorage('ecom.recentProducts', nextMap);
    this.products.set(nextIds.map((id) => nextMap[id]).filter(Boolean));
  }
}
