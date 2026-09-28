import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProductCardComponent } from './product-card.component';
import { WishlistStore } from '../../core/stores/wishlist.store';
import { Product } from '../../core/models';
import { environment } from '../../../environments/environment';

const product: Product = {
  id: 'p1', name: 'Sneakers', description: 'D', richDescription: '', price: 120, salePrice: 0,
  rating: 4, numbReviews: 3, countInStock: 5, isFeatured: false,
  dateCreated: '2026-01-01T00:00:00Z',
  image: { url: 'https://example.com/img.png', publicId: 'x' },
  images: [], brand: 'Nike', category: 'c1',
};

describe('ProductCardComponent', () => {
  let emitted: Product | null;

  beforeEach(() => {
    emitted = null;
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [ProductCardComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('renders name, price, brand, and rating', () => {
    const fixture = TestBed.createComponent(ProductCardComponent);
    fixture.componentRef.setInput('product', product);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Sneakers');
    expect(el.textContent).toContain('120 EGP');
    expect(el.textContent).toContain('Nike');
  });

  it('emits add-to-cart with the product', () => {
    const fixture = TestBed.createComponent(ProductCardComponent);
    fixture.componentRef.setInput('product', product);
    fixture.componentInstance.addToCart.subscribe((p) => (emitted = p));
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('[data-testid="add-to-cart"]');
    button.click();
    expect(emitted?.id).toBe('p1');
  });

  it('toggles wishlist state', () => {
    localStorage.setItem('ecom.token', 't');
    const fixture = TestBed.createComponent(ProductCardComponent);
    fixture.componentRef.setInput('product', product);
    fixture.detectChanges();
    const wishlist = TestBed.inject(WishlistStore);
    const http = TestBed.inject(HttpTestingController);
    const heart = fixture.nativeElement.querySelector('[data-testid="wishlist-heart"]');
    heart.click();
    expect(wishlist.contains('p1')).toBe(true);
    fixture.detectChanges();
    expect(heart.getAttribute('data-wishlisted')).toBe('true');
    http.expectOne(`${environment.apiUrl}wishlist/p1`).flush([]);
  });
});
