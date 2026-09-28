import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartStore } from '../../core/stores/cart.store';
import { WishlistStore } from '../../core/stores/wishlist.store';
import { formatPrice } from '../../core/utils/price';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [RouterLink, EmptyStateComponent, ProductCardComponent],
  template: `
    <div class="w-full ps-[175px] pe-[175px] pt-page-x pb-section">
      <h1 class="text-2xl font-bold text-blue-black" i18n="Wishlist heading|@@wishlist.title">My wishlist</h1>

      @if (wishlist.loading()) {
        <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading" i18n-aria-label="Loading indicator|@@wishlist.loadingAria">
          @for (_ of [0, 1, 2]; track $index) {
            <div class="animate-pulse rounded-lg border border-[#F6F8FE] p-3">
              <div class="aspect-square rounded bg-[#ecd7cd]"></div>
              <div class="mt-3 h-3 w-1/4 rounded bg-[#ecd7cd]"></div>
              <div class="mt-2 h-4 w-3/4 rounded bg-[#ecd7cd]"></div>
              <div class="mt-2 h-5 w-1/3 rounded bg-[#ecd7cd]"></div>
              <div class="mt-3 h-9 rounded bg-[#ecd7cd]"></div>
            </div>
          }
        </div>
      } @else if (wishlist.count() === 0) {
        <app-empty-state message="Your wishlist is empty." i18n-message="Empty wishlist message|@@wishlist.empty" />
        <div class="text-center">
          <a routerLink="/products" class="inline-block rounded-md uppercase tracking-wider bg-salmon px-5 py-2.5 text-sm font-medium text-white hover:bg-[#e9855a]" i18n="Browse products action|@@wishlist.browseProducts">
            Browse products
          </a>
        </div>
      } @else {
        <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (product of wishlist.list(); track product.id) {
            <app-product-card [product]="product" (addToCart)="addToCart($event)" />
          }
        </div>
      }
    </div>
  `,
})
export class WishlistComponent implements OnInit {
  protected readonly wishlist = inject(WishlistStore);
  private readonly cart = inject(CartStore);

  ngOnInit(): void {
    this.wishlist.load();
  }

  addToCart(product: any): void {
    this.cart.add(product);
  }
}
