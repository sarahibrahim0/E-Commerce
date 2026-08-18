# Admin Dashboard — Design Spec

## Overview

A fresh Angular 22 admin dashboard for managing the e-commerce platform. Features dynamic RBAC, refresh token auth, full CRUD for all entities, bulk operations, filtering/sorting, and bilingual LTR/RTL support. Styled with PrimeNG + Tailwind, matching the indigo color theme of the customer-facing storefront.

**Reference:** Design patterns inspired by the Egyptian Cairo Club admin (React) — sidebar layout, permission system, color theming approach.

---

## 1. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Angular 22.1+ (standalone components, signals, zoneless) |
| UI Components | PrimeNG 17+ (Table, Dialog, Toast, ConfirmDialog, Form controls) |
| CSS | Tailwind CSS + custom theme variables |
| State | Angular signals + computed signals (no NgRx) |
| HTTP | Angular HttpClient with interceptors |
| Routing | Angular Router with lazy loading |
| Charts | Chart.js via ng2-charts |
| WebSocket | Socket.io-client |
| Testing | Jasmine + Karma (TDD for services/stores) |
| Build | Angular CLI, production build with optimization |

---

## 2. Project Structure

Fresh Angular 22 project at `D:\admin-dashboard-v2` (separate from the existing Angular 14 repo).

```
src/app/
  core/
    models/         — interfaces (User, Product, Category, Order, Coupon, Content, Review, Role, Permission)
    services/       — API services (products, categories, orders, users, coupons, content, reviews, roles, auth, dashboard, notifications, audit)
    stores/         — signal-based stores (auth, dashboard, notifications, audit)
    guards/         — authGuard, adminGuard, permissionGuard
    interceptors/   — auth interceptor (JWT + refresh token), error interceptor
    utils/          — storage helpers, formatters
  admin/
    layout/         — admin shell (sidebar + topbar + router-outlet)
    dashboard/      — stats overview page
    products/       — list, detail, form (create/edit)
    categories/     — list, detail, form
    orders/         — list, detail, form (status update)
    users/          — list, detail, form
    coupons/        — list, detail, form
    content/        — list, detail, form (CMS pages)
    reviews/        — list, detail
    roles/          — list, detail, form (RBAC role management)
    settings/       — audit logs list, notification settings
    shared/         — reusable admin table, admin form wrapper, permission directive
  auth/             — login, register (shared with storefront)
  storefront/       — existing customer app (migrated from ecommerce-v2)
  shared/           — toast, confirm-dialog, loading (shared between admin and storefront)
```

---

## 3. Routing

```typescript
const routes: Routes = [
  // Public
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },

  // Customer storefront
  { path: '', component: StorefrontShellComponent, children: storefrontRoutes },

  // Admin (protected)
  {
    path: 'admin',
    component: AdminShellComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },

      // Products
      { path: 'products', component: ProductsListComponent },
      { path: 'products/create', component: ProductFormComponent },
      { path: 'products/:id', component: ProductDetailComponent },
      { path: 'products/:id/edit', component: ProductFormComponent },

      // Categories
      { path: 'categories', component: CategoriesListComponent },
      { path: 'categories/create', component: CategoryFormComponent },
      { path: 'categories/:id', component: CategoryDetailComponent },
      { path: 'categories/:id/edit', component: CategoryFormComponent },

      // Orders
      { path: 'orders', component: OrdersListComponent },
      { path: 'orders/:id', component: OrderDetailComponent },
      { path: 'orders/:id/edit', component: OrderFormComponent },

      // Users
      { path: 'users', component: UsersListComponent },
      { path: 'users/create', component: UserFormComponent },
      { path: 'users/:id', component: UserDetailComponent },
      { path: 'users/:id/edit', component: UserFormComponent },

      // Coupons
      { path: 'coupons', component: CouponsListComponent },
      { path: 'coupons/create', component: CouponFormComponent },
      { path: 'coupons/:id', component: CouponDetailComponent },
      { path: 'coupons/:id/edit', component: CouponFormComponent },

      // Content/CMS
      { path: 'content', component: ContentListComponent },
      { path: 'content/create', component: ContentFormComponent },
      { path: 'content/:id', component: ContentDetailComponent },
      { path: 'content/:id/edit', component: ContentFormComponent },

      // Reviews
      { path: 'reviews', component: ReviewsListComponent },
      { path: 'reviews/:id', component: ReviewDetailComponent },

      // Roles (RBAC)
      { path: 'roles', component: RolesListComponent },
      { path: 'roles/create', component: RoleFormComponent },
      { path: 'roles/:id', component: RoleDetailComponent },
      { path: 'roles/:id/edit', component: RoleFormComponent },
    ],
  },

  { path: '**', component: NotFoundComponent },
];
```

