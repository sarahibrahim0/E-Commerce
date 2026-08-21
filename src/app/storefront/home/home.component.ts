import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product, Category } from '../../core/models';
import { ProductsService } from '../../core/services/products.service';
import { CategoriesService } from '../../core/services/categories.service';
import { RecentlyViewedStore } from '../../core/stores/recently-viewed.store';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { ToastService } from '../../shared/toast/toast.service';
import { CartStore } from '../../core/stores/cart.store';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ProductCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  protected readonly recentlyViewed = inject(RecentlyViewedStore);

  readonly featured = signal<Product[]>([]);
  readonly featuredLoading = signal(false);
  readonly categories = signal<Category[]>([]);
  readonly categoriesLoading = signal(false);
  readonly categoryProducts = signal<Product[]>([]);
  readonly categoryProductsLoading = signal(false);
  readonly activeCategoryIndex = signal(0);

  readonly isVisible = [signal(false), signal(false)];

  private productsApi = inject(ProductsService);
  private categoriesApi = inject(CategoriesService);
  private cart = inject(CartStore);
  private toasts = inject(ToastService);

  constructor() {
    void this.loadFeatured();
    void this.loadCategories();
  }

  show(index: number): void {
    this.isVisible[index].set(true);
  }

  hide(index: number): void {
    this.isVisible[index].set(false);
  }

  async loadCategoryProducts(categoryId: string, index: number): Promise<void> {
    this.activeCategoryIndex.set(index);
    this.categoryProductsLoading.set(true);
    try {
      const all = await firstValueFrom(this.productsApi.list({ categoryId }));
      this.categoryProducts.set(all.slice(0, 3));
    } finally {
      this.categoryProductsLoading.set(false);
    }
  }

  private async loadFeatured(): Promise<void> {
    this.featuredLoading.set(true);
    try {
      this.featured.set(await firstValueFrom(this.productsApi.featured(6)));
    } finally {
      this.featuredLoading.set(false);
    }
  }

  private async loadCategories(): Promise<void> {
    this.categoriesLoading.set(true);
    try {
      const cats = await firstValueFrom(this.categoriesApi.list());
      this.categories.set(cats);
      if (cats.length > 0) {
        await this.loadCategoryProducts(cats[0].id, 0);
      }
    } finally {
      this.categoriesLoading.set(false);
    }
  }

  addToCart(product: Product): void {
    this.cart.add(product);
    this.toasts.show(`${product.name} added to cart`, 'success');
  }
}
