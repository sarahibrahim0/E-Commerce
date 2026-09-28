import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ProductsService } from '../services/products.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpTestingController;
  let products: ProductsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    localStorage.clear();
    http = TestBed.inject(HttpTestingController);
    products = TestBed.inject(ProductsService);
  });

  afterEach(() => http.verify());

  it('adds the Bearer token when present', () => {
    localStorage.setItem('ecom.token', 'abc123');
    products.list({}).subscribe();
    const req = http.expectOne(environment.apiUrl + 'products');
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc123');
  });

  it('omits the header when no token exists', () => {
    products.list({}).subscribe();
    const req = http.expectOne(environment.apiUrl + 'products');
    expect(req.request.headers.has('Authorization')).toBe(false);
  });

  it('passes a 404 through as an HttpErrorResponse', () => {
    let status = 0;
    products.get('nope').subscribe({ error: (err: { status: number }) => (status = err.status) });
    http.expectOne(environment.apiUrl + 'products/nope').flush(
      { message: 'not found' },
      { status: 404, statusText: 'Not Found' },
    );
    expect(status).toBe(404);
  });
});
