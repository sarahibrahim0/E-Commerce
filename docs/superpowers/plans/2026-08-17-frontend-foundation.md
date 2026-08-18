# Frontend Foundation — Admin Dashboard

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Fresh Angular 22 admin dashboard with auth (refresh token), layout, guards, and LTR/RTL support.

**Architecture:** Standalone components, signals, zoneless, PrimeNG + Tailwind v4. Follows same patterns as the storefront (ecommerce-v2).

**Tech Stack:** Angular 22.1+, PrimeNG 17+, Tailwind CSS v4, TypeScript 6, Jasmine + Karma

**Repo:** `D:\admin-dashboard-v2` (new project)

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Create | Entire project via `ng new` | Angular 22 scaffold |
| Create | `src/environments/environment.ts` | Production config |
| Create | `src/environments/environment.development.ts` | Dev config |
| Create | `src/app/core/models/index.ts` | Shared interfaces |
| Create | `src/app/core/services/api-error.ts` | Error normalization |
| Create | `src/app/core/services/auth.service.ts` | Auth API calls |
| Create | `src/app/core/stores/auth.store.ts` | Signal store with refresh |
| Create | `src/app/core/interceptors/auth.interceptor.ts` | JWT + refresh interceptor |
| Create | `src/app/core/guards/auth.guard.ts` | Auth guard |
| Create | `src/app/core/guards/admin.guard.ts` | Admin guard |
| Create | `src/app/core/guards/permission.guard.ts` | Permission guard |
| Create | `src/app/core/utils/storage.ts` | localStorage helpers |
| Create | `src/app/admin/layout/admin-shell.component.ts` | Admin layout wrapper |
| Create | `src/app/admin/layout/sidebar.component.ts` | Sidebar navigation |
| Create | `src/app/admin/layout/topbar.component.ts` | Top bar |
| Create | `src/app/admin/pages/dashboard/dashboard.component.ts` | Dashboard placeholder |
| Create | `src/app/admin/pages/login/login.component.ts` | Admin login |
| Create | `src/app/shared/dir-toggle/dir-toggle.component.ts` | LTR/RTL toggle |
| Modify | `src/app/app.config.ts` | Add providers |
| Modify | `src/app/app.routes.ts` | Admin routes |
| Modify | `src/styles.css` | Theme + RTL styles |
| Modify | `angular.json` | Add PrimeNG styles |
| Modify | `karma.conf.js` | Headless Chrome config |
| Test | `src/app/core/stores/auth.store.spec.ts` | Auth store tests |
| Test | `src/app/core/guards/auth.guard.spec.ts` | Auth guard tests |
| Test | `src/app/core/guards/admin.guard.spec.ts` | Admin guard tests |
| Test | `src/app/core/interceptors/auth.interceptor.spec.ts` | Interceptor tests |

---

## Task 1: Scaffold Angular 22 Project

**Files:**
- Create: Entire project via CLI

- [ ] **Step 1: Create new project**

```bash
cd D:\
ng new admin-dashboard-v2 --style css --routing --ssr false --skip-git false --package-manager npm
```

When prompted:
- CSS → Yes
- SSR → No
- Skip git → No (initialize git)

- [ ] **Step 2: Install dependencies**

```bash
cd D:\admin-dashboard-v2
npm install primeng primeicons @primeng/themes
npm install -D @tailwindcss/postcss tailwindcss
```

- [ ] **Step 3: Configure Tailwind**

Create `.postcssrc.json`:
```json
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```

- [ ] **Step 4: Configure Karma for headless**

Replace `karma.conf.js`:
```javascript
module.exports = function (config) {
  config.set({
    frameworks: ['jasmine'],
    plugins: ['karma-jasmine', 'karma-chrome-launcher', 'karma-jasmine-html-reporter'],
    browsers: ['ChromeHeadlessCustom'],
    customLaunchers: {
      ChromeHeadlessCustom: {
        base: 'ChromeHeadless',
        flags: ['--headless', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage'],
      },
    },
    reporters: ['progress', 'kjhtml'],
    singleRun: true,
  });
};
```

- [ ] **Step 5: Update angular.json for PrimeNG + dev environment**

Add to `styles` array in `architect.build.options`:
```json
"styles": [
  "node_modules/primeicons/primeicons.css",
  "src/styles.css"
]
```

