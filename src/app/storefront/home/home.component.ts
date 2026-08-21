import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product, Category } from '../../core/models';
import { ProductsService } from '../../core/services/products.service';
import { CategoriesService } from '../../core/services/categories.service';
import { CartStore } from '../../core/stores/cart.store';
import { ToastService } from '../../shared/toast/toast.service';
import { ProductItemComponent } from '../../shared/product-item/product-item.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ProductItemComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  categories: Category[] = [];
  products: Product[] = [];
  activeButton = 0;
  id = '';
  popular: Product[] = [];

  isVisible0 = false;
  isVisible1 = false;

  private productsApi = inject(ProductsService);
  private categoriesApi = inject(CategoriesService);
  private cart = inject(CartStore);
  private toasts = inject(ToastService);

  constructor() {
    void this.init();
  }

  private async init(): Promise<void> {
    try {
      this.categories = await firstValueFrom(this.categoriesApi.list());
      if (this.categories.length > 0) {
        this.id = this.categories[0].id;
        await this.getProducts(this.id, 0);
      }
      await this.getPopularProducts();
    } catch (e) {
      console.log(e);
    }
  }

  show(index: number): void {
    if (index === 0) this.isVisible0 = true;
    else if (index === 1) this.isVisible1 = true;
  }

  hide(index: number): void {
    if (index === 0) this.isVisible0 = false;
    else if (index === 1) this.isVisible1 = false;
  }

  async getProducts(id: string, index: number): Promise<void> {
    this.activeButton = index;
    this.id = id;
    try {
      const all = await firstValueFrom(this.productsApi.list({ categoryId: id }));
      this.products = all.slice(0, 3);
    } catch (e) {
      console.log(e);
    }
  }

  private async getPopularProducts(): Promise<void> {
    try {
      this.popular = await firstValueFrom(this.productsApi.featured(6));
    } catch (e) {
      console.log(e);
    }
  }

  addToCart(product: Product): void {
    this.cart.add(product);
    this.toasts.show(`${product.name} added to cart`, 'success');
  }
}
