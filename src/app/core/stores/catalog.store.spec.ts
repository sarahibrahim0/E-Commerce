import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { CatalogStore } from './catalog.store';
import { Product, Category } from '../models';

const product = (id: string, price = 10): Product => ({
  id, name: id, description: '', richDescription: '', price, rating: 0, numbReviews: 0,
  countInStock: 5, isFeatured: false, dateCreated: '2026-01-01T00:00:00Z',
  image: { url: '', publicId: '' }, images: [], brand: '', category: 'c1',
});

const category = (id: string, name: string): Category => ({ id, name, color: '', icon: '' });

describe('CatalogStore', () => {
  let store: CatalogStore;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(CatalogStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads products with the current query params', async () => {
    const p = store.loadProducts();
    const req = http.expectOne(environment.apiUrl + 'products');
    expect(req.request.method).toBe('GET');
    req.flush([product('p1'), product('p2')]);
    await p;
    expect(store.productsList().length).toBe(2);
    expect(store.productsLoading()).toBe(false);
  });

  it('sends category and search as query params', async () => {
    store.categoryId.set('c1');
    store.search.set('shoes');
    const p = store.loadProducts();
    const req = http.expectOne((r) => r.url === environment.apiUrl + 'products');
    expect(req.request.params.get('categories')).toBe('c1');
    expect(req.request.params.get('name')).toBe('shoes');
    req.flush([]);
    await p;
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