Add `fileReplacements` to `development` config:
```json
"development": {
  "optimization": false,
  "extractLicenses": false,
  "sourceMap": true,
  "fileReplacements": [
    {
      "replace": "src/environments/environment.ts",
      "with": "src/environments/environment.development.ts"
    }
  ]
}
```

- [ ] **Step 6: Verify build and tests**

```bash
npx ng build --configuration development
npx ng test --watch=false
```

Expected: Build succeeds, 1 test passes (app component spec)

- [ ] **Step 7: Commit**

```bash
git add .
git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "feat: scaffold Angular 22 project with PrimeNG + Tailwind"
```

---

## Task 2: Environment Config + Models

**Files:**
- Create: `src/environments/environment.ts`
- Create: `src/environments/environment.development.ts`
- Create: `src/app/core/models/index.ts`
- Create: `src/app/core/utils/storage.ts`
- Create: `src/app/core/services/api-error.ts`

- [ ] **Step 1: Create environment files**

`src/environments/environment.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://dashboard-pnlv.onrender.com/api/v1/',
};
```

`src/environments/environment.development.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1/',
};
```

- [ ] **Step 2: Create models**

`src/app/core/models/index.ts`:
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  street?: string;
  apartment?: string;
  city?: string;
  zip?: string;
  country?: string;
  isAdmin: boolean;
  role?: Role;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  isDefault: boolean;
}

export interface LoginResponse {
  user: string;
  token: string;
  refreshToken: string;
  userId: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface ApiError {
  message: string;
  status: number;
}
```

- [ ] **Step 3: Create storage utils**

`src/app/core/utils/storage.ts`:
```typescript
export function getStorageKey(key: string): string | null {
  return localStorage.getItem(key);
}

export function setStorageKey(key: string, value: string): void {
  localStorage.setItem(key, value);
}

export function clearStorageKey(key: string): void {
  localStorage.removeItem(key);
}
```

- [ ] **Step 4: Create api-error utility**

`src/app/core/services/api-error.ts`:
```typescript
import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../models';

export function normalizeApiError(err: unknown): ApiError {
  if (err instanceof HttpErrorResponse) {
    const body = err.error;
    return {
      message: body?.message || body?.error || err.statusText || 'Request failed',
      status: err.status,
    };
  }
  return { message: 'An unexpected error occurred', status: 0 };
}
```

- [ ] **Step 5: Commit**

```bash
mkdir -p src/app/core/models src/app/core/utils src/app/core/services
git add src/environments/ src/app/core/
git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "feat: add environment config, models, storage utils, api-error"
```

---

## Task 3: Auth Service + Store (with Refresh Token)

**Files:**
- Create: `src/app/core/services/auth.service.ts`
- Create: `src/app/core/stores/auth.store.ts`
- Create: `src/app/core/stores/auth.store.spec.ts`

- [ ] **Step 1: Write the failing test**

`src/app/core/stores/auth.store.spec.ts`:
```typescript
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthStore } from './auth.store';
import { environment } from '../../../environments/environment';

