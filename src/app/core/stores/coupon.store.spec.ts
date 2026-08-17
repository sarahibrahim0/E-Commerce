import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { CouponStore } from './coupon.store';
import { Coupon } from '../models';

const coupon = (overrides: Partial<Coupon> = {}): Coupon => ({
  id: 'c1', code: 'SAVE10', type: 'percent', value: 10, maxUses: 100, usedCount: 0,
  active: true, ...overrides,
});

describe('CouponStore', () => {
  let store: CouponStore;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(CouponStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('validates a code and stores the applied coupon', async () => {
    const p = store.validate('save10');
    const req = http.expectOne(`${environment.apiUrl}coupons/validate`);
    expect(req.request.body).toEqual({ code: 'save10' });
    req.flush(coupon());
    expect(await p).toBe(true);
    expect(store.applied()?.code).toBe('SAVE10');
  });

  it('rejects an invalid coupon and clears applied state', async () => {
    store.applied.set(coupon());
    const p = store.validate('BOGUS');
    http.expectOne(`${environment.apiUrl}coupons/validate`)
      .flush({ message: 'coupon not found' }, { status: 404, statusText: 'Not Found' });
    expect(await p).toBe(false);
    expect(store.applied()).toBeNull();
    expect(store.error()).toBe('coupon not found');
  });

  it('computes percent discount for a subtotal', () => {
    store.applied.set(coupon());
    expect(store.discountFor(2000)).toBe(200);
  });

  it('computes fixed discount capped at subtotal', () => {
    store.applied.set(coupon({ type: 'fixed', value: 500 }));
    expect(store.discountFor(1000)).toBe(500);
    expect(store.discountFor(300)).toBe(300);
  });

  it('clears the applied coupon', () => {
    store.applied.set(coupon());
    store.clear();
    expect(store.applied()).toBeNull();
    expect(store.code()).toBe('');
  });
});
