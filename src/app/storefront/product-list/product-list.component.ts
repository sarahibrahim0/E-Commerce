import { Component, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CatalogStore, SortOption } from '../../core/stores/catalog.store';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { LoadingSkeletonComponent } from '../../shared/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { ToastService } from '../../shared/toast/toast.service';
import { CartStore } from '../../core/stores/cart.store';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [FormsModule, ProductCardComponent, LoadingSkeletonComponent, EmptyStateComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent implements OnInit, OnDestroy {
  protected readonly catalog = inject(CatalogStore);
  protected readonly totalPages = this.catalog.totalPages;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cart = inject(CartStore);
  private toasts = inject(ToastService);

  private querySub: Subscription | null = null;

  ngOnInit(): void {
    // queryParams emits the current params immediately, so this covers both
    // the initial load and later back/forward navigation.
    this.querySub = this.route.queryParams.subscribe((params) => {
      this.applyParams(params as Record<string, string>);
      void this.catalog.loadProducts();
    });
    if (this.catalog.categoriesList().length === 0) {
      void this.catalog.loadCategories();
    }
    if (this.catalog.colors().length === 0) {
      void this.catalog.loadColors();
    }
  }

  ngOnDestroy(): void {
    this.querySub?.unsubscribe();
  }

  private applyParams(params: Record<string, string>): void {
    const categoryId = params['categories'] ?? null;
    const search = params['search'] ?? '';
    const sort = (params['sort'] as SortOption) ?? 'newest';
    const page = Number(params['page']) || 1;
    const minPrice = this.parsePrice(params['minPrice']);
    const maxPrice = this.parsePrice(params['maxPrice']);
    this.catalog.categoryId.set(categoryId);
    this.catalog.search.set(search);
    this.catalog.minPrice.set(minPrice);
    this.catalog.maxPrice.set(maxPrice);
    this.catalog.color.set(params['color']?.trim() || null);
    this.catalog.sort.set(sort);
    this.catalog.page.set(page);
  }

  private parsePrice(value: string | undefined): number | null {
    if (value === undefined || value.trim() === '') return null;
    const price = Number(value);
    return Number.isFinite(price) && price >= 0 ? price : null;
  }

  async syncUrl(): Promise<void> {
    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        categories: this.catalog.categoryId() ?? undefined,
        search: this.catalog.search() || undefined,
        minPrice: this.catalog.minPrice() ?? undefined,
        maxPrice: this.catalog.maxPrice() ?? undefined,
        color: this.catalog.color()?.trim() || undefined,
        sort: this.catalog.sort() === 'newest' ? undefined : this.catalog.sort(),
        page: this.catalog.page() === 1 ? undefined : this.catalog.page(),
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
    await this.catalog.loadProducts();
  }

  protected readonly selectedCategoryName = computed(() => {
    const id = this.catalog.categoryId();
    return this.catalog.categoriesList().find((c) => c.id === id)?.name ?? null;
  });

  clearCategory(): void {
    this.catalog.categoryId.set(null);
    void this.syncUrl();
  }

  addToCart(product: import('../../core/models').Product): void {
    this.cart.add(product);
    this.toasts.show(`${product.name} added to cart`, 'success');
  }

  async applyFilters(): Promise<void> {
    this.catalog.page.set(1);
    await this.syncUrl();
  }

  clearFilters(): void {
    this.catalog.categoryId.set(null);
    this.catalog.search.set('');
    this.catalog.minPrice.set(null);
    this.catalog.maxPrice.set(null);
    this.catalog.color.set(null);
    this.catalog.sort.set('newest');
    this.catalog.page.set(1);
    void this.syncUrl();
  }

  async goToPage(page: number): Promise<void> {
    this.catalog.page.set(page);
    await this.syncUrl();
  }
}
