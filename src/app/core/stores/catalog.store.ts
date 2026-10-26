import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Category, Product } from '../models';
import { CategoriesService } from '../services/categories.service';
import { ProductsService } from '../services/products.service';
import { normalizeApiError } from '../services/api-error';
import { RegionStore } from './region.store';

export type SortOption = 'newest' | 'priceAsc' | 'priceDesc' | 'rating';

@Injectable({ providedIn: 'root' })
export class CatalogStore {
  private productsApi = inject(ProductsService);
  private categoriesApi = inject(CategoriesService);
  private region = inject(RegionStore);

  readonly productsList = signal<Product[]>([]);
  readonly productsLoading = signal(false);
  readonly productsError = signal<string | null>(null);
  readonly colors = signal<string[]>([]);
  readonly colorsLoading = signal(false);
  readonly colorsError = signal<string | null>(null);
  readonly categoriesList = signal<Category[]>([]);
  readonly categoriesLoading = signal(false);
  readonly categoriesError = signal<string | null>(null);

  readonly categoryId = signal<string | null>(null);
  readonly search = signal('');
  readonly minPrice = signal<number | null>(null);
  readonly maxPrice = signal<number | null>(null);
  readonly color = signal<string | null>(null);
  readonly sort = signal<SortOption>('newest');
  readonly page = signal(1);
  readonly pageSize = signal(9);

  readonly visible = computed(() => {
    const list = [...this.productsList()];
    switch (this.sort()) {
      case 'priceAsc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      default:
        list.sort((a, b) => +new Date(b.dateCreated) - +new Date(a.dateCreated));
    }
    return list;
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.visible().length / this.pageSize())),
  );

  readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.visible().slice(start, start + this.pageSize());
  });

  async loadProducts(): Promise<void> {
    this.productsLoading.set(true);
    this.productsError.set(null);
    try {
      await this.region.ensureLoaded();
      const rate = this.region.currency().rate;
      const list = await firstValueFrom(
        this.productsApi.list({
          categoryId: this.categoryId(),
          search: this.search(),
          minPrice: this.toBasePrice(this.minPrice(), rate),
          maxPrice: this.toBasePrice(this.maxPrice(), rate),
          color: this.color(),
        }),
      );
      this.productsList.set(list.data);
      const total = Math.max(1, Math.ceil(list.data.length / this.pageSize()));
      if (this.page() > total) {
        this.page.set(total);
      }
    } catch (err) {
      this.productsError.set(normalizeApiError(err).message);
    } finally {
      this.productsLoading.set(false);
    }
  }

  private toBasePrice(displayPrice: number | null, rate: number): number | null {
    return displayPrice === null ? null : displayPrice / rate;
  }

  async loadCategories(): Promise<void> {
    this.categoriesLoading.set(true);
    this.categoriesError.set(null);
    try {
      this.categoriesList.set(await firstValueFrom(this.categoriesApi.list()));
    } catch (err) {
      this.categoriesError.set(normalizeApiError(err).message);
    } finally {
      this.categoriesLoading.set(false);
    }
  }

  async loadColors(): Promise<void> {
    this.colorsLoading.set(true);
    this.colorsError.set(null);
    try {
      this.colors.set(await firstValueFrom(this.productsApi.colors()));
    } catch (err) {
      this.colorsError.set(normalizeApiError(err).message);
    } finally {
      this.colorsLoading.set(false);
    }
  }
}
