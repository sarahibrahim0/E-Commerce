# Storefront Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin the order-details, products, categories pages and the header search to match the app's established design language (cream hero bands, overline labels, white `rounded-2xl` cards, salmon/blue-black buttons) without changing any behavior.

**Architecture:** Four independent HTML-dominant reskins, one per task. Shared design tokens (exact Tailwind classes) are in the spec: `docs/superpowers/specs/2026-08-30-storefront-redesign-design.md`. Only one small TS method is added (`clearFilters()` in product-list); all store/service/auth logic stays untouched. Every task is verified with `tsc` + the existing Karma regression suite.

**Tech Stack:** Angular 22 standalone components, signal stores, Tailwind CSS, Bootstrap Icons, Jasmine/Karma tests.

---

> **Testing note:** These tasks are DOM/visual reskins with no new business logic, so there are no meaningful new unit tests to write first (the one added method, `clearFilters()`, is a thin signal-reset wrapper over already-tested store signals). Verification for each task is: (1) `tsc` passes, (2) Karma regression suite shows no new failures beyond the 7 pre-existing ones (4 HeaderComponent, 1 Login, 1 AuthStore, 1 authInterceptor), (3) manual visual check in the running dev server. Follow the exact templates below.

**Reference (design tokens) — from existing pages:**
- Hero band: `relative overflow-hidden rounded-2xl bg-[#ecd7cd] px-6 py-14 text-center md:px-12 md:py-16` + two blobs: `<span class="pointer-events-none absolute -right-10 -top-14 h-48 w-48 rounded-full bg-white/40"></span>` and `<span class="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-salmon/20"></span>`
- Overline: `text-xs font-semibold uppercase tracking-[0.2em] text-salmon`
- Card: `rounded-2xl border border-[#F6F8FE] bg-white p-6`
- Icon tile: `flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ecd7cd]/50 text-salmon`
- Field: `w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm outline-none focus:border-salmon`

---

### Task 1: Redesign order details page

**Files:**
- Modify: `src/app/profile/order-details/order-details.component.html` (full replace)
- Do NOT modify: `src/app/profile/order-details/order-details.component.ts` (logic stays: `shortId`, `statusPill`, `paymentPill`, `stepIndex`, `cancel`, `buyAgain`, `steps`, `isCancelled`)

- [ ] **Step 1: Read the current template**

Read `src/app/profile/order-details/order-details.component.html` to confirm its current state (it must match the file described in the spec).

- [ ] **Step 2: Replace the template with the redesigned markup**

Overwrite the entire file with:

