import { TestBed } from '@angular/core/testing';
import { CartStore } from './cart.store';
import { Product } from '../models';

const product = (id: string, price: number): Product => ({
  id, name: id, description: '', richDescription: '', price, rating: 0, numbReviews: 0,
  countInStock: 10, isFeatured: false, dateCreated: '2026-01-01T00:00:00Z',
  image: { url: '', publicId: '' }, images: [], brand: '', category: 'c1',
});

describe('CartStore', () => {
  let store: CartStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    localStorage.clear();
    store = TestBed.inject(CartStore);
  });

  it('starts empty', () => {
    expect(store.items().length).toBe(0);
    expect(store.count()).toBe(0);
    expect(store.subtotal()).toBe(0);
  });

  it('adds a product and computes count and subtotal', () => {
    store.add(product('p1', 100), 2);
    store.add(product('p2', 50));
    expect(store.count()).toBe(3);
    expect(store.subtotal()).toBe(250);
  });

  it('merges quantities for the same product', () => {
    store.add(product('p1', 100), 2);
    store.add(product('p1', 100), 3);
    expect(store.items().length).toBe(1);
    expect(store.items()[0].quantity).toBe(5);
    expect(store.count()).toBe(5);
  });

  it('updates quantity and removes when quantity drops to zero', () => {
    store.add(product('p1', 100), 2);
    store.updateQuantity('p1', 4);
    expect(store.items()[0].quantity).toBe(4);
    store.updateQuantity('p1', 0);
    expect(store.items().length).toBe(0);
  });

  it('removes a product by id', () => {
    store.add(product('p1', 100));
    store.remove('p1');
    expect(store.items().length).toBe(0);
  });

  it('persists to localStorage and restores', () => {
    store.add(product('p1', 100), 2);
    const restored = TestBed.inject(CartStore);
    expect(restored.count()).toBe(2);
    expect(restored.items()[0].product.id).toBe('p1');
  });

  it('clears the cart', () => {
    store.add(product('p1', 100));
    store.clear();
    expect(store.count()).toBe(0);
  });
});
