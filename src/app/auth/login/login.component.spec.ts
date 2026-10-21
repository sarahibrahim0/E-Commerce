import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  it('logs in and navigates to the return URL', async () => {
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    localStorage.clear();
    sessionStorage.clear();
    const fixture = TestBed.createComponent(LoginComponent);
    const router = TestBed.inject(Router);
    const nav = spyOn(router, 'navigateByUrl').and.resolveTo(true);
    fixture.detectChanges();

    const email = fixture.nativeElement.querySelector('input[name="email"]');
    email.value = 'a@b.c';
    email.dispatchEvent(new Event('input'));
    const password = fixture.nativeElement.querySelector('input[name="password"]');
    password.value = 'secret';
    password.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));

    const http = TestBed.inject(HttpTestingController);
    const loginReq = http.expectOne(`${environment.apiUrl}users/login`);
    loginReq.flush({ user: 'a@b.c', token: 'tok', userId: 'u1' });
    const meReq = http.expectOne(`${environment.apiUrl}users/u1`);
    meReq.flush({
      id: 'u1', name: 'A', email: 'a@b.c', phone: '1', isAdmin: false,
      street: '', apartment: '', city: '', zip: '', country: '',
    });

    await fixture.whenStable();
    await new Promise((r) => setTimeout(r, 0));

    expect(nav).toHaveBeenCalledWith('/');
    http.expectOne(`${environment.apiUrl}wishlist`).flush([]);
    http.verify();
  });

  it('shows an error when login fails', async () => {
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    localStorage.clear();
    sessionStorage.clear();
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    const email = fixture.nativeElement.querySelector('input[name="email"]');
    email.value = 'a@b.c';
    email.dispatchEvent(new Event('input'));
    const password = fixture.nativeElement.querySelector('input[name="password"]');
    password.value = 'wrong';
    password.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));

    const http = TestBed.inject(HttpTestingController);
    http.expectOne(`${environment.apiUrl}users/login`)
      .flush({ message: 'password is wrong' }, { status: 402, statusText: 'Payment Required' });

    await fixture.whenStable();
    await new Promise((r) => setTimeout(r, 0));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('password is wrong');
    http.verify();
  });

  it('sends keepMeLoggedIn and persists the session when checked', async () => {
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    localStorage.clear();
    sessionStorage.clear();
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    const email = fixture.nativeElement.querySelector('input[name="email"]');
    email.value = 'saved@example.com';
    email.dispatchEvent(new Event('input'));
    const password = fixture.nativeElement.querySelector('input[name="password"]');
    password.value = 'saved-secret';
    password.dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('input[name="keepMeLoggedIn"]').click();
    fixture.detectChanges();

    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    const http = TestBed.inject(HttpTestingController);
    const loginReq = http.expectOne(`${environment.apiUrl}users/login`);
    expect(loginReq.request.body).toEqual({
      email: 'saved@example.com', password: 'saved-secret', keepMeLoggedIn: true,
    });
    loginReq.flush({ user: 'saved@example.com', token: 'tok', refreshToken: 'rt', userId: 'u1' });
    http.expectOne(`${environment.apiUrl}users/u1`).flush({
      id: 'u1', name: 'A', email: 'saved@example.com', phone: '1', isAdmin: false,
      street: '', apartment: '', city: '', zip: '', country: '',
    });

    await fixture.whenStable();
    expect(localStorage.getItem('ecom.token')).toBe('tok');
    expect(sessionStorage.getItem('ecom.token')).toBeNull();
    http.expectOne(`${environment.apiUrl}wishlist`).flush([]);
    http.verify();
  });

  it('keeps the session scoped to the tab when the option is unchecked', async () => {
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    localStorage.clear();
    sessionStorage.clear();
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    const email = fixture.nativeElement.querySelector('input[name="email"]');
    email.value = 'saved@example.com';
    email.dispatchEvent(new Event('input'));
    const password = fixture.nativeElement.querySelector('input[name="password"]');
    password.value = 'saved-secret';
    password.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    const http = TestBed.inject(HttpTestingController);
    const loginReq = http.expectOne(`${environment.apiUrl}users/login`);
    expect(loginReq.request.body).toEqual({
      email: 'saved@example.com', password: 'saved-secret', keepMeLoggedIn: false,
    });
    loginReq.flush({ user: 'saved@example.com', token: 'tok', refreshToken: 'rt', userId: 'u1' });
    http.expectOne(`${environment.apiUrl}users/u1`).flush({
      id: 'u1', name: 'A', email: 'saved@example.com', phone: '1', isAdmin: false,
      street: '', apartment: '', city: '', zip: '', country: '',
    });

    await fixture.whenStable();
    expect(sessionStorage.getItem('ecom.token')).toBe('tok');
    expect(localStorage.getItem('ecom.token')).toBeNull();
    http.expectOne(`${environment.apiUrl}wishlist`).flush([]);
    http.verify();
  });
});
