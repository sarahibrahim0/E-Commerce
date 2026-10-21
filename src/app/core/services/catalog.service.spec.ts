import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { CatalogService } from './catalog.service';

describe('CatalogService', () => {
  let service: CatalogService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CatalogService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('fetches country-specific payment methods and currency', () => {
    const response = {
      country: 'EG',
      currency: { code: 'EGP', rate: 1, symbol: 'E£' },
      paymentMethods: [],
    };
    service.getCountryPaymentMethods('EG').subscribe((result) => {
      expect(result).toEqual(response);
    });

    const request = http.expectOne(`${environment.apiUrl}countries/EG/payment-methods`);
    expect(request.request.method).toBe('GET');
    request.flush(response);
  });
});
