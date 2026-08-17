import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { ContentService } from './content.service';

describe('ContentService', () => {
  let service: ContentService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ContentService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('fetches a page by key', () => {
    const page = { id: 'c1', key: 'about', title: 'About us', sections: [] };
    service.getByKey('about').subscribe((p) => expect(p.title).toBe('About us'));
    const req = http.expectOne(`${environment.apiUrl}content/about`);
    expect(req.request.method).toBe('GET');
    req.flush(page);
  });

  it('sends a contact message', () => {
    const message = { name: 'Sara', email: 's@b.c', subject: 'Hi', message: 'Hello!' };
    service.sendMessage(message).subscribe((res) => expect(res.message).toBe('message sent'));
    const req = http.expectOne(`${environment.apiUrl}content/contact-message`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(message);
    req.flush({ message: 'message sent' });
  });
});
