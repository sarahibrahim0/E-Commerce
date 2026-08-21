import { Component, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { AuthStore } from '../../core/stores/auth.store';
import { CartStore } from '../../core/stores/cart.store';
import { WishlistStore } from '../../core/stores/wishlist.store';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { filter } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule, BreadcrumbComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  protected readonly auth = inject(AuthStore);
  protected readonly cart = inject(CartStore);
  protected readonly wishlist = inject(WishlistStore);
  protected searchQuery = '';
  protected isHome = true;
  protected hideNav = false;
  protected url = '';

  private router = inject(Router);

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.isHome = e.urlAfterRedirects === '/';
        this.url = e.urlAfterRedirects;
      });
    this.isHome = this.router.url === '/';
    this.url = this.router.url;
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.hideNav = window.scrollY > 80;
  }

  search(): void {
    const query = this.searchQuery.trim();
    this.router.navigate(['/products'], query ? { queryParams: { search: query } } : undefined);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