```html
<div class="mx-auto max-w-5xl">
  @if (orders.loading()) {
    <div class="animate-pulse" role="status" aria-label="Loading">
      <div class="h-44 rounded-xl bg-[#ecd7cd]"></div>
      <div class="mt-6 h-28 rounded-xl bg-[#ecd7cd]"></div>
      <div class="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <div class="h-72 rounded-xl bg-[#ecd7cd]"></div>
        <div class="h-56 rounded-xl bg-[#ecd7cd]"></div>
      </div>
    </div>
  } @else if (orders.error(); as err) {
    <p class="rounded-md bg-[#fff5f5] p-3 text-sm text-[#ff4545]">{{ err }}</p>
  } @else if (orders.current(); as order) {
    <section class="relative overflow-hidden rounded-2xl bg-[#ecd7cd] px-6 py-14 text-center md:px-12 md:py-16">
      <span class="pointer-events-none absolute -right-10 -top-14 h-48 w-48 rounded-full bg-white/40"></span>
      <span class="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-salmon/20"></span>
      <p class="relative text-xs font-semibold uppercase tracking-[0.2em] text-salmon">Order details</p>
      <h1 class="relative mt-3 text-3xl font-bold text-blue-black md:text-4xl">Order #{{ shortId(order.id) }}</h1>
      <p class="relative mt-2 text-sm text-[#646D77]">Placed {{ order.dateOrdered | date: 'medium' }}</p>
      <div class="relative mt-4 flex flex-wrap items-center justify-center gap-2">
        <span class="rounded-full bg-white px-4 py-1.5 text-xs font-medium {{ statusPill(order.status) }}">{{ order.status }}</span>
        <span class="rounded-full bg-white px-4 py-1.5 text-xs font-medium capitalize {{ paymentPill(order.paymentStatus) }}">{{ order.paymentStatus }}</span>
      </div>
      <div class="relative mt-6 flex flex-wrap justify-center gap-2">
        <button type="button" class="inline-flex items-center gap-2 rounded-none uppercase tracking-wider bg-blue-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-black" (click)="buyAgain(order)">
          <i class="bi bi-arrow-repeat"></i> Buy again
        </button>
        @if (!isCancelled(order) && order.status !== 'Delivered') {
          <button type="button" class="rounded-md border border-[#ffc9c9] bg-white px-4 py-2.5 text-sm font-medium text-[#ff4545] hover:bg-[#fff5f5]" (click)="cancel()">Cancel order</button>
        }
      </div>
    </section>

    @if (isCancelled(order)) {
      <section class="mt-6 rounded-2xl border border-[#ffe1de] bg-[#fff7f6] p-5">
        <div class="flex items-center gap-4">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-lg text-[#ff4545]">
            <i class="bi bi-x-lg"></i>
          </span>
          <div>
            <h2 class="text-sm font-semibold text-[#c0392b]">This order was cancelled</h2>
            <p class="mt-0.5 text-sm text-[#646D77]">
              No further updates are expected
              @if (order.paymentStatus === 'refunded') {
                &mdash; your payment has been refunded.
              } @else {
                .
              }
            </p>
          </div>
        </div>
      </section>
    } @else {
      <section class="mt-6 rounded-2xl border border-[#F6F8FE] bg-white p-6">
        <h2 class="text-xs font-semibold uppercase tracking-wide text-[#797979]">Order status</h2>
        <ol class="mt-5 flex items-center">
          @for (step of steps; track step; let i = $index) {
            @if (i > 0) {
              <span class="mx-2 h-px {{ i <= stepIndex(order.status) ? 'bg-salmon' : 'bg-[#e8e6e3]' }} {{ $last ? 'w-8' : 'flex-1' }}"></span>
            }
            <li class="flex flex-col items-center text-center">
              <span class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium
                {{ i < stepIndex(order.status) ? 'bg-salmon text-white'
                   : i === stepIndex(order.status) ? 'border-2 border-salmon text-salmon'
                   : 'bg-[#f3f1ee] text-[#c9c9c9]' }}">
                @if (i < stepIndex(order.status)) {
                  <i class="bi bi-check-lg text-xs"></i>
                } @else {
                  {{ i + 1 }}
                }
              </span>
              <span class="mt-2 text-xs {{ i <= stepIndex(order.status) ? 'font-medium text-blue-black' : 'text-[#c9c9c9]' }}">{{ step }}</span>
            </li>
          }
        </ol>
      </section>
    }

    <div class="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_320px]">
      <section class="rounded-2xl border border-[#F6F8FE] bg-white p-6">
        <h2 class="text-xs font-semibold uppercase tracking-wide text-[#797979]">Items ({{ order.orderItems.length }})</h2>
        <div class="mt-4 space-y-4">
          @for (item of order.orderItems; track item.id) {
            <div class="flex items-center gap-4">
              @if (item.product.image) {
                <img [src]="item.product.image.url" [alt]="item.product.name" class="h-20 w-20 shrink-0 rounded-lg object-cover" />
              }
              <div class="min-w-0 flex-1">
                <a routerLink="/product/{{ item.product.id }}" class="font-medium text-blue-black hover:text-salmon">{{ item.product.name }}</a>
                <p class="mt-1 text-sm text-[#797979]">
                  {{ formatPrice(item.product.price) }} <span class="text-[#c9c9c9]">&times;</span> {{ item.quantity }}
                </p>
              </div>
              <p class="font-semibold text-dark-purple">{{ formatPrice(item.product.price * item.quantity) }}</p>
            </div>
          }
        </div>
      </section>

      <aside class="rounded-2xl border border-[#F6F8FE] bg-white p-6">
        <h2 class="text-xs font-semibold uppercase tracking-wide text-[#797979]">Summary</h2>
        <dl class="mt-4 space-y-2 text-sm">
          <div class="flex justify-between">
            <dt class="text-[#797979]">Subtotal</dt>
            <dd class="text-dark-purple">{{ formatPrice(order.totalPrice + order.discount) }}</dd>
          </div>
          @if (order.discount > 0) {
            <div class="flex justify-between">
              <dt class="text-[#797979]">Discount</dt>
              <dd class="text-emerald-600">&minus; {{ formatPrice(order.discount) }}</dd>
            </div>
          }
          <div class="flex justify-between pt-3 font-semibold">
            <dt class="text-blue-black">Total</dt>
            <dd class="text-dark-purple">{{ formatPrice(order.totalPrice) }}</dd>
          </div>
        </dl>

        <div class="mt-5 border-t border-[#F6F8FE] pt-5">
          <div class="flex items-start gap-3">
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ecd7cd]/50 text-salmon"><i class="bi bi-geo-alt"></i></span>
            <div class="min-w-0 text-sm">
              <span class="block text-xs font-semibold uppercase tracking-wide text-[#797979]">Ship to</span>
              <span class="mt-1 block leading-relaxed text-[#646D77]">
                {{ order.shippingAddress1 }}{{ order.shippingAddress2 ? ', ' + order.shippingAddress2 : '' }}<br />
                {{ order.city }}, {{ order.country }}<br />
                {{ order.phone }}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <section class="mt-8 rounded-2xl border border-[#F6F8FE] bg-white p-8 text-center">
      <h2 class="text-2xl font-bold text-blue-black">Need help with this order?</h2>
      <p class="mx-auto mt-2 max-w-md text-[#646D77]">Our team is happy to answer any questions about delivery, returns, or payments.</p>
      <a routerLink="/contact" class="mt-5 inline-flex items-center gap-2 rounded-none uppercase tracking-wider bg-salmon px-6 py-3 text-sm font-medium text-white transition hover:bg-[#e9855a]">
        Contact us
      </a>
    </section>
  }
</div>
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit --project tsconfig.app.json` (in `D:\E-Commerce\E-Commerce\ecommerce-v2`)
Expected: no output (clean). The existing imports (`RouterLink`, `DatePipe`) already cover the new markup — no import changes needed.