describe('AuthStore', () => {
  let store: AuthStore;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(AuthStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('starts logged out when no token', () => {
    expect(store.isLoggedIn()).toBeFalse();
    expect(store.token()).toBeNull();
  });

  it('login stores token and user', async () => {
    const loginRes = { user: 'test@test.com', token: 'acc_123', refreshToken: 'ref_123', userId: 'u1' };
    const userRes = { id: 'u1', name: 'Test', email: 'test@test.com', isAdmin: true };

    const loginPromise = store.login('test@test.com', 'pass123');

    const loginReq = http.expectOne(`${environment.apiUrl}users/login`);
    loginReq.flush(loginRes);

    const meReq = http.expectOne(`${environment.apiUrl}users/u1`);
    meReq.flush(userRes);

    await loginPromise;

    expect(store.isLoggedIn()).toBeTrue();
    expect(store.token()).toBe('acc_123');
    expect(store.userId()).toBe('u1');
    expect(store.user()?.name).toBe('Test');
    expect(localStorage.getItem('ecom.token')).toBe('acc_123');
    expect(localStorage.getItem('ecom.refreshToken')).toBe('ref_123');
  });

  it('logout clears state', () => {
    localStorage.setItem('ecom.token', 'test');
    localStorage.setItem('ecom.userId', 'u1');
    localStorage.setItem('ecom.refreshToken', 'ref');

    store.logout();

    expect(store.isLoggedIn()).toBeFalse();
    expect(store.token()).toBeNull();
    expect(localStorage.getItem('ecom.token')).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx ng test --watch=false --include='**/auth.store.spec.ts'
```

Expected: FAIL

- [ ] **Step 3: Write auth service**

`src/app/core/services/auth.service.ts`:
```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginResponse, RegisterRequest, User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}users`;

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/login`, { email, password });
  }

  register(body: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.base}/register`, body);
  }

  me(id: string): Observable<User> {
    return this.http.get<User>(`${this.base}/${id}`);
  }

  refresh(refreshToken: string): Observable<{ accessToken: string; refreshToken: string }> {
    return this.http.post<{ accessToken: string; refreshToken: string }>(
      `${environment.apiUrl}auth/refresh`,
      { refreshToken },
    );
  }

  logout(refreshToken: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${environment.apiUrl}auth/logout`,
      { refreshToken },
    );
  }
}
```

- [ ] **Step 4: Write auth store**

`src/app/core/stores/auth.store.ts`:
```typescript
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { RegisterRequest, User } from '../models';
import { AuthService } from '../services/auth.service';
import { normalizeApiError } from '../services/api-error';
import { clearStorageKey, getStorageKey, setStorageKey } from '../utils/storage';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private auth = inject(AuthService);

  readonly token = signal<string | null>(getStorageKey('ecom.token'));
  readonly refreshToken = signal<string | null>(getStorageKey('ecom.refreshToken'));
  readonly userId = signal<string | null>(getStorageKey('ecom.userId'));
  readonly user = signal<User | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly isLoggedIn = computed(() => this.token() !== null);
  readonly isAdmin = computed(() => this.user()?.isAdmin === true);

  async login(email: string, password: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(
        this.auth.login(email, password).pipe(
          tap((res) => {
            this.token.set(res.token);
            this.refreshToken.set(res.refreshToken);
            this.userId.set(res.userId);
            setStorageKey('ecom.token', res.token);
            setStorageKey('ecom.refreshToken', res.refreshToken);
            setStorageKey('ecom.userId', res.userId);
          }),
          switchMap((res) => this.auth.me(res.userId)),
          tap((user) => this.user.set(user)),
        ),
      );
    } catch (err) {
      this.error.set(normalizeApiError(err).message);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async register(body: RegisterRequest): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(this.auth.register(body));
      await this.login(body.email, body.password);
    } catch (err) {
      this.error.set(normalizeApiError(err).message);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async refreshAccessToken(): Promise<boolean> {
    const rt = this.refreshToken();
    if (!rt) return false;
    try {
      const res = await firstValueFrom(this.auth.refresh(rt));
      this.token.set(res.accessToken);
      this.refreshToken.set(res.refreshToken);
      setStorageKey('ecom.token', res.accessToken);
      setStorageKey('ecom.refreshToken', res.refreshToken);
      return true;
    } catch {
      this.logout();
      return false;
    }
  }

  async loadUser(): Promise<void> {
    const id = this.userId();
    if (!id) return;
    try {
      this.user.set(await firstValueFrom(this.auth.me(id)));
    } catch {
      this.user.set(null);
    }
  }

  logout(): void {
    const rt = this.refreshToken();
    if (rt) {
      firstValueFrom(this.auth.logout(rt)).catch(() => {});
    }
    this.token.set(null);
    this.refreshToken.set(null);
    this.userId.set(null);
    this.user.set(null);
    this.error.set(null);
    clearStorageKey('ecom.token');
    clearStorageKey('ecom.refreshToken');
    clearStorageKey('ecom.userId');
  }
}
```

- [ ] **Step 5: Run tests**

```bash
npx ng test --watch=false --include='**/auth.store.spec.ts'
```

Expected: 3 tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/app/core/services/auth.service.ts src/app/core/stores/
git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "feat: add auth service and store with refresh token support"
```

---

## Task 4: Auth Interceptor (with Refresh)

**Files:**
- Create: `src/app/core/interceptors/auth.interceptor.ts`
- Create: `src/app/core/interceptors/auth.interceptor.spec.ts`

- [ ] **Step 1: Write the failing test**

`src/app/core/interceptors/auth.interceptor.spec.ts`:
```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpInterceptorFn, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let mock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    mock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    mock.verify();
    localStorage.clear();
  });

  it('adds Authorization header when token exists', () => {
    localStorage.setItem('ecom.token', 'test_token');
    http.get('/api/test').subscribe();
    const req = mock.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test_token');
    req.flush({});
  });

  it('does not add Authorization header when no token', () => {
    http.get('/api/test').subscribe();
    const req = mock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx ng test --watch=false --include='**/auth.interceptor.spec.ts'
```

