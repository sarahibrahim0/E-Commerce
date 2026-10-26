import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { CatalogStore } from './catalog.store';
import { Product, Category } from '../models';
import { RegionStore } from './region.store';
import { signal } from '@angular/core';

const product = (id: string, price = 10): Product => ({
  id, name: id, description: '', richDescription: '', price, salePrice: 0, rating: 0, numbReviews: 0,
  countInStock: 5, isFeatured: false, dateCreated: '2026-01-01T00:00:00Z',
  image: { url: '', publicId: '' }, images: [], brand: '', category: 'c1',
});

const category = (id: string, name: string): Category => ({ id, name, color: '', icon: '' });

describe('CatalogStore', () => {
  let store: CatalogStore;
  let http: HttpTestingController;
  const region = {
    currency: signal({ code: 'EGP', symbol: 'E£', rate: 1 }),
    ensureLoaded: jasmine.createSpy('ensureLoaded').and.resolveTo(undefined),
  };

  beforeEach(() => {
    region.currency.set({ code: 'EGP', symbol: 'E£', rate: 1 });
    region.ensureLoaded.calls.reset();
    region.ensureLoaded.and.returnValue(Promise.resolve());
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RegionStore, useValue: region },
      ],
    });
    store = TestBed.inject(CatalogStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads products with the current query params', async () => {
    const p = store.loadProducts();
    await Promise.resolve();
    const req = http.expectOne(environment.apiUrl + 'products');
    expect(req.request.method).toBe('GET');
    req.flush({ data: [product('p1'), product('p2')], total: 2, page: 1, totalPages: 1 });
    await p;
    expect(store.productsList().length).toBe(2);
    expect(store.productsLoading()).toBe(false);
  });

  it('sends category and search as query params', async () => {
    store.categoryId.set('c1');
    store.search.set('shoes');
    const p = store.loadProducts();
    await Promise.resolve();
    const req = http.expectOne((r) => r.url === environment.apiUrl + 'products');
    expect(req.request.params.get('categories')).toBe('c1');
    expect(req.request.params.get('search')).toBe('shoes');
    req.flush({ data: [], total: 0, page: 1, totalPages: 0 });
    await p;
  });

  it('sends price bounds including zero and color as query params', async () => {
    store.minPrice.set(0);
    store.maxPrice.set(50);
    store.color.set('matte black');
    const p = store.loadProducts();
    await Promise.resolve();
    const req = http.expectOne((r) => r.url === environment.apiUrl + 'products');
    expect(req.request.params.get('minPrice')).toBe('0');
    expect(req.request.params.get('maxPrice')).toBe('50');
    expect(req.request.params.get('color')).toBe('matte black');
    req.flush({ data: [], total: 0, page: 1, totalPages: 0 });
    await p;
  });

  it('converts displayed-currency price bounds to base currency after loading exchange rates', async () => {
    region.ensureLoaded.calls.reset();
    region.ensureLoaded.and.callFake(async () => {
      region.currency.set({ code: 'USD', symbol: '$', rate: 0.03 });
    });
    store.minPrice.set(24);
    store.maxPrice.set(65);

    const p = store.loadProducts();
    await Promise.resolve();
    const req = http.expectOne((r) => r.url === environment.apiUrl + 'products');
    expect(region.ensureLoaded).toHaveBeenCalled();
    expect(req.request.params.get('minPrice')).toBe(String(24 / 0.03));
    expect(req.request.params.get('maxPrice')).toBe(String(65 / 0.03));
    req.flush({ data: [], total: 0, page: 1, totalPages: 0 });
    await p;
  });

  it('loads available product colors from the backend', async () => {
    const p = store.loadColors();
    http.expectOne(environment.apiUrl + 'products/colors').flush(['Black', 'Matte Black']);
    await p;
    expect(store.colors()).toEqual(['Black', 'Matte Black']);
    expect(store.colorsError()).toBeNull();
    expect(store.colorsLoading()).toBeFalse();
  });

  it('sorts products by price ascending', () => {
    store.productsList.set([product('a', 50), product('b', 10), product('c', 30)]);
    store.sort.set('priceAsc');
    expect(store.visible().map((p) => p.id)).toEqual(['b', 'c', 'a']);
  });

  it('pages products', () => {
    store.productsList.set([product('a'), product('b'), product('c'), product('d'), product('e')]);
    store.pageSize.set(2);
    store.page.set(1);
    expect(store.paged().map((p) => p.id)).toEqual(['a', 'b']);
    expect(store.totalPages()).toBe(3);
    store.page.set(3);
    expect(store.paged().map((p) => p.id)).toEqual(['e']);
  });

  it('records loading and error state on failure', async () => {
    const p = store.loadProducts();
    await Promise.resolve();
    const req = http.expectOne(environment.apiUrl + 'products');
    req.flush({ message: 'server error' }, { status: 500, statusText: 'Error' });
    await p;
    expect(store.productsError()).toBe('server error');
    expect(store.productsLoading()).toBe(false);
  });

  it('loads categories', async () => {
    const p = store.loadCategories();
    const req = http.expectOne(environment.apiUrl + 'categories');
    req.flush([category('c1', 'Clothing')]);
    await p;
    expect(store.categoriesList().length).toBe(1);
    expect(store.categoriesList()[0].name).toBe('Clothing');
  });
});