- [ ] **Step 4: Run the regression suite**

Run: `npx ng test --watch=false --browsers=ChromeHeadless`
Expected: 61 total, FAILED count ≤ 7 (all in HeaderComponent/Login/AuthStore/authInterceptor specs), no other failures. If the failure count rises above 7 or a non-preexisting spec fails, fix before continuing.

- [ ] **Step 5: Commit**

```bash
git add src/app/profile/order-details/order-details.component.html
git commit -m "redesign: hero band, tracker, items/summary cards and CTA on order details"
```

---

### Task 2: Redesign products page

**Files:**
- Modify: `src/app/storefront/product-list/product-list.component.html` (full replace)
- Modify: `src/app/storefront/product-list/product-list.component.ts` (add `clearFilters()`)
- Do NOT modify: `src/app/core/stores/catalog.store.ts`

- [ ] **Step 1: Read the current files**

Read `src/app/storefront/product-list/product-list.component.html` and `.ts` to confirm current state.

- [ ] **Step 2: Add `clearFilters()` to the component class**

In `product-list.component.ts`, add below the existing `applyFilters()` method (after line 94):

```ts
  clearFilters(): void {
    this.catalog.categoryId.set(null);
    this.catalog.search.set('');
    this.catalog.minPrice.set(null);
    this.catalog.maxPrice.set(null);
    this.catalog.color.set(null);
    this.catalog.sort.set('newest');
    this.catalog.page.set(1);
    void this.syncUrl();
  }
```

- [ ] **Step 3: Replace the template with the redesigned markup**

Overwrite the entire `product-list.component.html` with:

