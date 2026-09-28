import { TestBed } from '@angular/core/testing';
import { RecentlyViewedStore } from './recently-viewed.store';
import { Product } from '../models';

const product = (id: string): Product => ({
  id, name: id, description: '', richDescription: '', price: 10, salePrice: 0, rating: 0, numbReviews: 0,
  countInStock: 5, isFeatured: false, dateCreated: '2026-01-01T00:00:00Z',
  image: { url: '', publicId: '' }, images: [], brand: '', category: 'c1',
});

describe('RecentlyViewedStore', () => {
  let store: RecentlyViewedStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    localStorage.clear();
    store = TestBed.inject(RecentlyViewedStore);
  });

  it('adds a product to the front of the list', () => {
    store.add(product('p1'));
    store.add(product('p2'));
    expect(store.products()[0].id).toBe('p2');
  });

  it('dedupes and caps at 6', () => {
    for (let i = 1; i <= 8; i++) store.add(product('p' + i));
    expect(store.products().length).toBe(6);
    store.add(product('p3'));
    expect(store.products().filter((p) => p.id === 'p3').length).toBe(1);
  });
});
