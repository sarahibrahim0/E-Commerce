import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SettingsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('fetches the site settings from the public endpoint', () => {
    service.get().subscribe((settings) => expect(settings.footerAddress).toBe('12 Tahrir Street'));
    const req = http.expectOne(`${environment.apiUrl}settings/seo`);
    expect(req.request.method).toBe('GET');
    req.flush({ footerAddress: '12 Tahrir Street' });
  });

  it('normalizes the footer fields and category ids', () => {
    service.get().subscribe((settings) => {
      expect(settings.footerPhone).toBe('+20 100 123 4567');
      expect(settings.footerEmail).toBe('hello@havenandform.com');
      expect(settings.businessHours).toBe('Mon-Fri 9:00 AM - 6:00 PM');
      expect(settings.footerCategories).toEqual(['c1', 'c2']);
      expect(settings.about).toEqual({ en: 'About', ar: '' });
      expect(settings.defaultCurrency).toBe('EGP');
    });
    http.expectOne(`${environment.apiUrl}settings/seo`).flush({
      footerAddress: '12 Tahrir Street',
      footerPhone: '+20 100 123 4567',
      footerEmail: 'hello@havenandform.com',
      businessHours: 'Mon-Fri 9:00 AM - 6:00 PM',
      footerCategories: ['c1', 'c2'],
      about: { en: 'About' },
      defaultCurrency: 'EGP',
    });
  });

  it('defaults missing strings, categories and the cash on delivery flag', () => {
    service.get().subscribe((settings) => {
      expect(settings.footerCategories).toEqual([]);
      expect(settings.footerWhatsapp).toBe('');
      expect(settings.enableCashOnDelivery).toBe(true);
      expect(settings.title).toEqual({ en: '', ar: '' });
    });
    http.expectOne(`${environment.apiUrl}settings/seo`).flush({});
  });

  it('shares a single request between subscribers', () => {
    let calls = 0;
    service.get().subscribe(() => calls++);
    service.get().subscribe(() => calls++);
    http.expectOne(`${environment.apiUrl}settings/seo`).flush({});
    expect(calls).toBe(2);
    http.expectNone(`${environment.apiUrl}settings/seo`);
  });
});