All admin routes are lazy-loaded via `loadComponent`.

---

## 3b. Dashboard Charts & Analytics

### Dashboard layout
```
┌─────────────────────────────────────────────────┐
│  Stats cards: Total Sales | Orders | Users |    │
│  Products | Revenue Today | Pending Orders      │
├─────────────────────────────────────────────────┤
│  Revenue chart (line)     │  Orders chart (bar) │
│  Last 30 days             │  Last 30 days       │
├───────────────────────────┴─────────────────────┤
│  Order status distribution (doughnut)           │
│  Top products by revenue (horizontal bar)       │
├─────────────────────────────────────────────────┤
│  Recent orders table (last 10)                  │
│  Low stock alerts                               │
└─────────────────────────────────────────────────┘
```

### Charts
- **Revenue over time:** Line chart (last 7/30/90 days) — Chart.js via `ng2-charts`
- **Orders over time:** Bar chart (last 7/30 days)
- **Order status distribution:** Doughnut chart (pending/shipped/delivered/cancelled)
- **Top products:** Horizontal bar chart (top 10 by revenue)
- **Stats cards:** Total sales, total orders, total users, total products, today's revenue, pending orders
- Date range selector for all charts (7d / 30d / 90d / custom)

### Dashboard backend endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard/stats` | Summary stats (sales, orders, users, products counts) |
| GET | `/dashboard/revenue?days=30` | Revenue data points for line chart |
| GET | `/dashboard/orders-chart?days=30` | Orders data points for bar chart |
| GET | `/dashboard/order-status` | Order status distribution |
| GET | `/dashboard/top-products?limit=10` | Top products by revenue |
| GET | `/dashboard/recent-orders?limit=10` | Recent orders |
| GET | `/dashboard/low-stock?threshold=10` | Products with low stock |

---

## 3c. CSV/Excel Export

### Features
- **Export button** on every list page (top-right, next to "Add New")
- Exports currently filtered/sorted data (respects active filters)
- Format options: CSV (default) and Excel (.xlsx)
- Progress indicator for large exports
- Backend generates file, returns as download

### Backend endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/<entity>/export?format=csv&...filters` | Export filtered data as CSV/Excel |

### Implementation
- Backend: `json2csv` for CSV, `exceljs` for Excel
- Frontend: PrimeNG `Button` with dropdown for format selection
- Large datasets: server-side streaming to avoid memory issues

---

## 3d. Real-time Notifications (WebSocket)

### Features
- **WebSocket connection** on admin login
- **Notification types:** new order, order status change, low stock, new review, new user registration
- **Notification bell** in topbar with unread count badge
- **Notification panel** — dropdown list of recent notifications (last 50)
- **Mark as read** — click to mark individual or "mark all read"
- **Persist** — notifications stored in DB, fetched on page load

### Backend
- Socket.io for WebSocket server
- Events emitted on: new order, status change, low stock, new review, new user
- Notification model: `{ _id, type, title, message, read, createdAt, link }`
- GET `/notifications` — list notifications (paginated)
- PUT `/notifications/:id/read` — mark as read
- PUT `/notifications/read-all` — mark all as read

### Frontend
- `NotificationService` — manages WebSocket connection, notification state
- Signal-based: `notifications = signal<Notification[]>([])`, `unreadCount = computed(...)`
- Topbar bell shows `unreadCount` badge
- Panel with infinite scroll loading

---

## 3e. Two-Factor Authentication (2FA)

### Features
- **TOTP-based** (Google Authenticator, Authy, etc.)
- Admin can enable/disable 2FA per user from Users list
- User can enable 2FA from their profile settings
- **Setup flow:** Generate QR code → user scans → verify with 6-digit code → enable
- **Login flow:** Password → redirect to 2FA verification page → enter 6-digit code → complete login
- **Recovery codes:** 8 single-use recovery codes generated on 2FA enable

### Backend endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/2fa/setup` | Authenticated | Generate QR code + secret |
| POST | `/auth/2fa/verify` | Authenticated | Verify code, enable 2FA |
| POST | `/auth/2fa/disable` | Authenticated | Disable 2FA (requires current code) |
| POST | `/auth/2fa/login` | Partial (password done) | Verify 2FA code, complete login |
| GET | `/auth/2fa/recovery-codes` | Authenticated | Get recovery codes |
| POST | `/auth/2fa/recovery/verify` | Partial | Use recovery code to login |

### Models
```javascript
// User model additions
{
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: String,  // encrypted TOTP secret
  recoveryCodes: [String],  // hashed recovery codes
}
```