```html
<div class="mx-auto max-w-7xl px-4 py-8">
  <section class="relative overflow-hidden rounded-2xl bg-[#ecd7cd] px-6 py-12 text-center md:px-12">
    <span class="pointer-events-none absolute -right-10 -top-14 h-48 w-48 rounded-full bg-white/40"></span>
    <span class="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-salmon/20"></span>
    <p class="relative text-xs font-semibold uppercase tracking-[0.2em] text-salmon">Shop</p>
    <h1 class="relative mt-3 text-3xl font-bold text-blue-black md:text-4xl">
      @if (selectedCategoryName()) {
        {{ selectedCategoryName() }}
      } @else if (catalog.search()) {
        Results for "{{ catalog.search() }}"
      } @else {
        All Products
      }
    </h1>
    @if (!catalog.productsLoading() && catalog.productsList().length > 0) {
      <p class="relative mt-2 text-sm text-[#646D77]">{{ catalog.visible().length }} products</p>
    }
  </section>

  <div class="mt-8 grid items-start gap-8 lg:grid-cols-[220px_1fr]">
    <aside class="h-fit rounded-2xl border border-[#F6F8FE] bg-white p-5">
      <h2 class="text-xs font-semibold uppercase tracking-wide text-[#797979]">Filters</h2>
      <div class="mt-4 space-y-4">
        <div>
          <label class="text-sm font-medium text-[#646D77]">Category</label>
          <select
            [ngModel]="catalog.categoryId()"
            (ngModelChange)="catalog.categoryId.set($event); syncUrl()"
            class="mt-1 w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm text-blue-black outline-none focus:border-salmon"
          >
            <option [ngValue]="null">All</option>
            @for (cat of catalog.categoriesList(); track cat.id) {
              <option [ngValue]="cat.id">{{ cat.name }}</option>
            }
          </select>
        </div>

        <div>
          <label class="text-sm font-medium text-[#646D77]">Price</label>
          <div class="mt-1 flex items-center gap-2">
            <input type="number" placeholder="Min" [ngModel]="catalog.minPrice()" (ngModelChange)="catalog.minPrice.set($event)" class="w-1/2 rounded-md border border-[#c9c9c9] px-3 py-2 text-sm outline-none focus:border-salmon" />
            <input type="number" placeholder="Max" [ngModel]="catalog.maxPrice()" (ngModelChange)="catalog.maxPrice.set($event)" class="w-1/2 rounded-md border border-[#c9c9c9] px-3 py-2 text-sm outline-none focus:border-salmon" />
          </div>
        </div>

        <div>
          <label class="text-sm font-medium text-[#646D77]">Color</label>
          <input [ngModel]="catalog.color()" (ngModelChange)="catalog.color.set($event)" placeholder="e.g. black" class="mt-1 w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm outline-none focus:border-salmon" />
        </div>

        <div>
          <label class="text-sm font-medium text-[#646D77]">Sort</label>
          <select [ngModel]="catalog.sort()" (ngModelChange)="catalog.sort.set($event); syncUrl()" class="mt-1 w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm outline-none focus:border-salmon">
            <option value="newest">Newest</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="rating">Top rated</option>
          </select>
        </div>

        <div class="flex flex-col gap-2 pt-1">
          <button type="button" class="w-full rounded-none uppercase tracking-wider bg-salmon px-3 py-2 text-sm font-medium text-white hover:bg-[#e9855a]" (click)="applyFilters()">
            Apply
          </button>
          <button type="button" class="text-center text-sm font-medium text-[#646D77] hover:text-salmon" (click)="clearFilters()">
            Clear filters
          </button>
        </div>
      </div>
    </aside>

    <section>
      @if (catalog.productsLoading()) {
        <app-loading-skeleton />
      } @else if (catalog.productsError(); as error) {
        <div class="rounded-md bg-[#fff5f5] p-4 text-sm text-[#ff4545]">{{ error }}</div>
      } @else if (catalog.paged().length === 0) {
        <app-empty-state message="No products match your filters." />
      } @else {
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          @for (product of catalog.paged(); track product.id) {
            <app-product-card [product]="product" (addToCart)="addToCart($event)" />
          }
        </div>

        <nav class="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
          <button
            type="button"
            class="rounded-md border border-[#c9c9c9] px-3 py-1.5 text-sm font-medium text-[#646D77] hover:border-salmon hover:text-salmon disabled:opacity-40"
            [disabled]="catalog.page() <= 1"
            (click)="goToPage(catalog.page() - 1)"
          >
            Previous
          </button>
          <span class="rounded-md bg-salmon px-3 py-1.5 text-sm font-semibold text-white">Page {{ catalog.page() }} of {{ totalPages() }}</span>
          <button
            type="button"
            class="rounded-md border border-[#c9c9c9] px-3 py-1.5 text-sm font-medium text-[#646D77] hover:border-salmon hover:text-salmon disabled:opacity-40"
            [disabled]="catalog.page() >= totalPages()"
            (click)="goToPage(catalog.page() + 1)"
          >
            Next
          </button>
        </nav>
      }
    </section>
  </div>
</div>
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit --project tsconfig.app.json`
Expected: no output (clean). `clearFilters()` only touches existing public signals on `CatalogStore`.

