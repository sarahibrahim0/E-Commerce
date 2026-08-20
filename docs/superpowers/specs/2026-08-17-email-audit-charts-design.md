# Design: Email Notifications + User Audit Logs + Chart Enhancements

> **Date:** 2026-08-17
> **Status:** Approved
> **Scope:** Three features enhancing the admin dashboard and customer experience

---

## Feature 1: Email Notifications for Order Status Changes

### Goal
Send branded HTML emails to customers when their order status changes.

### Backend Changes

**Update `helpers/mailer.js`:**
- Add HTML email support (currently text-only)
- Create `sendMail({ to, subject, text, html })` — html is optional, falls back to text

**Create `helpers/email-templates.js`:**
- Export template functions that return HTML strings
- Templates: `orderProcessed(order)`, `orderShipped(order, trackingUrl?)`, `orderDelivered(order)`, `orderCancelled(order, reason?)`
- Simple, clean HTML with inline CSS (no external stylesheets)
- Include: order ID, items summary, total, status, support email

**Modify `routers/orders.js`:**
- After any status update, call the appropriate template and send email
- Use `try/catch` around email sending — email failure must NOT fail the order update
- Import `sendMail` from `helpers/mailer.js` and templates from `helpers/email-templates.js`

**No frontend changes required** — emails are sent from backend only.

### Email Templates

| Status | Subject Line | Content |
|--------|-------------|---------|
| Processed | Your order #{{id}} is being processed | Items, total, expected timeframe |
| Shipped | Your order #{{id}} has shipped! | Tracking info, items, total |
| Delivered | Your order #{{id}} has been delivered | Delivery confirmation, support link |
| Cancelled | Your order #{{id}} has been cancelled | Reason (if provided), refund info |

---

## Feature 2: User-Facing Audit Logs

### Goal
Allow customers to view their own activity history (orders, reviews, profile changes).

### Backend Changes

**Add endpoint `GET /audit-logs/my`:**
- No `requireAdmin` middleware — uses JWT auth only
- Reads `req.auth.userId` from JWT
- Returns paginated logs filtered to that user
- Query params: `page`, `limit`, `entity`, `action`
- Response: `{ logs, total, page, totalPages }`

**Modify `routers/audit-logs.js`:**
- Add new route before the admin-only routes
- Reuse existing AuditLog model (already has `user` field)

### Frontend Changes

**Update `audit-log.service.ts`:**
- Add `getMyLogs(page, limit, entity?, action?)` method
- Calls `GET /audit-logs/my`

**Create `src/app/admin/pages/my-activity/my-activity.component.ts`:**
- Standalone component with PrimeNG Table
- Shows: action, entity, changes, date
- Pagination
- Filter by entity type (dropdown)
- Linked from customer profile or sidebar

**Create `src/app/admin/pages/my-activity/my-activity.routes.ts`:**
- Lazy-loaded route

**Update `app.routes.ts`:**
- Add `/my-activity` route

---

## Feature 3: Chart Enhancements

### Goal
Add period selector, user growth chart, top products chart, and date range support.

### Backend Changes

**Modify `GET /dashboard/revenue-over-time`:**
- Add optional `startDate` and `endDate` query params (ISO date strings)
- When provided, filter `dateOrdered` between these dates
- When not provided, fall back to existing `days` behavior

**Add `GET /dashboard/user-growth`:**
- Query params: `period` (day/week/month), `days` (default: 30)
- Aggregation: group User by `createdAt` date
- Response: `[{ date, count }]`

**Add `GET /dashboard/top-products-chart`:**
- Same as existing `top-products` but formatted for chart consumption
- Query params: `limit` (default: 10)
- Response: `[{ name, totalSold, revenue }]`

### Frontend Changes

**Create `src/app/admin/pages/dashboard/period-selector.component.ts`:**
- Toggle button group: Day | Week | Month
- Optional date range picker (PrimeNG Calendar)
- Output: `periodChange` and `dateRangeChange` events

**Create `src/app/admin/pages/dashboard/user-growth-chart.component.ts`:**
- Line chart (Chart.js)
- Input: `{ date, count }[]`
- Indigo color scheme matching existing charts

**Create `src/app/admin/pages/dashboard/top-products-chart.component.ts`:**
- Horizontal bar chart (Chart.js)
- Input: `{ name, totalSold, revenue }[]`
- Cyan color scheme matching existing charts

**Update `dashboard.service.ts`:**
- Add `getUserGrowth(period, days)` method
- Add `getTopProductsChart(limit)` method
- Update `getRevenueOverTime` to accept `startDate`/`endDate`

**Update `dashboard.component.ts`:**
- Add period selector above charts
- Add user growth chart section
- Add top products chart section
- Pass period/date range to revenue and orders charts

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Modify | `D:\E-Backend\helpers\mailer.js` | Add HTML email support |
| Create | `D:\E-Backend\helpers\email-templates.js` | Order status email templates |
| Modify | `D:\E-Backend\routers\orders.js` | Add email triggers on status change |
| Modify | `D:\E-Backend\routers\audit-logs.js` | Add user-facing `/my` endpoint |
| Modify | `D:\E-Backend\routers\dashboard.js` | Add user-growth, top-products-chart, date range support |
| Create | `D:\E-Backend\tests\email.test.js` | Email notification tests |
| Create | `D:\admin-dashboard-v2\src\app\admin\pages\my-activity\my-activity.component.ts` | User audit log page |
| Create | `D:\admin-dashboard-v2\src\app\admin\pages\my-activity\my-activity.routes.ts` | Routes |
| Create | `D:\admin-dashboard-v2\src\app\admin\pages\dashboard\period-selector.component.ts` | Period toggle |
| Create | `D:\admin-dashboard-v2\src\app\admin\pages\dashboard\user-growth-chart.component.ts` | User growth chart |
| Create | `D:\admin-dashboard-v2\src\app\admin\pages\dashboard\top-products-chart.component.ts` | Top products chart |
| Modify | `D:\admin-dashboard-v2\src\app\core\services\dashboard.service.ts` | Add new endpoints |
| Modify | `D:\admin-dashboard-v2\src\app\core\services\audit-log.service.ts` | Add getMyLogs |
| Modify | `D:\admin-dashboard-v2\src\app\admin\pages\dashboard\dashboard.component.ts` | Integrate new charts |
| Modify | `D:\admin-dashboard-v2\src\app\app.routes.ts` | Add my-activity route |

---

## Testing Strategy

- Backend: Email sending mocked (no real SMTP), audit log tests with JWT, dashboard endpoint tests
- Frontend: Build verification, existing tests must pass
- Integration: Email templates verified for correct HTML output

---

## Dependencies

- No new npm packages required (nodemailer, chart.js, primeNG all installed)