Expected: FAIL

- [ ] **Step 3: Write interceptor**

`src/app/core/interceptors/auth.interceptor.ts`:
```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthStore } from '../stores/auth.store';
import { normalizeApiError } from '../services/api-error';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthStore);
  const token = auth.token();
  const request = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(
    catchError((err) => {
      if (err.status === 401 && !req.url.includes('/auth/refresh') && !isRefreshing) {
        isRefreshing = true;
        return auth.refreshAccessToken().then((success) => {
          isRefreshing = false;
          if (success) {
            const newToken = auth.token();
            const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
            return next(retryReq).toPromise();
          }
          return throwError(() => normalizeApiError(err));
        });
      }
      return throwError(() => normalizeApiError(err));
    }),
  );
};
```

- [ ] **Step 4: Run tests**

```bash
npx ng test --watch=false --include='**/auth.interceptor.spec.ts'
```

Expected: 2 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/core/interceptors/
git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "feat: add auth interceptor with refresh token retry"
```

---

## Task 5: Guards (Auth, Admin, Permission)

**Files:**
- Create: `src/app/core/guards/auth.guard.ts`
- Create: `src/app/core/guards/admin.guard.ts`
- Create: `src/app/core/guards/permission.guard.ts`
- Create: `src/app/core/guards/auth.guard.spec.ts`
- Create: `src/app/core/guards/admin.guard.spec.ts`

- [ ] **Step 1: Write the failing tests**

`src/app/core/guards/auth.guard.spec.ts`:
```typescript
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthStore } from '../stores/auth.store';

describe('authGuard', () => {
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'login', children: [] },
          { path: 'admin', canActivate: [authGuard], children: [] },
        ]),
      ],
    });
    router = TestBed.inject(Router);
  });

  it('redirects to /login when not logged in', async () => {
    const result = await TestBed.runInInjectionContext(() =>
      authGuard({} as any, {} as any),
    );
    expect(result).toEqual(router.createUrlTree(['/login']));
  });

  it('allows access when logged in', async () => {
    localStorage.setItem('ecom.token', 'test');
    const auth = TestBed.inject(AuthStore);
    // Token is read from localStorage in constructor
    const result = await TestBed.runInInjectionContext(() =>
      authGuard({} as any, {} as any),
    );
    expect(result).toBeTrue();
  });
});
```

`src/app/core/guards/admin.guard.spec.ts`:
```typescript
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { adminGuard } from './admin.guard';
import { AuthStore } from '../stores/auth.store';

describe('adminGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'login', children: [] },
          { path: 'admin', canActivate: [adminGuard], children: [] },
        ]),
      ],
    });
  });

  it('redirects to /login when not logged in', async () => {
    const router = TestBed.inject(Router);
    const result = await TestBed.runInInjectionContext(() =>
      adminGuard({} as any, {} as any),
    );
    expect(result).toEqual(router.createUrlTree(['/login']));
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx ng test --watch=false --include='**/guards/*.spec.ts'
```

Expected: FAIL

- [ ] **Step 3: Write guards**

`src/app/core/guards/auth.guard.ts`:
```typescript
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../stores/auth.store';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  return auth.isLoggedIn() ? true : router.createUrlTree(['/login']);
};
```

`src/app/core/guards/admin.guard.ts`:
```typescript
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../stores/auth.store';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  if (!auth.isLoggedIn()) return router.createUrlTree(['/login']);
  if (!auth.isAdmin()) return router.createUrlTree(['/']);
  return true;
};
```

`src/app/core/guards/permission.guard.ts`:
```typescript
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../stores/auth.store';

export const permissionGuard: CanActivateFn = (route) => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  if (!auth.isLoggedIn()) return router.createUrlTree(['/login']);
  if (auth.isAdmin()) return true;
  const requiredPermission = route.data?.['permission'] as string;
  if (!requiredPermission) return true;
  const userPermissions = auth.user()?.role?.permissions || [];
  return userPermissions.includes(requiredPermission) ? true : router.createUrlTree(['/admin']);
};
```

- [ ] **Step 4: Run tests**

```bash
npx ng test --watch=false --include='**/guards/*.spec.ts'
```

Expected: Tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/core/guards/
git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "feat: add auth, admin, and permission guards"
```

