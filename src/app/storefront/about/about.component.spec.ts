import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AboutComponent } from './about.component';

describe('AboutComponent', () => {
  it('renders content from the API', () => {
    TestBed.configureTestingModule({
      imports: [AboutComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    const fixture = TestBed.createComponent(AboutComponent);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    const req = http.expectOne(`${environment.apiUrl}content/about`);
    req.flush({ id: 'c1', key: 'about', title: 'About us', subtitle: 'Hi', sections: [{ heading: 'Story', body: 'Text' }] });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('About us');
    expect(fixture.nativeElement.textContent).toContain('Story');
    http.verify();
  });
});
