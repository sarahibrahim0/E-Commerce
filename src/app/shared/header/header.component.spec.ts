import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { HeaderComponent } from './header.component';
import { AuthStore } from '../../core/stores/auth.store';
import { CartStore } from '../../core/stores/cart.store';
import { WishlistStore } from '../../core/stores/wishlist.store';
import { Product } from '../../core/models';

const product = (id: string): Product => ({
  id, name: id, description: '', richDescription: '', price: 10, salePrice: 0, rating: 0, numbReviews: 0,
  countInStock: 5, isFeatured: false, dateCreated: '2026-01-01T00:00:00Z',
  image: { url: '', publicId: '' }, images: [], brand: '', category: 'c1',
});

describe('HeaderComponent', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([])],
    });
  });

  it('renders the cart badge with the cart count', () => {
    const cart = TestBed.inject(CartStore);
    cart.add(product('p1'));
    cart.add(product('p1'), 2);
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('[data-testid="cart-badge"]');
    expect(badge.textContent.trim()).toBe('3');
  });

  it('renders the wishlist badge with the wishlist count', async () => {
    localStorage.setItem('ecom.token', 't');
    localStorage.setItem('ecom.userId', 'u1');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    const wishlist = TestBed.inject(WishlistStore);
    const togglePromise = wishlist.toggle(product('p1'));
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(`${environment.apiUrl}wishlist/p1`).flush([product('p1')]);
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    http.expectOne(`${environment.apiUrl}wishlist`).flush([product('p1')]);
    await togglePromise;
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('[data-testid="wishlist-badge"]');
    expect(badge.textContent.trim()).toBe('1');
  });

  it('navigates to /products with the search query on submit', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    const router = TestBed.inject(Router);
    const navigate = spyOn(router, 'navigate');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[data-testid="search-input"]');
    input.value = 'shoes';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const form = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    expect(navigate).toHaveBeenCalledWith(['/products'], { queryParams: { search: 'shoes' } });
  });

  it('shows sign-in links when logged out and profile menu when logged in', () => {
    localStorage.setItem('ecom.token', 't');
    localStorage.setItem('ecom.userId', 'u1');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([])],
    });
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="logout-button"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-testid="login-link"]')).toBeNull();
  });
});
