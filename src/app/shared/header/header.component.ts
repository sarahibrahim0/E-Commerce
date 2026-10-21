import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { LOCALE_ID } from '@angular/core';
import { AuthStore } from '../../core/stores/auth.store';
import { CartStore } from '../../core/stores/cart.store';
import { WishlistStore } from '../../core/stores/wishlist.store';
import { RegionStore } from '../../core/stores/region.store';
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
  protected readonly region = inject(RegionStore);
  protected readonly regionFlag = computed(() => {
    // The flag must always match the currency being displayed, not the last
    // country checkout picked for shipping.
    const code = this.region.currency().code;
    const byCurrency = this.region.options().find((o) => o.currencyCode === code);
    if (byCurrency?.flag) return byCurrency.flag;
    return this.region.selectedCountry()?.flag || '🌐';
  });

  protected searchQuery = signal('');
  protected menuOpen = signal(false);
  protected currencyMenuOpen = signal(false);
  protected isHome = true;
  protected hideNav = false;
  protected url = '';
  protected otherLocaleUrl = '';
  protected otherLocaleLabel = '';

  private router = inject(Router);
  private localeId = inject(LOCALE_ID);
  protected searchTerms = new Subject<string>();

  constructor() {
    void this.region.ensureLoaded();
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.isHome = e.urlAfterRedirects === '/';
        this.url = e.urlAfterRedirects;
        this.menuOpen.set(false);
        this.closeCurrencyMenu();
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

  @HostListener('document:click')
  closeCurrencyMenu(): void {
    this.currencyMenuOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeCurrencyMenu();
  }

  toggleCurrencyMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.currencyMenuOpen.update((open) => !open);
  }

  selectCurrency(code: string): void {
    this.region.setCurrency(code);
    this.closeCurrencyMenu();
  }

  search(): void {
    // Submitting the form (Enter / search button) navigates immediately;
    // the debounced stream is only for live typing.
    const query = this.searchQuery().trim();
    this.router.navigate(['/products'], query ? { queryParams: { search: query } } : undefined);
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
    this.closeCurrencyMenu();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
