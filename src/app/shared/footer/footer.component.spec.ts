import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let fixture: ComponentFixture<FooterComponent>;
  let http: HttpTestingController;

  const FOOTER_PAGE = {
    id: 'f1',
    key: 'footer',
    title: 'ShopStore',
    tagline: 'Content tagline',
    sections: [{ heading: 'Quick Links', links: [{ label: 'About Us', href: '/about' }] }],
    contact: { email: 'old@example.com', phone: '000', address: 'Old', workingHours: '9-5', social: {} },
  };

  const flushRequests = (settings: Record<string, unknown>, categories: unknown[]) => {
    http.expectOne(`${environment.apiUrl}content/footer`).flush(FOOTER_PAGE);
    http.expectOne(`${environment.apiUrl}settings/seo`).flush(settings);
    http.expectOne(`${environment.apiUrl}categories`).flush(categories);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  const text = () => fixture.nativeElement.textContent as string;

  it('renders a link for each category selected in site settings', () => {
    fixture.detectChanges();
    flushRequests(
      { footerCategories: ['c1', 'c2'] },
      [
        { id: 'c1', name: 'Living Room' },
        { id: 'c2', name: 'Bedroom' },
        { id: 'c3', name: 'Dining Room' },
      ],
    );

    expect(text()).toContain('Living Room');
    expect(text()).toContain('Bedroom');
    // Not selected in the admin form, so it must not appear.
    expect(text()).not.toContain('Dining Room');

    const links: HTMLAnchorElement[] = Array.from(fixture.nativeElement.querySelectorAll('a'));
    const living = links.find((a) => a.textContent?.trim() === 'Living Room');
    expect(living?.getAttribute('href')).toBe('/products?categories=c1');
  });

  it('keeps the order chosen in the admin form', () => {
    fixture.detectChanges();
    flushRequests(
      { footerCategories: ['c2', 'c1'] },
      [
        { id: 'c1', name: 'Living Room' },
        { id: 'c2', name: 'Bedroom' },
      ],
    );

    const links: HTMLAnchorElement[] = Array.from(fixture.nativeElement.querySelectorAll('a'));
    const labels = links.map((a) => a.textContent?.trim());
    expect(labels.indexOf('Bedroom')).toBeLessThan(labels.indexOf('Living Room'));
  });

  it('hides categories that were disabled after being selected', () => {
    fixture.detectChanges();
    flushRequests(
      { footerCategories: ['c1', 'c2'] },
      [
        { id: 'c1', name: 'Living Room', isActive: true },
        { id: 'c2', name: 'Retired', isActive: false },
      ],
    );

    expect(text()).toContain('Living Room');
    expect(text()).not.toContain('Retired');
  });

  it('treats a category without an isActive flag as active', () => {
    fixture.detectChanges();
    flushRequests({ footerCategories: ['c1'] }, [{ id: 'c1', name: 'Living Room' }]);
    expect(text()).toContain('Living Room');
  });

  it('shows no categories column when none are selected', () => {
    fixture.detectChanges();
    flushRequests({ footerCategories: [] }, [{ id: 'c1', name: 'Living Room' }]);
    expect(text()).not.toContain('Living Room');
  });

  it('prefers the contact details from site settings over the content page', () => {
    fixture.detectChanges();
    flushRequests(
      {
        footerAddress: '12 Tahrir Street',
        footerPhone: '+20 100 123 4567',
        footerEmail: 'hello@havenandform.com',
        businessHours: 'Sat-Sun 10-4',
        footerFacebook: 'https://facebook.com/havenandform',
      },
      [],
    );

    expect(text()).toContain('12 Tahrir Street');
    expect(text()).toContain('+20 100 123 4567');
    expect(text()).toContain('hello@havenandform.com');
    expect(text()).toContain('Sat-Sun 10-4');
    expect(text()).not.toContain('Old');

    const social = fixture.nativeElement.querySelector('a[href="https://facebook.com/havenandform"]');
    expect(social).toBeTruthy();
  });

  it('falls back to the content page when site settings are unavailable', () => {
    fixture.detectChanges();
    http.expectOne(`${environment.apiUrl}content/footer`).flush(FOOTER_PAGE);
    http.expectOne(`${environment.apiUrl}settings/seo`).flush(null, { status: 500, statusText: 'Server Error' });
    http.expectOne(`${environment.apiUrl}categories`).flush([]);
    fixture.detectChanges();

    expect(text()).toContain('Content tagline');
    expect(text()).toContain('About Us');
  });
});