---

## Task 6: Admin Layout (Shell + Sidebar + Topbar)

**Files:**
- Create: `src/app/admin/layout/admin-shell.component.ts`
- Create: `src/app/admin/layout/sidebar.component.ts`
- Create: `src/app/admin/layout/topbar.component.ts`

- [ ] **Step 1: Create admin shell**

`src/app/admin/layout/admin-shell.component.ts`:
```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { TopbarComponent } from './topbar.component';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="flex h-screen bg-slate-50">
      <app-sidebar (collapsed)="collapsed = $event" />
      <div class="flex flex-1 flex-col overflow-hidden" [class.ms-16]="collapsed" [class.ms-64]="!collapsed">
        <app-topbar />
        <main class="flex-1 overflow-y-auto p-6">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class AdminShellComponent {
  collapsed = false;
}
```

- [ ] **Step 2: Create sidebar**

`src/app/admin/layout/sidebar.component.ts`:
```typescript
import { Component, EventEmitter, Output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

interface SidebarItem {
  label: string;
  icon: string;
  route: string;
  permission?: string;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <aside
      class="fixed inset-y-0 left-0 z-30 flex flex-col border-e border-slate-200 bg-white transition-all duration-300"
      [class.w-64]="!isCollapsed()"
      [class.w-16]="isCollapsed()">
      <div class="flex h-16 items-center justify-center border-b border-slate-200">
        <span class="text-lg font-bold text-indigo-600" [class.hidden]="isCollapsed()">Admin</span>
        <span class="text-lg font-bold text-indigo-600" [class.hidden]="!isCollapsed()">A</span>
      </div>
      <nav class="flex-1 overflow-y-auto p-3">
        @for (section of sections; track section.title) {
          <div class="mb-4">
            <h3 class="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400" [class.hidden]="isCollapsed()">
              {{ section.title }}
            </h3>
            @for (item of section.items; track item.route) {
              <a
                [routerLink]="item.route"
                routerLinkActive="bg-indigo-50 text-indigo-600"
                class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
                <i [class]="item.icon + ' text-lg'"></i>
                <span [class.hidden]="isCollapsed()">{{ item.label }}</span>
              </a>
            }
          </div>
        }
      </nav>
      <button
        (click)="toggle()"
        class="flex h-12 items-center justify-center border-t border-slate-200 text-slate-400 hover:bg-slate-50">
        <i class="pi" [class.pi-arrow-right]="isCollapsed()" [class.pi-arrow-left]="!isCollapsed()"></i>
      </button>
    </aside>
  `,
})
export class SidebarComponent {
  @Output() collapsed = new EventEmitter<boolean>();

  isCollapsed = signal(false);

  sections: SidebarSection[] = [
    {
      title: 'Dashboard',
      items: [{ label: 'Overview', icon: 'pi pi-chart-bar', route: '/admin/dashboard' }],
    },
    {
      title: 'Content',
      items: [
        { label: 'Products', icon: 'pi pi-box', route: '/admin/products' },
        { label: 'Categories', icon: 'pi pi-tags', route: '/admin/categories' },
        { label: 'Content', icon: 'pi pi-file-edit', route: '/admin/content' },
        { label: 'Coupons', icon: 'pi pi-ticket', route: '/admin/coupons' },
      ],
    },
    {
      title: 'Commerce',
      items: [
        { label: 'Orders', icon: 'pi pi-shopping-cart', route: '/admin/orders' },
        { label: 'Reviews', icon: 'pi pi-star', route: '/admin/reviews' },
      ],
    },
    {
      title: 'People',
      items: [
        { label: 'Users', icon: 'pi pi-users', route: '/admin/users' },
        { label: 'Roles', icon: 'pi pi-shield', route: '/admin/roles' },
      ],
    },
  ];

  toggle(): void {
    this.isCollapsed.update((v) => !v);
    this.collapsed.emit(this.isCollapsed());
  }
}
```

- [ ] **Step 3: Create topbar**

`src/app/admin/layout/topbar.component.ts`:
```typescript
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '../../core/stores/auth.store';

