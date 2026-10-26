import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { LOCALE_ID } from '@angular/core';
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
        { provide: LOCALE_ID, useValue: 'en-US' },
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
    expect(req.request.headers.get('Accept-Language')).toBe('en');
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

describe('authInterceptor Arabic locale', () => {
  let http: HttpTestingController;
  let products: ProductsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: LOCALE_ID, useValue: 'ar' },
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    localStorage.clear();
    http = TestBed.inject(HttpTestingController);
    products = TestBed.inject(ProductsService);
  });

  afterEach(() => http.verify());

  it('requests Arabic API error messages for Arabic builds', () => {
    products.list({}).subscribe();
    const req = http.expectOne(environment.apiUrl + 'products');
    expect(req.request.headers.get('Accept-Language')).toBe('ar');
  });
});
