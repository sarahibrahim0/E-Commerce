import { Component, computed, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/models';
import { WishlistStore } from '../../core/stores/wishlist.store';
import { RegionStore } from '../../core/stores/region.store';
import { effectivePrice, onSale } from '../../core/utils/price';
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
  protected readonly region = inject(RegionStore);

  protected readonly price = computed(() => this.region.format(effectivePrice(this.product())));
  protected readonly oldPrice = computed(() => (onSale(this.product()) ? this.region.format(this.product().price) : ''));
  protected readonly discountPercent = computed(() => {
    const p = this.product();
    if (!onSale(p)) return 0;
    return Math.round(((p.price - Number(p.salePrice)) / p.price) * 100);
  });
  protected readonly onSale = computed(() => onSale(this.product()));
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