### Libraries
- Backend: `speakeasy` (TOTP), `qrcode` (QR generation)
- Frontend: `otpauth` (for QR display), Angular forms for code input

---

## 3f. Audit Logs

### Features
- **Track all admin actions:** create, update, delete across all entities
- **Log entries:** who (user), what (action), when (timestamp), which entity (type + ID), before/after (changes)
- **Audit log page:** searchable, filterable list of all actions
- **Retention:** logs kept for 90 days (configurable)

### Log entry structure
```javascript
{
  _id: ObjectId,
  user: { _id: ObjectId, name: String, email: String },  // who performed the action
  action: String,      // 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export'
  entity: String,      // 'product' | 'category' | 'order' | 'user' | 'coupon' | 'content' | 'role'
  entityId: ObjectId,  // ID of the affected entity
  changes: {           // before/after for updates
    field: string,
    oldValue: any,
    newValue: any
  }[],
  metadata: {          // additional context
    ip: String,
    userAgent: String,
  },
  createdAt: Date,
}
```

### Backend
- `AuditLog` model
- `auditLogger` middleware — auto-logs actions on mutating routes
- GET `/audit-logs` — list logs (paginated, filterable by user/entity/action/date range)
- GET `/audit-logs/stats` — summary stats (actions per day, top users, top entities)

### Frontend
- Audit Logs page under Settings section in sidebar
- Table with columns: Date, User, Action, Entity, Details
- Filters: date range, user, action type, entity type
- Click row to view full diff of changes
- CSV export for audit logs

---

## 4. Auth & Refresh Token

### Token flow
- **Access token:** 15 min expiry, stored in memory (BehaviorSubject)
- **Refresh token:** 7 day expiry, stored in localStorage (key: `ecom.refreshToken`)
- **Login response:** `{ accessToken, refreshToken, user }`
- **Refresh endpoint:** `POST /api/v1/auth/refresh` with `{ refreshToken }` → returns new `{ accessToken, refreshToken }`

### Interceptor behavior
1. Attach `Authorization: Bearer <accessToken>` to all API requests
2. On 401 response:
   - If refresh token exists and not already refreshing → call `POST /auth/refresh`
   - Queue all concurrent 401 requests until refresh completes
   - Retry queued requests with new access token
3. On refresh failure → clear tokens, redirect to `/login`

### Backend changes needed
- New `POST /auth/refresh` endpoint
- New `POST /auth/logout` endpoint (invalidate refresh token)
- Access token TTL: 15 min
- Refresh token TTL: 7 days

---

## 5. Dynamic RBAC

### Models

```typescript
interface Permission {
  _id: string;
  key: string;        // e.g., 'products:create'
  group: string;      // e.g., 'products'
  action: string;     // e.g., 'create'
  label: string;      // e.g., 'Create Products'
}

interface Role {
  _id: string;
  name: string;           // e.g., 'Editor'
  permissions: string[];  // array of permission keys
  isDefault: boolean;     // assigned to new users by default
  createdAt: Date;
}
```

### Permission groups and actions

| Group | Actions |
|-------|---------|
| `dashboard` | `read` |
| `products` | `read`, `create`, `update`, `delete` |
| `categories` | `read`, `create`, `update`, `delete` |
| `orders` | `read`, `update`, `delete` |
| `users` | `read`, `create`, `update`, `delete` |
| `coupons` | `read`, `create`, `update`, `delete` |
| `content` | `read`, `create`, `update`, `delete` |
| `reviews` | `read`, `delete` |
| `roles` | `read`, `create`, `update`, `delete` |

### Backend middleware

```javascript
// Shared middleware: helpers/permission.js
function requirePermission(permissionKey) {
  return (req, res, next) => {
    const userRole = req.auth.role; // from JWT
    if (!userRole || !userRole.permissions.includes(permissionKey)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
}
```

### User model changes
```javascript
{
  name: String,
  email: String,
  password: String,
  role: { type: ObjectId, ref: 'Role' },  // replaces isAdmin
  isAdmin: { type: Boolean, default: false },  // kept for backward compat
  // ...existing fields
}
```

### JWT payload changes
```javascript
{
  userId: ObjectId,
  isAdmin: Boolean,        // backward compat
  role: {
    _id: ObjectId,
    name: String,
    permissions: [String]  // flattened for fast checking
  }
}
```

---

## 6. Table Features (All Entity Lists)

Every admin table includes:

### Sorting
- Click column header → toggle asc/desc/none
- Visual indicator: PrimeNG `p-sortIcon`
- Server-side sorting via `?sortBy=field&sortOrder=asc|desc`

