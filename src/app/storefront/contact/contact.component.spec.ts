import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { ContactComponent } from './contact.component';

describe('ContactComponent', () => {
  it('renders content from the API', () => {
    TestBed.configureTestingModule({
      imports: [ContactComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const fixture = TestBed.createComponent(ContactComponent);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    const req = http.expectOne(`${environment.apiUrl}content/contact`);
    req.flush({
      id: 'c2', key: 'contact', title: 'Contact us', sections: [],
      contact: { email: 'a@b.c', phone: '1', address: 'X', workingHours: '9-5', social: {} },
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Contact us');
    http.verify();
  });
});
