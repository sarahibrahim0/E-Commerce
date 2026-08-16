import { TestBed } from '@angular/core/testing';
import { WishlistStore } from './wishlist.store';
import { Product } from '../models';

const product = (id: string): Product => ({
  id, name: id, description: '', richDescription: '', price: 10, rating: 0, numbReviews: 0,
  countInStock: 5, isFeatured: false, dateCreated: '2026-01-01T00:00:00Z',
  image: { url: '', publicId: '' }, images: [], brand: '', category: 'c1',
});

describe('WishlistStore', () => {
  let store: WishlistStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    localStorage.clear();
    store = TestBed.inject(WishlistStore);
  });

  it('starts empty', () => {
    expect(store.count()).toBe(0);
    expect(store.contains('p1')).toBe(false);
  });

  it('toggles a product in and out', () => {
    store.toggle(product('p1'));
    expect(store.contains('p1')).toBe(true);
    expect(store.count()).toBe(1);
    store.toggle(product('p1'));
    expect(store.contains('p1')).toBe(false);
    expect(store.count()).toBe(0);
  });

  it('persists and restores from localStorage', () => {
    store.toggle(product('p1'));
    store.toggle(product('p2'));
    const restored = TestBed.inject(WishlistStore);
    expect(restored.count()).toBe(2);
    expect(restored.contains('p1')).toBe(true);
  });

  it('exposes the list of products', () => {
    store.toggle(product('p1'));
    expect(store.list()[0].id).toBe('p1');
  });
});