### Filtering
- Per-column filter inputs (text search, dropdown, date range)
- Filter bar above table with common filters
- Server-side filtering via `?field=value` query params
- "Clear filters" button

### Bulk operations
- Checkbox column on left side
- Select-all checkbox in header
- Floating action bar appears when items selected:
  - **Bulk delete** — confirmation dialog → `DELETE /api/v1/<entity>/bulk` with `{ ids: string[] }`
  - **Bulk status change** (orders, users, products) — dropdown → `PUT /api/v1/<entity>/bulk-status` with `{ ids: string[], status: string }`

### Pagination
- Server-side pagination
- Page size selector: 10 / 25 / 50 / 100
- Page navigation: first/prev/next/last + page number input
- Total records display

### Row interactions
- **Click row** → navigate to `/:id` detail page
- **Edit button** (pencil icon) → navigate to `/:id/edit` form page
- **Delete button** (trash icon) → confirmation dialog → `DELETE /api/v1/<entity>/:id`
- **View button** (eye icon) → navigate to `/:id` detail page

### Add New button
- Top-right corner of list page
- Navigates to `/create` form page

### Design
- Indigo-600 for selected checkboxes, sort arrows, active filters
- Slate-200 for borders, slate-400 for muted text
- Hover: slate-50 background
- Selected rows: indigo-50 background

---

## 7. Layout

### Admin shell
```
┌─────────────┬──────────────────────────────────┐
│             │  Topbar (breadcrumb, search,      │
│  Sidebar    │  notifications, user menu)        │
│  (260px)    ├──────────────────────────────────┤
│             │                                   │
│  - Dashboard│  Content area                     │
│  - Content  │  (router-outlet)                  │
│  - Commerce │                                   │
│  - People   │                                   │
│  - Settings │                                   │
│             │                                   │
└─────────────┴──────────────────────────────────┘
```

### Sidebar
- Fixed left, 260px width
- Collapsible to icon-only mode (64px)
- Sections with icons:
  - **Dashboard** — chart-bar icon
  - **Content** — products, categories, content, coupons
  - **Commerce** — orders, reviews
  - **People** — users, roles
  - **System** — audit logs, settings
- Active item: indigo-600 background, white text
- Hover: slate-100 background
- Mobile: offcanvas overlay with hamburger trigger

### Topbar
- Sticky top, height 64px
- Left: hamburger (mobile) + breadcrumb
- Right: search input, notifications bell, user avatar dropdown (profile, logout)

### Mobile responsive
- Sidebar collapses at < 768px
- Hamburger menu triggers offcanvas sidebar
- Tables become card layout on mobile
- Forms stack vertically

---

## 8. i18n (LTR/RTL)

### Implementation
- `dir` attribute on `<html>`: `ltr` or `rtl`
- Persisted in localStorage (`admin.dir`)
- Toggle button in topbar (globe icon)

### Tailwind
- Use logical utilities: `ms-*` (margin-inline-start), `me-*`, `ps-*`, `pe-*`
- Avoid `ml-*`/`mr-*`/`pl-*`/`pr-*` in admin components
- RTL-aware spacing and positioning

### PrimeNG
- PrimeNG supports RTL via `dir` attribute on container
- Table columns auto-flip in RTL mode
- Sidebar auto-mirrors

---

## 9. Color Theme

Matching the e-commerce storefront:

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#4f46e5` (indigo-600) | Buttons, links, active states, selected rows |
| `primary-hover` | `#4338ca` (indigo-700) | Button hover |
| `primary-light` | `#e0e7ff` (indigo-100) | Selected row background |
| `bg` | `#ffffff` | Page background |
| `bg-alt` | `#f8fafc` (slate-50) | Alternate backgrounds |
| `text` | `#0f172a` (slate-900) | Headings |
| `text-body` | `#475569` (slate-600) | Body text |
| `text-muted` | `#94a3b8` (slate-400) | Muted/secondary text |
| `border` | `#e2e8f0` (slate-200) | Borders, dividers |
| `success` | `#059669` (emerald-600) | Success badges, confirmations |
| `error` | `#e11d48` (rose-600) | Error states, delete actions |
| `warning` | `#f59e0b` (amber-500) | Warning badges |

---

## 10. Backend Changes Summary