- [ ] **Step 5: Run the regression suite**

Run: `npx ng test --watch=false --browsers=ChromeHeadless`
Expected: FAILED count ≤ 7, no new failures.

- [ ] **Step 6: Commit**

```bash
git add src/app/storefront/product-list/product-list.component.html src/app/storefront/product-list/product-list.component.ts
git commit -m "redesign: hero band, filter card and pagination on products page; add clear filters"
```

---

### Task 3: Redesign categories page

**Files:**
- Modify: `src/app/storefront/categories/categories.component.html` (full replace)
- Do NOT modify: `src/app/storefront/categories/categories.component.ts`

- [ ] **Step 1: Read the current template**

Read `src/app/storefront/categories/categories.component.html` to confirm current state.

- [ ] **Step 2: Replace the template with the redesigned markup**

Overwrite the entire file with:

```html
<div class="mx-auto max-w-7xl px-4 py-8">
  <section class="relative overflow-hidden rounded-2xl bg-[#ecd7cd] px-6 py-14 text-center md:px-12 md:py-16">
    <span class="pointer-events-none absolute -right-10 -top-14 h-48 w-48 rounded-full bg-white/40"></span>
    <span class="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-salmon/20"></span>
    <p class="relative text-xs font-semibold uppercase tracking-[0.2em] text-salmon">Shop by category</p>
    <h1 class="relative mt-3 text-3xl font-bold text-blue-black md:text-4xl">Categories</h1>
    <p class="relative mx-auto mt-3 max-w-xl text-[#646D77]">Browse our collection by category and find something you will love.</p>
  </section>

  @if (loading()) {
    <div class="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-5">
      @for (_ of [1, 2, 3, 4, 5, 6, 7, 8]; track $index) {
        <div class="h-32 animate-pulse rounded-2xl bg-[#ecd7cd]"></div>
      }
    </div>
  } @else if (error(); as err) {
    <div class="mt-8 rounded-md bg-[#fff5f5] p-4 text-sm text-[#ff4545]">{{ err }}</div>
  } @else if (categories().length === 0) {
    <div class="mt-8">
      <app-empty-state message="No categories yet." />
    </div>
  } @else {
    <div class="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-5">
      @for (cat of categories(); track cat.id) {
        <a
          routerLink="/products"
          [queryParams]="{ categories: cat.id }"
          class="flex h-32 flex-col items-center justify-center gap-2 rounded-2xl border border-[#F6F8FE] bg-white transition hover:border-salmon hover:shadow-md"
        >
          @if (cat.icon) {
            <span class="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ecd7cd]/50 text-2xl text-salmon">{{ cat.icon }}</span>
          }
          <span class="font-semibold text-blue-black">{{ cat.name }}</span>
        </a>
      }
    </div>
  }
</div>
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit --project tsconfig.app.json`
Expected: no output (clean). Same imports (`RouterLink`, `EmptyStateComponent`) suffice.

- [ ] **Step 4: Run the regression suite**

Run: `npx ng test --watch=false --browsers=ChromeHeadless`
Expected: FAILED count ≤ 7, no new failures.

- [ ] **Step 5: Commit**

```bash
git add src/app/storefront/categories/categories.component.html
git commit -m "redesign: hero band and icon tiles on categories page"
```

---

### Task 4: Restyle header search

**Files:**
- Modify: `src/app/shared/header/header.component.html` (3 search blocks)
- Do NOT modify: `src/app/shared/header/header.component.ts` (`search()` behavior unchanged)

The search form appears in three places, all with identical inner `<form>` markup: (1) main desktop nav, (2) sticky nav, (3) mobile hero. Use the Edit tool with the exact old/new strings below; blocks (1) and (2) are identical to each other, so use `replaceAll` for them after doing (3) separately.

- [ ] **Step 1: Read the current template**

Read `src/app/shared/header/header.component.html` to confirm the three search blocks.

- [ ] **Step 2: Restyle the mobile hero search (block 3)**

Replace:

