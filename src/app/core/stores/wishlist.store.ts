import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Product } from '../models';
import { WishlistService } from '../services/wishlist.service';
import { hasStoredToken } from '../utils/storage';

@Injectable({ providedIn: 'root' })
export class WishlistStore {
  private wishlistService = inject(WishlistService);

  private readonly _items = signal<Product[]>([]);
  private readonly _loading = signal(false);

  readonly list = computed(() => this._items());
  readonly count = computed(() => this._items().length);
  readonly loading = computed(() => this._loading());
  readonly loggedIn = computed(() => hasStoredToken());

  private isLoggedIn(): boolean {
    return hasStoredToken();
  }

  async load(): Promise<void> {
    if (!this.isLoggedIn()) {
      this._items.set([]);
      return;
    }
    this._loading.set(true);
    try {
      const items = await firstValueFrom(this.wishlistService.get());
      this._items.set(items);
    } catch {
      this._items.set([]);
    } finally {
      this._loading.set(false);
    }
  }

  contains(id: string): boolean {
    return this._items().some(p => p.id === id);
  }

  async toggle(product: Product): Promise<boolean> {
    if (!this.isLoggedIn()) return false;

    const wasIn = this.contains(product.id);
    // Optimistic update
    if (wasIn) {
      this._items.set(this._items().filter(p => p.id !== product.id));
    } else {
      this._items.set([...this._items(), product]);
    }

    try {
      if (wasIn) {
        await firstValueFrom(this.wishlistService.remove(product.id));
      } else {
        await firstValueFrom(this.wishlistService.add(product.id));
      }
      await this.load();
      return !wasIn;
    } catch {
      // Revert on error
      await this.load();
      return wasIn;
    }
  }

  async add(product: Product): Promise<boolean> {
    if (!this.isLoggedIn()) return false;
    if (this.contains(product.id)) return true;

    this._items.set([...this._items(), product]);
    try {
      await firstValueFrom(this.wishlistService.add(product.id));
      await this.load();
      return true;
    } catch {
      await this.load();
      return false;
    }
  }

  clear(): void {
    this._items.set([]);
  }
}