### New endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/refresh` | Public (refresh token) | Refresh access token |
| POST | `/auth/logout` | Authenticated | Invalidate refresh token |
| POST | `/auth/2fa/setup` | Authenticated | Generate QR code + secret |
| POST | `/auth/2fa/verify` | Authenticated | Verify code, enable 2FA |
| POST | `/auth/2fa/disable` | Authenticated | Disable 2FA |
| POST | `/auth/2fa/login` | Partial (password done) | Verify 2FA code, complete login |
| GET | `/auth/2fa/recovery-codes` | Authenticated | Get recovery codes |
| POST | `/auth/2fa/recovery/verify` | Partial | Use recovery code to login |
| GET | `/roles` | `roles:read` | List all roles |
| GET | `/roles/:id` | `roles:read` | Get role by ID |
| POST | `/roles` | `roles:create` | Create role |
| PUT | `/roles/:id` | `roles:update` | Update role |
| DELETE | `/roles/:id` | `roles:delete` | Delete role |
| GET | `/permissions` | `roles:read` | List all available permissions |
| POST | `/<entity>/bulk` | `<entity>:delete` | Bulk delete entities |
| PUT | `/<entity>/bulk-status` | `<entity>:update` | Bulk status change |
| GET | `/<entity>/export` | `<entity>:read` | Export filtered data as CSV/Excel |
| GET | `/dashboard/stats` | `dashboard:read` | Summary stats |
| GET | `/dashboard/revenue` | `dashboard:read` | Revenue data for charts |
| GET | `/dashboard/orders-chart` | `dashboard:read` | Orders data for charts |
| GET | `/dashboard/order-status` | `dashboard:read` | Order status distribution |
| GET | `/dashboard/top-products` | `dashboard:read` | Top products by revenue |
| GET | `/dashboard/recent-orders` | `dashboard:read` | Recent orders |
| GET | `/dashboard/low-stock` | `dashboard:read` | Low stock products |
| GET | `/notifications` | Authenticated | List notifications |
| PUT | `/notifications/:id/read` | Authenticated | Mark notification read |
| PUT | `/notifications/read-all` | Authenticated | Mark all read |
| GET | `/audit-logs` | `roles:read` | List audit logs |
| GET | `/audit-logs/stats` | `roles:read` | Audit log summary stats |

### Modified endpoints
| Endpoint | Change |
|----------|--------|
| POST `/users/login` | Return `refreshToken` in response |
| POST `/users/register` | Assign default role |
| PUT `/users/:id` | Add `role` field, protect with `users:update` |
| All product/category routes | Add `requirePermission` middleware |
| GET `/orders` | Add pagination, sorting, filtering query params |
| GET `/products` | Add pagination, sorting query params |
| GET `/users` | Add pagination, sorting query params |

### New models
- `Role` — name, permissions[], isDefault
- `RefreshToken` — token, userId, expiresAt, createdAt
- `Notification` — type, title, message, read, createdAt, link, userId
- `AuditLog` — user, action, entity, entityId, changes[], metadata, createdAt

### New middleware
- `requirePermission(key)` — checks JWT role permissions
- Extract shared `requireAdmin` from orders/coupons/content into `helpers/permission.js`
- `auditLogger` — auto-logs actions on mutating routes

### New backend dependencies
- `socket.io` — WebSocket server for real-time notifications
- `speakeasy` — TOTP 2FA secret generation
- `qrcode` — QR code generation for 2FA setup
- `json2csv` — CSV export
- `exceljs` — Excel export

---

## 11. Testing Strategy

### TDD approach (same as storefront)
- Write failing test first
- Implement to pass
- Refactor

### Coverage targets
- Services: 100% (all API calls mocked)
- Stores: 100% (signal state transitions)
- Guards: 100% (auth/permission logic)
- Interceptors: 100% (JWT attach, refresh flow)
- WebSocket: 100% (notification service, event handling)
- Components: Smoke tests for critical flows (login, table load, form submit, chart rendering, export)

### Test files
- `*.spec.ts` co-located with source files
- Jasmine + Karma (Angular 22 default)

---

## 12. Scope

### Included
- Fresh Angular 22 project with PrimeNG + Tailwind
- Auth: login, register, refresh token flow
- RBAC: roles CRUD with dynamic permissions
- Dashboard: stats overview + charts/analytics (revenue, orders, users over time)
- Entity management: Products, Categories, Orders, Users, Coupons, Content, Reviews, Roles
- Table features: sorting, filtering, bulk delete, bulk status, pagination, clickable rows, CSV/Excel export
- Layout: sidebar, topbar, mobile responsive
- i18n: LTR/RTL toggle
- Real-time notifications via WebSocket (order updates, low stock alerts)
- Two-factor authentication (TOTP-based, admin can enable/disable per user)
- Audit logs (track who did what and when across all admin actions)
- Backend: refresh tokens, RBAC middleware, bulk endpoints, permission checks, WebSocket server, audit log model
