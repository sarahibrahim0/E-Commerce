# Storefront Redesign: Order Details, Products, Categories, Header Search

Date: 2026-08-30
Status: Approved

## Context

The ecommerce-v2 storefront was recently redesigned page by page (About, Contact, Product card, Product details). Those pages established a shared design language: cream hero bands (`bg-[#ecd7cd]`, `rounded-2xl`, decorative blobs), overline labels (`text-xs font-semibold uppercase tracking-[0.2em] text-salmon`), white `rounded-2xl`/`rounded-lg border-[#F6F8FE]` cards, salmon icon tiles, and blue-black/salmon CTA buttons.

This spec brings the remaining storefront surfaces in line with that language: the order details page, the products (product-list) page, the categories page, and the header search inputs. All four are visual reskins; no data logic changes.

## Shared Design Tokens (from existing pages)

- Hero band: `relative overflow-hidden rounded-2xl bg-[#ecd7cd] px-6 py-14 md:px-12 md:py-16 text-center` with two decorative blobs (`absolute -right-10 -top-14 h-48 w-48 rounded-full bg-white/40` and `absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-salmon/20`).
- Overline: `text-xs font-semibold uppercase tracking-[0.2em] text-salmon`.
- Page title: `text-3xl font-bold text-blue-black md:text-4xl`.
- Card: `rounded-2xl border border-[#F6F8FE] bg-white`.
- Icon tile: `flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#ecd7cd]/50 text-salmon`.
- Primary button: `inline-flex items-center gap-2 rounded-none uppercase tracking-wider bg-salmon px-5 py-2.5 text-sm font-medium text-white hover:bg-[#e9855a]`.
- Secondary/dark button: `... bg-blue-black ... hover:bg-black` (per About "Shop the collection").
- Danger-outline button: `rounded-md border border-[#ffc9c9] px-4 py-2 text-sm font-medium text-[#ff4545] hover:bg-[#fff5f5]`.
- Field: `w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm outline-none focus:border-salmon`.
- Error banner: `rounded-md bg-[#fff5f5] p-3 text-sm text-[#ff4545]`.

## 1. Order Details (`profile/order-details`)

HTML-only reskin (`.ts` unchanged: `shortId`, `statusPill`, `paymentPill`, `stepIndex`, `cancel`, `buyAgain`). Empty `.scss` stays.

Structure (top to bottom):

1. **Hero band** (cream, shared tokens):
   - Overline "Order details".
   - Title `Order #<shortId>`.
   - `Placed <dateOrdered | date: 'medium'>` subtitle.
   - White pills for status + payment (reuse existing `statusPill`/`paymentPill` classes, applied to `rounded-full bg-white px-3 py-1 text-xs font-medium`).
   - Actions: blue-black **Buy again**; red-outline **Cancel order** only when not cancelled and status !== 'Delivered'.
2. **Live orders** (`@else` branch, active states): white `rounded-2xl` card, overline "Order status", existing 4-step salmon tracker (checked circles, connector lines) unchanged.
3. **Cancelled branch** (`@if isCancelled`): red banner card `rounded-2xl border border-[#ffe1de] bg-[#fff7f6] p-5` with white icon circle (`bi-x-lg`) + "This order was cancelled" + refund note — same messaging as today.
4. **Content grid** `mt-8 grid items-start gap-6 lg:grid-cols-[1fr_320px]`:
   - Items card (`rounded-2xl border-[#F6F8FE] bg-white p-6`): overline **"Items (n)"**; each row `flex items-center gap-4` with `h-20 w-20 shrink-0 rounded object-cover` thumb, name `routerLink` (font-medium text-blue-black hover:text-salmon), `formatPrice(price) × qty` muted line, right-aligned `font-semibold text-dark-purple` line total.
   - Summary card (same card style): overline **"Summary"**; Subtotal (= totalPrice + discount), `– discount` in emerald only when > 0, Total row (`font-semibold`); then a **Ship to** block rendered as a geo icon-tile card (`bi-geo-alt`) naming `shippingAddress1/2, city, country, phone` — same pattern as Contact info cards.
