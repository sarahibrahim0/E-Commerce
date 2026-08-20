# Email Notifications + User Audit Logs + Chart Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add email notifications for order status changes, user-facing audit logs, and enhanced dashboard charts with period selector.

**Architecture:** Backend-first: update mailer for HTML, add email templates, add user audit endpoint, add new dashboard endpoints. Then frontend: user activity page, period selector, new chart components.

**Repo:** `D:\E-Backend` (backend), `D:\admin-dashboard-v2` (frontend)

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Modify | `D:\E-Backend\helpers\mailer.js` | Add HTML email support |
| Create | `D:\E-Backend\helpers\email-templates.js` | Order status email templates |
| Modify | `D:\E-Backend\routers\orders.js` | Add email triggers on status change |
| Modify | `D:\E-Backend\routers\audit-logs.js` | Add user-facing `/my` endpoint |
| Create | `D:\E-Backend\tests\email-templates.test.js` | Email template tests |
| Modify | `D:\E-Backend\routers\dashboard.js` | Add user-growth, top-products-chart, date range |
| Modify | `D:\admin-dashboard-v2\src\app\core\services\dashboard.service.ts` | Add new endpoints |
| Modify | `D:\admin-dashboard-v2\src\app\core\services\audit-log.service.ts` | Add getMyLogs |
| Create | `D:\admin-dashboard-v2\src\app\admin\pages\my-activity\my-activity.component.ts` | User audit log page |
| Create | `D:\admin-dashboard-v2\src\app\admin\pages\my-activity\my-activity.routes.ts` | Routes |
| Create | `D:\admin-dashboard-v2\src\app\admin\pages\dashboard\period-selector.component.ts` | Period toggle |
| Create | `D:\admin-dashboard-v2\src\app\admin\pages\dashboard\user-growth-chart.component.ts` | User growth chart |
| Create | `D:\admin-dashboard-v2\src\app\admin\pages\dashboard\top-products-chart.component.ts` | Top products chart |
| Modify | `D:\admin-dashboard-v2\src\app\admin\pages\dashboard\dashboard.component.ts` | Integrate new charts |
| Modify | `D:\admin-dashboard-v2\src\app\admin\layout\sidebar.component.ts` | Add My Activity nav |
| Modify | `D:\admin-dashboard-v2\src\app\app.routes.ts` | Add my-activity route |

---

## Task 1: Update Mailer for HTML Support

**Files:**
- Modify: `D:\E-Backend\helpers\mailer.js`

- [ ] **Step 1: Read current mailer**

Read `D:\E-Backend\helpers\mailer.js` to understand current implementation.

- [ ] **Step 2: Update mailer to support HTML**