```html
        <div class="duration-100 leading-[32px] !z-10 md:mt-5 sm:mt-9 border-b-[1px] border-b-blue-black text-base text-blue-black transition-all ease-in-out cursor-pointer md:hidden sm:flex">
          <form (ngSubmit)="search()" class="flex items-center">
            <input
              [ngModel]="searchQuery"
              (ngModelChange)="searchQuery = $event"
              [ngModelOptions]="{ standalone: true }"
              name="searchQuery"
              placeholder="Search..."
              class="w-full border-none bg-transparent text-sm outline-none placeholder-[#797979]"
            />
            <button type="submit" class="text-blue-black hover:text-salmon">
              <i class="bi bi-search text-[20px]" style="-webkit-text-stroke: 0.6px"></i>
            </button>
          </form>
        </div>
```

with:

```html
        <div class="!z-10 md:mt-5 sm:mt-9 md:hidden sm:flex">
          <form (ngSubmit)="search()" class="flex items-center gap-1 rounded-full border border-[#c9c9c9] bg-white px-3 py-1.5 transition-colors focus-within:border-salmon">
            <button type="submit" aria-label="Search" class="flex items-center text-blue-black hover:text-salmon">
              <i class="bi bi-search text-[18px]" style="-webkit-text-stroke: 0.6px"></i>
            </button>
            <input
              [ngModel]="searchQuery"
              (ngModelChange)="searchQuery = $event"
              [ngModelOptions]="{ standalone: true }"
              name="searchQuery"
              placeholder="Search..."
              class="w-full border-none bg-transparent text-sm outline-none placeholder-[#797979]"
            />
          </form>
        </div>
```

- [ ] **Step 3: Restyle the main nav and sticky nav searches (blocks 1 and 2)**

Use `replaceAll: true` on the shared block. Replace:

```html
        <li class="duration-100 leading-[32px] 3xl:mr-10 2xl:mr-5 border-b-[1px] border-b-blue-black text-base text-blue-black transition-all ease-in-out cursor-pointer">
          <form (ngSubmit)="search()" class="flex items-center">
            <input
              [ngModel]="searchQuery"
              (ngModelChange)="searchQuery = $event"
              [ngModelOptions]="{ standalone: true }"
              name="searchQuery"
              placeholder="Search..."
              class="w-full border-none bg-transparent text-sm outline-none placeholder-[#797979]"
            />
            <button type="submit" class="text-blue-black hover:text-salmon">
              <i class="bi bi-search text-[20px]" style="-webkit-text-stroke: 0.6px"></i>
            </button>
          </form>
        </li>
```

with:

```html
        <li class="duration-100 leading-[32px] 3xl:mr-10 2xl:mr-5">
          <form (ngSubmit)="search()" class="flex items-center gap-1 rounded-full border border-[#c9c9c9] px-3 py-1.5 transition-colors focus-within:border-salmon">
            <button type="submit" aria-label="Search" class="flex items-center text-blue-black hover:text-salmon">
              <i class="bi bi-search text-[18px]" style="-webkit-text-stroke: 0.6px"></i>
            </button>
            <input
              [ngModel]="searchQuery"
              (ngModelChange)="searchQuery = $event"
              [ngModelOptions]="{ standalone: true }"
              name="searchQuery"
              placeholder="Search..."
              class="w-full border-none bg-transparent text-sm outline-none placeholder-[#797979]"
            />
          </form>
        </li>
```

After editing, verify there are exactly two occurrences (grep for `rounded-full border border-[#c9c9c9]` in the file — expect 3 total, one of which is the mobile hero with `bg-white`).

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit --project tsconfig.app.json`
Expected: no output (clean).

- [ ] **Step 5: Run the regression suite**

Run: `npx ng test --watch=false --browsers=ChromeHeadless`
Expected: FAILED count ≤ 7. The 4 pre-existing HeaderComponent failures may change count (they are unrelated to search styling — the coexisting ones are login/auth-related), but there must be no new failures outside HeaderComponent/Login/AuthStore/authInterceptor specs.

- [ ] **Step 6: Commit**

```bash
git add src/app/shared/header/header.component.html
git commit -m "redesign: pill-style search inputs in header (nav, sticky, mobile hero)"
```

---

## Final Verification

- [ ] `npx tsc --noEmit --project tsconfig.app.json` — clean.
- [ ] `npx ng test --watch=false --browsers=ChromeHeadless` — ≤ 7 pre-existing failures only.
- [ ] Visual check in dev server (logged-in user): open an order at `/profile/orders/:orderId` (hero band, tracker or cancelled banner, items/summary, CTA), `/products` (hero, filter card, clear filters, pagination), `/categories` (hero + tiles), and confirm the three header search pills render and still navigate with a query.