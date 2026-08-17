import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../core/stores/auth.store';
import { WishlistStore } from '../../core/stores/wishlist.store';
import { CartStore } from '../../core/stores/cart.store';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { ToastService } from '../../shared/toast/toast.service';
import { Product } from '../../core/models';

@Component({
  selector: 'app-user-data',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, EmptyStateComponent],
  templateUrl: './user-data.component.html',
  styleUrl: './user-data.component.scss',
})
export class UserDataComponent {
  protected readonly auth = inject(AuthStore);
  protected readonly wishlist = inject(WishlistStore);

  private cart = inject(CartStore);
  private toasts = inject(ToastService);

  addToCart(product: Product): void {
    this.cart.add(product);
    this.toasts.show(`${product.name} added to cart`, 'success');
  }
}