Update `D:\E-Backend\helpers\mailer.js` to accept and pass through HTML content:

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendMail({ to, subject, text, html }) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html: html || text,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendMail };
```

- [ ] **Step 3: Commit**

```bash
cd D:\E-Backend && git add helpers/mailer.js && git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "feat: update mailer to support HTML emails"
```

---

## Task 2: Create Email Templates

**Files:**
- Create: `D:\E-Backend\helpers\email-templates.js`
- Create: `D:\E-Backend\tests\email-templates.test.js`

- [ ] **Step 1: Create email templates**

`D:\E-Backend\helpers\email-templates.js`:
```javascript
function baseTemplate(content) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
    .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; }
    .order-id { font-weight: bold; color: #4f46e5; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-weight: bold; font-size: 14px; }
    .status-processed { background: #d1fae5; color: #065f46; }
    .status-shipped { background: #dbeafe; color: #1e40af; }
    .status-delivered { background: #e0e7ff; color: #3730a3; }
    .status-cancelled { background: #fee2e2; color: #991b1b; }
  </style>
</head>
<body>
  <div class="header">
    <h1>E-Commerce Store</h1>
  </div>
  <div class="content">
    ${content}
  </div>
  <div class="footer">
    <p>Thank you for shopping with us!</p>
    <p>If you have questions, contact us at support@ecommerce.com</p>
  </div>
</body>
</html>`;
}

function orderProcessed(order) {
  const items = order.orderItems.map(item => `<li>${item.name} x ${item.quantity} - $${item.price}</li>`).join('');
  const content = `
    <h2>Order Update</h2>
    <p>Your order <span class="order-id">#${order._id}</span> is being processed.</p>
    <span class="status-badge status-processed">Processed</span>
    <h3>Order Summary</h3>
    <ul>${items}</ul>
    <p><strong>Total: $${order.totalPrice.toFixed(2)}</strong></p>
    <p>We'll notify you when your order ships.</p>
  `;
  return baseTemplate(content);
}

function orderShipped(order) {
  const items = order.orderItems.map(item => `<li>${item.name} x ${item.quantity}</li>`).join('');
  const content = `
    <h2>Order Shipped!</h2>
    <p>Great news! Your order <span class="order-id">#${order._id}</span> has been shipped.</p>
    <span class="status-badge status-shipped">Shipped</span>
    <h3>Order Summary</h3>
    <ul>${items}</ul>
    <p><strong>Total: $${order.totalPrice.toFixed(2)}</strong></p>
    <p>You'll receive a delivery confirmation once your order arrives.</p>
  `;
  return baseTemplate(content);
}

function orderDelivered(order) {
  const content = `
    <h2>Order Delivered</h2>
    <p>Your order <span class="order-id">#${order._id}</span> has been delivered.</p>
    <span class="status-badge status-delivered">Delivered</span>
    <p>We hope you enjoy your purchase! If you have any issues, please contact our support team.</p>
  `;
  return baseTemplate(content);
}

function orderCancelled(order, reason) {
  const content = `
    <h2>Order Cancelled</h2>
    <p>Your order <span class="order-id">#${order._id}</span> has been cancelled.</p>
    <span class="status-badge status-cancelled">Cancelled</span>
    ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
    <p>If you were charged, a refund will be processed within 3-5 business days.</p>
  `;
  return baseTemplate(content);
}

module.exports = { orderProcessed, orderShipped, orderDelivered, orderCancelled };
```

- [ ] **Step 2: Write tests**

`D:\E-Backend\tests\email-templates.test.js`:
```javascript
const { describe, it } = require('node:test');
const assert = require('node:assert');
const { orderProcessed, orderShipped, orderDelivered, orderCancelled } = require('../helpers/email-templates');

const mockOrder = {
  _id: '507f1f77bcf86cd799439011',
  orderItems: [
    { name: 'Test Product', quantity: 2, price: 29.99 },
  ],
  totalPrice: 59.98,
};

describe('Email Templates', () => {
  it('orderProcessed should return HTML with order ID', () => {
    const html = orderProcessed(mockOrder);
    assert(html.includes('507f1f77bcf86cd799439011'));
    assert(html.includes('Processed'));
    assert(html.includes('Test Product'));
  });

  it('orderShipped should return HTML with shipped status', () => {
    const html = orderShipped(mockOrder);
    assert(html.includes('Shipped'));
    assert(html.includes('507f1f77bcf86cd799439011'));
  });

  it('orderDelivered should return HTML with delivered status', () => {
    const html = orderDelivered(mockOrder);
    assert(html.includes('Delivered'));
  });

  it('orderCancelled should return HTML with cancelled status', () => {
    const html = orderCancelled(mockOrder, 'Out of stock');
    assert(html.includes('Cancelled'));
    assert(html.includes('Out of stock'));
  });

  it('orderCancelled should handle missing reason', () => {
    const html = orderCancelled(mockOrder);
    assert(html.includes('Cancelled'));
    assert(!html.includes('Reason:'));
  });
});
```

- [ ] **Step 3: Run tests**

```bash
cd D:\E-Backend && node --test tests/email-templates.test.js
```

- [ ] **Step 4: Commit**

```bash
cd D:\E-Backend && git add helpers/email-templates.js tests/email-templates.test.js && git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "feat: add order status email templates with tests"
```

---

## Task 3: Add Email Triggers to Orders Router

**Files:**
- Modify: `D:\E-Backend\routers\orders.js`

- [ ] **Step 1: Read orders router**

Read `D:\E-Backend\routers\orders.js` to find the status update route.

- [ ] **Step 2: Add email imports at top**

Add after existing imports:
```javascript
const { sendMail } = require('../helpers/mailer');
const { orderProcessed, orderShipped, orderDelivered, orderCancelled } = require('../helpers/email-templates');
```

- [ ] **Step 3: Add email sending after status update**

In the route that updates order status (likely PUT /:id), after the order is saved, add email sending wrapped in try/catch:

```javascript
// After order.save() in status update route:
try {
  let html;
  switch (order.status) {
    case 'Processed': html = orderProcessed(order); break;
    case 'Shipped': html = orderShipped(order); break;
    case 'Delivered': html = orderDelivered(order); break;
    case 'Cancelled': html = orderCancelled(order, req.body.reason); break;
  }
  if (html && order.user?.email) {
    await sendMail({
      to: order.user.email,
      subject: `Order #${order._id} - ${order.status}`,
      text: `Your order status has been updated to ${order.status}`,
      html,
    });
  }
} catch (emailErr) {
  console.error('Failed to send order email:', emailErr.message);
}
```

- [ ] **Step 4: Verify tests still pass**

```bash
cd D:\E-Backend && npm test
```

- [ ] **Step 5: Commit**

```bash
cd D:\E-Backend && git add routers/orders.js && git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "feat: add email notifications on order status change"
```

---

## Task 4: Add User-Facing Audit Log Endpoint

**Files:**
- Modify: `D:\E-Backend\routers\audit-logs.js`

- [ ] **Step 1: Read audit logs router**

Read `D:\E-Backend\routers\audit-logs.js`.

- [ ] **Step 2: Add user-facing endpoint**

Add this route BEFORE the admin-only routes:

```javascript
// GET /api/v1/audit-logs/my — user's own logs
router.get('/my', async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { page = 1, limit = 50, entity, action } = req.query;
    const filter = { user: userId };
    if (entity) filter.entity = entity;
    if (action) filter.action = action;

    const total = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ logs, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
```

- [ ] **Step 3: Write tests**

Add to `D:\E-Backend\tests\audit-logs.test.js` or create new test:

```javascript
it('GET /api/v1/audit-logs/my should return user own logs', async () => {
  const user = await User.create({ name: 'My Log User', email: 'mylog@test.com', password: '123456', phone: '123' });
  const userToken = jwt.sign({ userId: user._id, isAdmin: false }, process.env.JWT_SECRET || 'test-secret');
  
  await AuditLog.create({ action: 'create', entity: 'Order', entityId: new mongoose.Types.ObjectId(), user: user._id });
  
  const res = await request(app)
    .get('/api/v1/audit-logs/my')
    .set('Authorization', `Bearer ${userToken}`);
  expect(res.status).toBe(200);
  expect(res.body.logs.length).toBeGreaterThanOrEqual(1);
  expect(res.body.logs.every(l => l.user.toString() === user._id.toString())).toBe(true);
  
  await User.deleteMany({ email: 'mylog@test.com' });
  await AuditLog.deleteMany({ user: user._id });
});
```

- [ ] **Step 4: Run tests**

```bash
cd D:\E-Backend && npm test
```

- [ ] **Step 5: Commit**

```bash
cd D:\E-Backend && git add routers/audit-logs.js tests/audit-logs.test.js && git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "feat: add user-facing audit log endpoint"
```

---

## Task 5: Add Dashboard Endpoints

**Files:**
- Modify: `D:\E-Backend\routers\dashboard.js`

- [ ] **Step 1: Read dashboard router**

Read `D:\E-Backend\routers\dashboard.js`.

- [ ] **Step 2: Add date range support to revenue-over-time**

Modify the `revenue-over-time` endpoint to accept `startDate` and `endDate`:

```javascript
// In revenue-over-time handler, replace the date filter logic:
const { period = 'day', days = 30, startDate, endDate } = req.query;

let dateFilter;
if (startDate && endDate) {
  dateFilter = { $gte: new Date(startDate), $lte: new Date(endDate) };
} else {
  const now = new Date();
  dateFilter = { $gte: new Date(now.getTime() - parseInt(days) * 24 * 60 * 60 * 1000) };
}
```

- [ ] **Step 3: Add user-growth endpoint**

Add after existing endpoints:

```javascript
// GET /api/v1/dashboard/user-growth
router.get('/user-growth', requireAdmin, async (req, res) => {
  try {
    const { period = 'day', days = 30 } = req.query;
    const now = new Date();
    const startDate = new Date(now.getTime() - parseInt(days) * 24 * 60 * 60 * 1000);

    let groupId;
    if (period === 'month') {
      groupId = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
    } else if (period === 'week') {
      groupId = { year: { $year: '$createdAt' }, week: { $isoWeek: '$createdAt' } };
    } else {
      groupId = { date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } };
    }

    const User = require('../models/user');
    const growth = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: groupId, count: { $sum: 1 } } },
      { $sort: { '_id.date': 1, '_id.year': 1, '_id.month': 1, '_id.week': 1 } },
    ]);

    const result = growth.map(g => ({
      date: g._id.date || `${g._id.year}-W${String(g._id.week).padStart(2, '0')}` || `${g._id.year}-${String(g._id.month).padStart(2, '0')}`,
      count: g.count,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
```

- [ ] **Step 4: Add top-products-chart endpoint**

```javascript
// GET /api/v1/dashboard/top-products-chart
router.get('/top-products-chart', requireAdmin, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const { Order } = require('../models/order');

    const topProducts = await Order.aggregate([
      { $unwind: '$orderItems' },
      { $group: {
        _id: '$orderItems.product',
        name: { $first: '$orderItems.name' },
        totalSold: { $sum: '$orderItems.quantity' },
        revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
      }},
      { $sort: { totalSold: -1 } },
      { $limit: parseInt(limit) },
    ]);

    res.json(topProducts.map(p => ({
      name: p.name,
      totalSold: p.totalSold,
      revenue: p.revenue,
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
```

- [ ] **Step 5: Write tests**

Add to `D:\E-Backend\tests\dashboard.test.js`:

```javascript
it('GET /api/v1/dashboard/user-growth should return user growth data', async () => {
  const res = await request(app)
    .get('/api/v1/dashboard/user-growth?period=day&days=30')
    .set('Authorization', `Bearer ${adminToken}`);
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});

it('GET /api/v1/dashboard/top-products-chart should return product data', async () => {
  const res = await request(app)
    .get('/api/v1/dashboard/top-products-chart?limit=5')
    .set('Authorization', `Bearer ${adminToken}`);
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});
```

- [ ] **Step 6: Run tests**

```bash
cd D:\E-Backend && npm test
```

- [ ] **Step 7: Commit**

```bash
cd D:\E-Backend && git add routers/dashboard.js tests/dashboard.test.js && git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "feat: add user-growth, top-products-chart, and date range support"
```

---

## Task 6: Frontend — Update Services

**Files:**
- Modify: `D:\admin-dashboard-v2\src\app\core\services\dashboard.service.ts`
- Modify: `D:\admin-dashboard-v2\src\app\core\services\audit-log.service.ts`

- [ ] **Step 1: Update dashboard service**

Read `D:\admin-dashboard-v2\src\app\core\services\dashboard.service.ts` and add:

```typescript
getUserGrowth(period: string = 'day', days: number = 30): Observable<{ date: string; count: number }[]> {
  return this.http.get<{ date: string; count: number }[]>(`${this.url}user-growth`, { params: { period, days } });
}

getTopProductsChart(limit: number = 10): Observable<{ name: string; totalSold: number; revenue: number }[]> {
  return this.http.get<{ name: string; totalSold: number; revenue: number }[]>(`${this.url}top-products-chart`, { params: { limit } });
}
```

Also update `getRevenueOverTime` to accept optional `startDate` and `endDate` params.

- [ ] **Step 2: Update audit log service**

Read `D:\admin-dashboard-v2\src\app\core\services\audit-log.service.ts` and add:

```typescript
getMyLogs(page = 1, limit = 50, entity?: string, action?: string): Observable<AuditLogResponse> {
  let params = new HttpParams().set('page', page).set('limit', limit);
  if (entity) params = params.set('entity', entity);
  if (action) params = params.set('action', action);
  return this.http.get<AuditLogResponse>(`${this.url}my`, { params });
}
```

- [ ] **Step 3: Verify build**

```bash
cd D:\admin-dashboard-v2 && npx ng build --configuration development
```

- [ ] **Step 4: Commit**

```bash
cd D:\admin-dashboard-v2 && git add src/app/core/services/ && git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "feat: update dashboard and audit log services with new endpoints"
```

---

## Task 7: Frontend — User Activity Page

**Files:**
- Create: `D:\admin-dashboard-v2\src\app\admin\pages\my-activity\my-activity.component.ts`
- Create: `D:\admin-dashboard-v2\src\app\admin\pages\my-activity\my-activity.routes.ts`

- [ ] **Step 1: Create my-activity component**

`D:\admin-dashboard-v2\src\app\admin\pages\my-activity\my-activity.component.ts`:
```typescript
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AuditLogService, AuditLog } from '../../../core/services/audit-log.service';

@Component({
  selector: 'app-my-activity',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, DropdownModule, ButtonModule, TagModule],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-slate-900">My Activity</h1>

      <div class="rounded-lg border border-slate-200 bg-white p-6">
        <div class="mb-4 flex gap-4">
          <select [(ngModel)]="selectedEntity" (ngModelChange)="loadLogs()"
            class="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="">All Activity</option>
            <option value="Order">Orders</option>
            <option value="Review">Reviews</option>
            <option value="User">Profile Changes</option>
          </select>
        </div>

        <p-table [value]="logs()" [tableStyle]="{ 'min-width': '50rem' }">
          <ng-template pTemplate="header">
            <tr>
              <th>Action</th>
              <th>Entity</th>
              <th>Details</th>
              <th>Date</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-log>
            <tr>
              <td>
                <p-tag [value]="log.action" [severity]="getSeverity(log.action)" />
              </td>
              <td>{{ log.entity }}</td>
              <td class="max-w-xs truncate">{{ log.changes | json }}</td>
              <td>{{ log.createdAt | date:'medium' }}</td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="4" class="py-8 text-center text-slate-500">No activity found</td></tr>
          </ng-template>
        </p-table>

        <div class="mt-4 flex justify-between text-sm text-slate-600">
          <span>Page {{ currentPage() }} of {{ totalPages() }}</span>
          <div class="flex gap-2">
            <p-button label="Previous" [disabled]="currentPage() <= 1" (onClick)="prevPage()" size="small" />
            <p-button label="Next" [disabled]="currentPage() >= totalPages()" (onClick)="nextPage()" size="small" />
          </div>
        </div>
      </div>
    </div>
  `,
})
export class MyActivityComponent implements OnInit {
  private auditLogService = inject(AuditLogService);

  logs = signal<AuditLog[]>([]);
  selectedEntity = '';
  currentPage = signal(1);
  totalPages = signal(1);

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.auditLogService.getMyLogs(this.currentPage(), 50, this.selectedEntity || undefined).subscribe((res) => {
      this.logs.set(res.logs);
      this.totalPages.set(res.totalPages);
    });
  }

  nextPage(): void {
    this.currentPage.update((p) => p + 1);
    this.loadLogs();
  }

  prevPage(): void {
    this.currentPage.update((p) => Math.max(1, p - 1));
    this.loadLogs();
  }

  getSeverity(action: string): string {
    switch (action.toLowerCase()) {
      case 'create': return 'success';
      case 'update': return 'warn';
      case 'delete': return 'danger';
      default: return 'info';
    }
  }
}
```

- [ ] **Step 2: Create routes**

`D:\admin-dashboard-v2\src\app\admin\pages\my-activity\my-activity.routes.ts`:
```typescript
import { Routes } from '@angular/router';
import { MyActivityComponent } from './my-activity.component';

export const MY_ACTIVITY_ROUTES: Routes = [
  { path: '', component: MyActivityComponent },
];
```

- [ ] **Step 3: Update sidebar**

Read `D:\admin-dashboard-v2\src\app\admin\layout\sidebar.component.ts` and add "My Activity" nav item (icon: pi pi-history).

- [ ] **Step 4: Wire route**

Read `D:\admin-dashboard-v2\src\app\app.routes.ts` and add:
```typescript
{
  path: 'my-activity',
  loadChildren: () => import('./admin/pages/my-activity/my-activity.routes').then(m => m.MY_ACTIVITY_ROUTES),
  canActivate: [authGuard],
},
```

- [ ] **Step 5: Verify build**

```bash
cd D:\admin-dashboard-v2 && npx ng build --configuration development
```

- [ ] **Step 6: Commit**

```bash
cd D:\admin-dashboard-v2 && git add src/app/admin/pages/my-activity/ src/app/admin/layout/sidebar.component.ts src/app/app.routes.ts && git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "feat: add user-facing my activity page"
```

---

## Task 8: Frontend — Period Selector + New Charts

**Files:**
- Create: `D:\admin-dashboard-v2\src\app\admin\pages\dashboard\period-selector.component.ts`
- Create: `D:\admin-dashboard-v2\src\app\admin\pages\dashboard\user-growth-chart.component.ts`
- Create: `D:\admin-dashboard-v2\src\app\admin\pages\dashboard\top-products-chart.component.ts`
- Modify: `D:\admin-dashboard-v2\src\app\admin\pages\dashboard\dashboard.component.ts`

- [ ] **Step 1: Create period selector**

`D:\admin-dashboard-v2\src\app\admin\pages\dashboard\period-selector.component.ts`:
```typescript
import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-period-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-2">
      <span class="text-sm text-slate-600">Period:</span>
      @for (p of periods; track p.value) {
        <button
          (click)="selectPeriod(p.value)"
          [class]="selectedPeriod() === p.value
            ? 'rounded-lg bg-indigo-600 px-3 py-1 text-sm text-white'
            : 'rounded-lg bg-slate-100 px-3 py-1 text-sm text-slate-700 hover:bg-slate-200'">
          {{ p.label }}
        </button>
      }
    </div>
  `,
})
export class PeriodSelectorComponent {
  @Output() periodChange = new EventEmitter<string>();

  selectedPeriod = signal('day');
  periods = [
    { label: 'Day', value: 'day' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
  ];

  selectPeriod(period: string): void {
    this.selectedPeriod.set(period);
    this.periodChange.emit(period);
  }
}
```

- [ ] **Step 2: Create user growth chart**

`D:\admin-dashboard-v2\src\app\admin\pages\dashboard\user-growth-chart.component.ts`:
```typescript
import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-user-growth-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-lg border border-slate-200 bg-white p-6">
      <h3 class="mb-4 text-lg font-semibold text-slate-900">User Growth</h3>
      <div class="h-64">
        <canvas #chartCanvas></canvas>
      </div>
    </div>
  `,
})
export class UserGrowthChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() data: { date: string; count: number }[] = [];

  private chart: Chart | null = null;

  ngAfterViewInit(): void { this.renderChart(); }
  ngOnChanges(changes: SimpleChanges): void { if (changes['data'] && this.chartCanvas) this.renderChart(); }
  ngOnDestroy(): void { this.chart?.destroy(); }

  private renderChart(): void {
    if (!this.chartCanvas || !this.data.length) return;
    this.chart?.destroy();

    const ctx = this.chartCanvas.nativeElement.getContext('2d')!;
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.data.map((d) => d.date),
        datasets: [{
          label: 'New Users',
          data: this.data.map((d) => d.count),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, ticks: { stepSize: 1 } },
        },
      },
    });
  }
}
```

- [ ] **Step 3: Create top products chart**

`D:\admin-dashboard-v2\src\app\admin\pages\dashboard\top-products-chart.component.ts`:
```typescript
import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-top-products-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-lg border border-slate-200 bg-white p-6">
      <h3 class="mb-4 text-lg font-semibold text-slate-900">Top Products</h3>
      <div class="h-64">
        <canvas #chartCanvas></canvas>
      </div>
    </div>
  `,
})
export class TopProductsChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() data: { name: string; totalSold: number; revenue: number }[] = [];

  private chart: Chart | null = null;

  ngAfterViewInit(): void { this.renderChart(); }
  ngOnChanges(changes: SimpleChanges): void { if (changes['data'] && this.chartCanvas) this.renderChart(); }
  ngOnDestroy(): void { this.chart?.destroy(); }

  private renderChart(): void {
    if (!this.chartCanvas || !this.data.length) return;
    this.chart?.destroy();

    const ctx = this.chartCanvas.nativeElement.getContext('2d')!;
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.data.map((d) => d.name),
        datasets: [{
          label: 'Units Sold',
          data: this.data.map((d) => d.totalSold),
          backgroundColor: '#06b6d4',
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, ticks: { stepSize: 1 } },
        },
      },
    });
  }
}
```

- [ ] **Step 4: Update dashboard component**

Read `D:\admin-dashboard-v2\src\app\admin\pages\dashboard\dashboard.component.ts` and:

1. Import the 3 new components: `PeriodSelectorComponent`, `UserGrowthChartComponent`, `TopProductsChartComponent`
2. Add them to the `imports` array
3. Add signals: `userGrowthData = signal([])`, `topProductsData = signal([])`, `selectedPeriod = signal('day')`
4. Add `onPeriodChange(period: string)` method that reloads revenue and orders data with new period
5. Add `loadUserGrowth()` and `loadTopProducts()` methods called in `ngOnInit`
6. Add period selector above the charts section
7. Add user growth chart and top products chart sections

- [ ] **Step 5: Verify build**

```bash
cd D:\admin-dashboard-v2 && npx ng build --configuration development
```

- [ ] **Step 6: Commit**

```bash
cd D:\admin-dashboard-v2 && git add src/app/admin/pages/dashboard/ && git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "feat: add period selector, user growth, and top products charts"
```

---

## Task 9: Full Verification

- [ ] **Step 1: Production build (frontend)**

```bash
cd D:\admin-dashboard-v2 && npx ng build --configuration production
```

- [ ] **Step 2: All frontend tests**

```bash
cd D:\admin-dashboard-v2 && npx ng test --watch=false
```

- [ ] **Step 3: All backend tests**

```bash
cd D:\E-Backend && npm test
```

- [ ] **Step 4: Git status check**

```bash
cd D:\admin-dashboard-v2 && git status
cd D:\E-Backend && git status
```

- [ ] **Step 5: Commit history**

```bash
cd D:\admin-dashboard-v2 && git log --oneline -10
cd D:\E-Backend && git log --oneline -10
```
