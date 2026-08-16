import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStore } from '../../core/stores/auth.store';
import { CartStore } from '../../core/stores/cart.store';
import { WishlistStore } from '../../core/stores/wishlist.store';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  protected readonly auth = inject(AuthStore);
  protected readonly cart = inject(CartStore);
  protected readonly wishlist = inject(WishlistStore);
  protected searchQuery = '';

  private router = inject(Router);

  search(): void {
    const query = this.searchQuery.trim();
    this.router.navigate(['/products'], query ? { queryParams: { search: query } } : undefined);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
