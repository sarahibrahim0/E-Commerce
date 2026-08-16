import { Component, computed, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/models';
import { WishlistStore } from '../../core/stores/wishlist.store';
import { formatPrice } from '../../core/utils/price';
import { RatingStarsComponent } from '../rating-stars/rating-stars.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, RatingStarsComponent],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  product = input.required<Product>();
  addToCart = output<Product>();

  private wishlist = inject(WishlistStore);

  protected readonly price = computed(() => formatPrice(this.product().price));
  protected readonly wishlisted = computed(() => this.wishlist.contains(this.product().id));
  protected readonly image = computed(
    () => this.product().image.url || this.product().images[0]?.url || '',
  );
  protected readonly outOfStock = computed(() => this.product().countInStock <= 0);

  toggleWishlist(): void {
    this.wishlist.toggle(this.product());
  }

  onAddToCart(): void {
    this.addToCart.emit(this.product());
  }
}
