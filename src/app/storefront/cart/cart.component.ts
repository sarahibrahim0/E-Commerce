import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartStore } from '../../core/stores/cart.store';
import { WishlistStore } from '../../core/stores/wishlist.store';
import { formatPrice } from '../../core/utils/price';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, EmptyStateComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent {
  protected readonly cart = inject(CartStore);
  protected readonly wishlist = inject(WishlistStore);

  protected readonly formatPrice = formatPrice;
  protected readonly subtotal = computed(() => formatPrice(this.cart.subtotal()));
}
