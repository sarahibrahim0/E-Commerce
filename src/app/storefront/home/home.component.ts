import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product, Category } from '../../core/models';
import { ProductsService } from '../../core/services/products.service';
import { CategoriesService } from '../../core/services/categories.service';
import { RecentlyViewedStore } from '../../core/stores/recently-viewed.store';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { LoadingSkeletonComponent } from '../../shared/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { ToastService } from '../../shared/toast/toast.service';
import { CartStore } from '../../core/stores/cart.store';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, LoadingSkeletonComponent, EmptyStateComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  protected readonly recentlyViewed = inject(RecentlyViewedStore);

  readonly featured = signal<Product[]>([]);
  readonly featuredLoading = signal(false);
  readonly categories = signal<Category[]>([]);
  readonly categoriesLoading = signal(false);

  private productsApi = inject(ProductsService);
  private categoriesApi = inject(CategoriesService);
  private cart = inject(CartStore);
  private toasts = inject(ToastService);

  constructor() {
    void this.loadFeatured();
    void this.loadCategories();
  }

  private async loadFeatured(): Promise<void> {
    this.featuredLoading.set(true);
    try {
      this.featured.set(await firstValueFrom(this.productsApi.featured(8)));
    } finally {
      this.featuredLoading.set(false);
    }
  }

  private async loadCategories(): Promise<void> {
    this.categoriesLoading.set(true);
    try {
      this.categories.set(await firstValueFrom(this.categoriesApi.list()));
    } finally {
      this.categoriesLoading.set(false);
    }
  }

  addToCart(product: Product): void {
    this.cart.add(product);
    this.toasts.show(`${product.name} added to cart`, 'success');
  }
}
