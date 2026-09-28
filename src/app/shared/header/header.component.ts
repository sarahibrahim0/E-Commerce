import { Component, HostListener, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { LOCALE_ID } from '@angular/core';
import { AuthStore } from '../../core/stores/auth.store';
import { CartStore } from '../../core/stores/cart.store';
import { WishlistStore } from '../../core/stores/wishlist.store';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { filter } from 'rxjs';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, FormsModule, BreadcrumbComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  protected readonly auth = inject(AuthStore);
  protected readonly cart = inject(CartStore);
  protected readonly wishlist = inject(WishlistStore);
  protected searchQuery = signal('');
  protected isHome = true;
  protected hideNav = false;
  protected url = '';
  protected otherLocaleUrl = '';
  protected otherLocaleLabel = '';

  private router = inject(Router);
  private localeId = inject(LOCALE_ID);
  protected searchTerms = new Subject<string>();

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.isHome = e.urlAfterRedirects === '/';
        this.url = e.urlAfterRedirects;
        this.updateOtherLocaleUrl();
      });
    this.isHome = this.router.url === '/';
    this.url = this.router.url;
    this.updateOtherLocaleUrl();

    this.searchTerms.pipe(
      debounceTime(400),
      distinctUntilChanged(),
    ).subscribe((query) => {
      this.router.navigate(['/products'], query ? { queryParams: { search: query } } : undefined);
    });
  }

  private updateOtherLocaleUrl(): void {
    const isAr = String(this.localeId ?? 'en').toLowerCase().startsWith('ar');
    const other = isAr ? 'en' : 'ar';
    const path = this.url === '/' ? '' : this.url;
    this.otherLocaleUrl = `/${other}${path}`;
    this.otherLocaleLabel = isAr ? 'English' : 'العربية';
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.hideNav = window.scrollY > 80;
  }

  search(): void {
    this.searchTerms.next(this.searchQuery().trim());
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