5. **CTA card**: `rounded-2xl border-[#F6F8FE] bg-white p-8 text-center`, heading "Need help with this order?", muted sub-line, salmon **Contact us** button (`routerLink="/contact"`).
6. **Skeleton**: replace `app-loading-spinner` with an inline pulse skeleton: hero-shaped block (`h-44 rounded-xl bg-[#ecd7cd]`) + grid of card blocks (`grid items-start gap-6 lg:grid-cols-[1fr_320px]` with `h-64 rounded-xl bg-[#ecd7cd]` placeholders) — mirrors Contact page skeleton style. Error state keeps the current error banner.

## 2. Products Page (`storefront/product-list`)

HTML-only reskin (`.ts` unchanged).

1. **Hero band** (shared tokens):
   - Overline "Shop".
   - Title = `selectedCategoryName()` / `Results for "{{ catalog.search() }}"` / "All Products" (same precedence as today).
   - Optional muted sub-line showing `{{ catalog.visible().length }} products` (computed already exists; no store changes).
2. **Filters sidebar** (`lg:grid-cols-[220px_1fr]`): white `rounded-2xl border-[#F6F8FE] bg-white p-5`, overline **"Filters"**, fields restyled with shared field classes (`focus:border-salmon`), salmon **Apply** button, plus a **Clear filters** link. Clear filters adds one small TS method `clearFilters()`: resets `categoryId`, `search`, `minPrice`, `maxPrice`, `color`, `sort` to defaults on the catalog store, sets `page` to 1, then calls `syncUrl()`. Everything else in `.ts` stays unchanged.
3. **Grid**: keep `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`; bump `gap-4` → `gap-5`; `app-product-card` unchanged.
4. **Pagination**: keep centered Previous/Page/Next but style as pill buttons matching field style (`rounded-md border border-[#c9c9c9] px-3 py-1.5` already; add `font-medium text-[#646D77] hover:border-salmon hover:text-salmon` and a highlighted active "Page X" span in salmon).
5. **States**: keep `app-loading-skeleton`, error banner, `app-empty-state`.

## 3. Categories Page (`storefront/categories`)

HTML-only reskin (`.ts` unchanged).

1. **Hero band** (shared tokens): overline "Shop by category", title "Categories".
2. **Tiles grid**: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5`; each tile is an `a` card `flex h-32 flex-col items-center justify-center gap-2 rounded-2xl border border-[#F6F8FE] bg-white hover:border-salmon hover:shadow-md transition`, with a salmon icon tile (`flex h-12 w-12 items-center justify-center rounded-xl bg-[#ecd7cd]/50 text-2xl text-salmon`) rendering `cat.icon` when present, then `font-semibold text-blue-black` name.
3. **Skeleton**: existing pulse tiles restyled to `rounded-2xl bg-[#ecd7cd] h-32`.

## 4. Header Search (`shared/header`)

HTML-only reskin; `.ts` `search()` behavior unchanged.

Restyle all three search inputs (main desktop nav, sticky nav, mobile hero) identically:
- Wrap in a container styled as a pill: `flex items-center gap-2 rounded-full border border-[#c9c9c9] px-3 py-1.5 ... transition focus-within:border-salmon` (remove the old border-b underline look).
- Input: keep text-sm transparent framing; add a `bi bi-search` icon element on the left.
- Keep exact same `(ngSubmit)="search()"` and `[ngModel]`/`(ngModelChange)` bindings and `[ngModelOptions]="{ standalone: true }"`.

## Out of Scope

- No API/backend changes.
- No store changes (catalog/cart/wishlist/orders/auth untouched).
- No functional changes to search, filters, tracking, cancellation, or buy-again.
- Old Angular 17 project untouched.

## Verification

- `npx tsc --noEmit --project tsconfig.app.json` passes.
- `npx ng test --watch=false --browsers=ChromeHeadless` — no new failures beyond the 7 pre-existing unrelated (Header×4, Login, AuthStore, authInterceptor). The HeaderComponent spec failures are pre-existing; this change touches header template only, so re-run to confirm no additional failures introduced.