@Component({
  selector: 'app-topbar',
  standalone: true,
  template: `
    <header class="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div class="flex items-center gap-4">
        <h1 class="text-lg font-semibold text-slate-900">Dashboard</h1>
      </div>
      <div class="flex items-center gap-4">
        <span class="text-sm text-slate-600">{{ auth.user()?.name || 'Admin' }}</span>
        <button
          (click)="logout()"
          class="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100">
          Logout
        </button>
      </div>
    </header>
  `,
})
export class TopbarComponent {
  protected readonly auth = inject(AuthStore);
  private router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
```

- [ ] **Step 4: Create dashboard placeholder**

`src/app/admin/pages/dashboard/dashboard.component.ts`:
```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div>
      <h2 class="text-2xl font-bold text-slate-900">Dashboard</h2>
      <p class="mt-2 text-slate-600">Welcome to the admin dashboard.</p>
    </div>
  `,
})
export class DashboardComponent {}
```

- [ ] **Step 5: Create login page**

`src/app/admin/pages/login/login.component.ts`:
```typescript
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStore } from '../../../core/stores/auth.store';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-slate-50">
      <div class="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h1 class="text-2xl font-bold text-slate-900">Admin Login</h1>
        <p class="mt-1 text-sm text-slate-500">Sign in to the admin dashboard</p>

        @if (auth.error()) {
          <p class="mt-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700">{{ auth.error() }}</p>
        }

        <form (ngSubmit)="submit()" class="mt-6 space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-slate-700">Email</label>
            <input
              id="email"
              type="email"
              [(ngModel)]="email"
              name="email"
              class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-slate-700">Password</label>
            <input
              id="password"
              type="password"
              [(ngModel)]="password"
              name="password"
              class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
          </div>
          <button
            type="submit"
            [disabled]="auth.loading()"
            class="w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
            {{ auth.loading() ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent {
  protected readonly auth = inject(AuthStore);
  private router = inject(Router);
  email = '';
  password = '';

  async submit(): Promise<void> {
    try {
      await this.auth.login(this.email, this.password);
      this.router.navigate(['/admin/dashboard']);
    } catch {}
  }
}
```

- [ ] **Step 6: Verify build**

```bash
npx ng build --configuration development
```

Expected: Build succeeds

- [ ] **Step 7: Commit**

```bash
git add src/app/admin/
git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "feat: add admin layout (shell, sidebar, topbar), dashboard, login"
```

---

## Task 7: App Config + Routes + i18n

**Files:**
- Modify: `src/app/app.config.ts`
- Modify: `src/app/app.routes.ts`
- Modify: `src/styles.css`
- Create: `src/app/shared/dir-toggle/dir-toggle.component.ts`

- [ ] **Step 1: Update app.config.ts**

```typescript
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
```

- [ ] **Step 2: Update app.routes.ts**

```typescript
import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./admin/pages/login/login.component').then((m) => m.LoginComponent) },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./admin/layout/admin-shell.component').then((m) => m.AdminShellComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./admin/pages/dashboard/dashboard.component').then((m) => m.DashboardComponent) },
    ],
  },
  { path: '**', redirectTo: 'admin' },
];
```

- [ ] **Step 3: Update styles.css**

```css
@import 'tailwindcss';

:root {
  --sidebar-width: 260px;
  --sidebar-collapsed: 64px;
  --topbar-height: 64px;
  --primary: #4f46e5;
  --primary-hover: #4338ca;
}

:focus-visible {
  outline: 2px solid #4f46e5;
  outline-offset: 2px;
}

[dir="rtl"] {
  direction: rtl;
}
```

- [ ] **Step 4: Update main.ts bootstrap class**

Change `App` to `AppComponent` in `src/main.ts` (or update the component selector).

- [ ] **Step 5: Verify build + tests**

```bash
npx ng build --configuration development
npx ng test --watch=false
```

Expected: Build succeeds, all tests pass

- [ ] **Step 6: Commit**

```bash
git add src/app/app.config.ts src/app/app.routes.ts src/styles.css src/main.ts
git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "feat: configure app routes, providers, and global styles"
```

---

## Task 8: Final Verification

- [ ] **Step 1: Run full build**

```bash
npx ng build --configuration production
```

Expected: Build succeeds with no errors

- [ ] **Step 2: Run all tests**

```bash
npx ng test --watch=false
```

Expected: All tests PASS

- [ ] **Step 3: Verify dev server starts**

```bash
npx ng serve
```

Expected: Server starts on localhost:4200, login page loads

- [ ] **Step 4: Final commit if needed**

```bash
git add .
git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "chore: final verification and cleanup"
```
