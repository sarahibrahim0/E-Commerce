import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthStore } from './auth.store';

describe('AuthStore', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    localStorage.clear();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('starts logged out', () => {
    const store = TestBed.inject(AuthStore);
    expect(store.isLoggedIn()).toBe(false);
  });

  it('logs in, stores token/userId, and loads the user', async () => {
    const store = TestBed.inject(AuthStore);
    const loginPromise = store.login('a@b.c', 'secret');
    const loginReq = http.expectOne(`${environment.apiUrl}users/login`);
    expect(loginReq.request.method).toBe('POST');
    loginReq.flush({ user: 'a@b.c', token: 'tok-1', refreshToken: 'rt-1', userId: 'u1' });

    await Promise.resolve();
    await Promise.resolve();

    const meReq = http.expectOne(`${environment.apiUrl}users/u1`);
    meReq.flush({
      id: 'u1', name: 'A', email: 'a@b.c', phone: '123', isAdmin: false,
      street: '', apartment: '', city: '', zip: '', country: '',
    });

    await loginPromise;

    http.expectOne(`${environment.apiUrl}wishlist`).flush([]);

    expect(store.isLoggedIn()).toBe(true);
    expect(store.token()).toBe('tok-1');
    expect(store.userId()).toBe('u1');
    expect(store.user()?.name).toBe('A');
    expect(localStorage.getItem('ecom.token')).toBe('tok-1');
    expect(localStorage.getItem('ecom.userId')).toBe('u1');
  });

  it('restores session from localStorage', () => {
    localStorage.setItem('ecom.token', 'stored-token');
    localStorage.setItem('ecom.userId', 'u9');
    const restored = TestBed.inject(AuthStore);
    expect(restored.isLoggedIn()).toBe(true);
    expect(restored.token()).toBe('stored-token');
    expect(restored.userId()).toBe('u9');
  });

  it('logs out and clears state', () => {
    localStorage.setItem('ecom.token', 't');
    localStorage.setItem('ecom.userId', 'u');
    const fresh = TestBed.inject(AuthStore);
    fresh.logout();
    expect(fresh.isLoggedIn()).toBe(false);
    expect(localStorage.getItem('ecom.token')).toBeNull();
    expect(localStorage.getItem('ecom.userId')).toBeNull();
  });

  it('surfaces a normalized login error', async () => {
    const store = TestBed.inject(AuthStore);
    const loginPromise = store.login('a@b.c', 'wrong');
    const loginReq = http.expectOne(`${environment.apiUrl}users/login`);
    loginReq.flush({ message: 'password is wrong' }, { status: 402, statusText: 'Payment Required' });

    await expectAsync(loginPromise).toBeRejected();
    expect(store.error()).toBe('password is wrong');
    expect(store.isLoggedIn()).toBe(false);
  });
});
