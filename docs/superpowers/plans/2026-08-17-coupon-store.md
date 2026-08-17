# Coupon Store Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a coupon store with validation, discount computation, and clearing, using TDD.

**Architecture:** A signal-based Angular store (`CouponStore`) that wraps `CouponsService.validate()` with state management (applied coupon, error, validating flag) and pure discount calculation logic.

**Tech Stack:** Angular 22, zoneless signals, standalone, Jasmine/Karma tests, HttpClientTestingModule.

---

### Task 1: Write failing test

**Files:**
- Create: `src/app/core/stores/coupon.store.spec.ts`

- [ ] **Step 1: Write the failing test file**

```ts
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
```

- [ ] **Step 2: Run to verify FAIL**

Run: `npx ng test --watch=false --include='**/coupon.store.spec.ts'`
Expected: FAIL — `CouponStore` does not exist yet.

---

### Task 2: Implement coupon store

**Files:**
- Create: `src/app/core/stores/coupon.store.ts`

- [ ] **Step 1: Write the implementation**

```ts
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Coupon } from '../models';
import { CouponsService } from '../services/coupons.service';
import { normalizeApiError } from '../services/api-error';

@Injectable({ providedIn: 'root' })
export class CouponStore {
  private api = inject(CouponsService);

  readonly code = signal('');
  readonly applied = signal<Coupon | null>(null);
  readonly validating = signal(false);
  readonly error = signal<string | null>(null);

  async validate(code: string): Promise<boolean> {
    this.validating.set(true);
    this.error.set(null);
    try {
      const coupon = await firstValueFrom(this.api.validate(code));
      this.applied.set(coupon);
      this.code.set(coupon.code);
      return true;
    } catch (err) {
      this.applied.set(null);
      this.error.set(normalizeApiError(err).message);
      return false;
    } finally {
      this.validating.set(false);
    }
  }

  discountFor(subtotal: number): number {
    const coupon = this.applied();
    if (!coupon) return 0;
    if (coupon.type === 'percent') {
      return Math.round(subtotal * (coupon.value / 100));
    }
    return Math.min(coupon.value, subtotal);
  }

  clear(): void {
    this.applied.set(null);
    this.code.set('');
    this.error.set(null);
  }
}
```

- [ ] **Step 2: Run to verify PASS**

Run: `npx ng test --watch=false --include='**/coupon.store.spec.ts'`
Expected: 5 tests PASS.

---

### Task 3: Full suite + build verification

- [ ] **Step 1: Run full test suite**

Run: `npx ng test --watch=false`
Expected: All tests green.

- [ ] **Step 2: Run production build**

Run: `npx ng build`
Expected: Clean build, no errors.

---

### Task 4: Commit

- [ ] **Step 1: Stage and commit**

```bash
git add src/app/core/stores/coupon.store.ts src/app/core/stores/coupon.store.spec.ts
git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "feat: add coupon store with tests"
```
