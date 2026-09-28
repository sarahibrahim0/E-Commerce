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

  it('restores remembered credentials and saves them after login', async () => {
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    localStorage.setItem('ecom.rememberedCredentials', JSON.stringify({ email: 'saved@example.com', password: 'saved-secret' }));
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('input[name="email"]').value).toBe('saved@example.com');
    expect(fixture.nativeElement.querySelector('input[name="password"]').value).toBe('saved-secret');
    expect(fixture.nativeElement.querySelector('input[name="rememberPassword"]').checked).toBeTrue();

    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(`${environment.apiUrl}users/login`).flush({ user: 'saved@example.com', token: 'tok', userId: 'u1' });
    http.expectOne(`${environment.apiUrl}users/u1`).flush({
      id: 'u1', name: 'A', email: 'saved@example.com', phone: '1', isAdmin: false,
      street: '', apartment: '', city: '', zip: '', country: '',
    });

    await fixture.whenStable();
    expect(JSON.parse(localStorage.getItem('ecom.rememberedCredentials')!)).toEqual({
      email: 'saved@example.com', password: 'saved-secret',
    });
    http.expectOne(`${environment.apiUrl}wishlist`).flush([]);
    http.verify();
  });

  it('removes remembered credentials when the option is unchecked', async () => {
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    localStorage.setItem('ecom.rememberedCredentials', JSON.stringify({ email: 'saved@example.com', password: 'saved-secret' }));
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('input[name="rememberPassword"]').click();
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(`${environment.apiUrl}users/login`).flush({ user: 'saved@example.com', token: 'tok', userId: 'u1' });
    http.expectOne(`${environment.apiUrl}users/u1`).flush({
      id: 'u1', name: 'A', email: 'saved@example.com', phone: '1', isAdmin: false,
      street: '', apartment: '', city: '', zip: '', country: '',
    });

    await fixture.whenStable();
    expect(localStorage.getItem('ecom.rememberedCredentials')).toBeNull();
    http.expectOne(`${environment.apiUrl}wishlist`).flush([]);
    http.verify();
  });
});
