import { Component, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  imports: [RouterLink, FormsModule, ProductCardComponent, LoadingSkeletonComponent, EmptyStateComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent implements OnInit, OnDestroy {
  protected readonly catalog = inject(CatalogStore);
  protected readonly sort = this.catalog.sort;
  protected readonly minPrice = this.catalog.minPrice;
  protected readonly maxPrice = this.catalog.maxPrice;
  protected readonly color = this.catalog.color;
  protected readonly page = this.catalog.page;
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
  }

  ngOnDestroy(): void {
    this.querySub?.unsubscribe();
  }

  private applyParams(params: Record<string, string>): void {
    const categoryId = params['categories'] ?? null;
    const search = params['search'] ?? '';
    const sort = (params['sort'] as SortOption) ?? 'newest';
    const page = Number(params['page']) || 1;
    this.catalog.categoryId.set(categoryId);
    this.catalog.search.set(search);
    this.catalog.sort.set(sort);
    this.catalog.page.set(page);
  }

  async syncUrl(): Promise<void> {
    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        categories: this.catalog.categoryId() ?? undefined,
        search: this.catalog.search() || undefined,
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
    await this.syncUrl();
  }

  async goToPage(page: number): Promise<void> {
    this.catalog.page.set(page);
    await this.syncUrl();
  }
}
