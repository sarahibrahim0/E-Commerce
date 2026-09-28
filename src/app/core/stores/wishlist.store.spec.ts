import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { WishlistStore } from './wishlist.store';
import { AuthStore } from './auth.store';
import { Product } from '../models';

const product = (id: string): Product => ({
  id, name: id, description: '', richDescription: '', price: 10, salePrice: 0, rating: 0, numbReviews: 0,
  countInStock: 5, isFeatured: false, dateCreated: '2026-01-01T00:00:00Z',
  image: { url: '', publicId: '' }, images: [], brand: '', category: 'c1',
});

describe('WishlistStore', () => {
  let store: WishlistStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    localStorage.clear();
    store = TestBed.inject(WishlistStore);
  });

  it('starts empty', () => {
    expect(store.count()).toBe(0);
    expect(store.contains('p1')).toBe(false);
  });

  it('exposes the list of products', async () => {
    const httpMock = TestBed.inject(HttpTestingController);
    const auth = TestBed.inject(AuthStore);

    // Simulate logged-in state
    localStorage.setItem('ecom.token', 'fake-token');
    auth.token.set('fake-token');

    const loadPromise = store.load();
    const req = httpMock.expectOne('http://localhost:3000/api/v1/wishlist');
    req.flush([product('p1')]);
    await loadPromise;

    expect(store.contains('p1')).toBe(true);
    expect(store.count()).toBe(1);
  });

  it('clear removes all items', () => {
    store.clear();
    expect(store.count()).toBe(0);
  });
});
