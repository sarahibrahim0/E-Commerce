import { TestBed } from '@angular/core/testing';
import { CartStore } from './cart.store';
import { Product, ShippingConfig } from '../models';
import { ShippingService } from '../services/shipping.service';
import { of } from 'rxjs';

const product = (id: string, price: number): Product => ({
  id, name: id, description: '', richDescription: '', price, salePrice: 0, rating: 0, numbReviews: 0,
  countInStock: 10, isFeatured: false, dateCreated: '2026-01-01T00:00:00Z',
  image: { url: '', publicId: '' }, images: [], brand: '', category: 'c1',
});

const config: ShippingConfig = {
  id: 'c1',
  freeShippingThreshold: 2000,
  baseRate: 50,
  currency: 'EGP',
  distanceRate: 2,
  originLatitude: 30.0444,
  originLongitude: 31.2357,
  rates: [
    { label: '', city: 'Cairo', country: 'Egypt', rate: 100 },
    { label: '', city: '', country: 'Egypt', rate: 120 },
  ],
};

const configNoOrigin: ShippingConfig = {
  ...config,
  originLatitude: undefined,
  originLongitude: undefined,
};

describe('CartStore', () => {
  let store: CartStore;
  let shippingSpy: jasmine.SpyObj<ShippingService>;

  beforeEach(() => {
    shippingSpy = jasmine.createSpyObj('ShippingService', ['getConfig']);
    shippingSpy.getConfig.and.returnValue(of(config));
    TestBed.configureTestingModule({
      providers: [{ provide: ShippingService, useValue: shippingSpy }],
    });
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

  it('loads the shipping config on demand', async () => {
    expect(store.config()).toBeNull();
    await store.loadConfig();
    expect(store.config()).toEqual(config);
    // no location set -> falls back to base rate
    expect(store.shippingFee()).toBe(50);
    expect(store.total()).toBe(store.subtotal() + 50);
  });

  it('charges shipping when below threshold and city matches', async () => {
    await store.loadConfig();
    store.add(product('p1', 100), 5); // subtotal 500
    store.setShippingLocation('Cairo', 'Egypt');
    expect(store.shippingFee()).toBe(100);
    expect(store.total()).toBe(600);
  });

  it('falls back to country rate when city has no match', async () => {
    await store.loadConfig();
    store.add(product('p1', 100), 5);
    store.setShippingLocation('Alexandria', 'Egypt');
    expect(store.shippingFee()).toBe(120);
  });

  it('free shipping above threshold regardless of location', async () => {
    await store.loadConfig();
    store.add(product('p1', 100), 30); // subtotal 3000
    store.setShippingLocation('Cairo', 'Egypt');
    expect(store.shippingFee()).toBe(0);
    expect(store.total()).toBe(3000);
  });

  it('charges by distance when coordinates are provided', async () => {
    await store.loadConfig();
    store.add(product('p1', 100), 5); // subtotal 500
    store.setShippingCoordinates(30.1, 31.3);
    expect(store.shippingFee()).toBeGreaterThan(10);
    expect(store.shippingFee()).toBeLessThan(30);
  });

  it('distance fee overrides city rate when coordinates are present', async () => {
    await store.loadConfig();
    store.add(product('p1', 100), 5);
    store.setShippingLocation('Cairo', 'Egypt');
    store.setShippingCoordinates(30.02, 31.24);
    expect(store.shippingFee()).not.toBe(100);
  });

  it('falls back to rates/base when origin coordinates are missing', async () => {
    shippingSpy.getConfig.and.returnValue(of(configNoOrigin));
    await store.loadConfig();
    store.add(product('p1', 100), 5);
    store.setShippingCoordinates(30.1, 31.3);
    expect(store.shippingFee()).toBe(50); // no origin -> base rate
    store.setShippingLocation('Cairo', 'Egypt');
    expect(store.shippingFee()).toBe(100); // city rate
  });

  it('free shipping above threshold wins over distance fee', async () => {
    await store.loadConfig();
    store.add(product('p1', 100), 30); // subtotal 3000
    store.setShippingCoordinates(30.1, 31.3);
    expect(store.shippingFee()).toBe(0);
  });
});
