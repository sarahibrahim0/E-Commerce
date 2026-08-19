# Dashboard & Charts — Admin Dashboard

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Dashboard page with KPI cards, revenue/orders charts, top products, category distribution, order status breakdown, and recent activity — using Chart.js via ng2-charts.

**Architecture:** Backend dashboard aggregation endpoint + Angular dashboard component with Chart.js charts.

**Repo:** `D:\admin-dashboard-v2` (frontend), `D:\E-Backend` (backend)

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Create | `D:\E-Backend\routers\dashboard.js` | Dashboard aggregation endpoint |
| Create | `D:\E-Backend\tests\dashboard.test.js` | Dashboard endpoint tests |
| Modify | `D:\E-Backend\app.js` | Mount dashboard router |
| Create | `src/app/core/services/dashboard.service.ts` | Dashboard API service |
| Create | `src/app/admin/pages/dashboard/dashboard.component.ts` | Dashboard with charts |
| Create | `src/app/admin/pages/dashboard/kpi-card.component.ts` | KPI card component |
| Create | `src/app/admin/pages/dashboard/revenue-chart.component.ts` | Revenue line chart |
| Create | `src/app/admin/pages/dashboard/orders-chart.component.ts` | Orders bar chart |
| Create | `src/app/admin/pages/dashboard/category-chart.component.ts` | Category pie chart |
| Create | `src/app/admin/pages/dashboard/status-chart.component.ts` | Order status donut chart |
| Create | `src/app/admin/pages/dashboard/top-products.component.ts` | Top products table |
| Create | `src/app/admin/pages/dashboard/recent-orders.component.ts` | Recent orders list |
| Modify | `src/app/app.routes.ts` | Update dashboard route |

---

## Task 1: Backend Dashboard Endpoint

**Files:**
- Create: `D:\E-Backend\routers\dashboard.js`
- Create: `D:\E-Backend\tests\dashboard.test.js`
- Modify: `D:\E-Backend\app.js`

- [ ] **Step 1: Create dashboard router**

`D:\E-Backend\routers\dashboard.js`:
```javascript
const express = require('express');
const router = express.Router();
const { Order } = require('../models/order');
const { Product } = require('../models/product');
const { User } = require('../models/user');
const { Review } = require('../models/review');
const { Category } = require('../models/category');
const { requireAdmin } = require('../helpers/permission');

// GET /api/v1/dashboard/summary
router.get('/summary', requireAdmin, async (req, res) => {
  try {
    const [
      totalOrders,
      totalProducts,
      totalUsers,
      totalReviews,
      salesData,
      ordersByStatus,
      paymentStatus,
      lowStockCount,
    ] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments(),
      Review.countDocuments(),
      Order.aggregate([
        { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' }, avgOrder: { $avg: '$totalPrice' } } },
      ]),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $group: { _id: '$paymentStatus', count: { $sum: 1 } } },
      ]),
      Product.countDocuments({ countInStock: { $lte: 10 } }),
    ]);

    const totalsales = salesData[0]?.totalRevenue || 0;
    const avgOrderValue = salesData[0]?.avgOrder || 0;
    const pendingOrders = ordersByStatus.find((s) => s._id === 'Pending')?.count || 0;

    res.json({
      totalRevenue: totalsales,
      totalOrders,
      totalProducts,
      totalUsers,
      totalReviews,
      pendingOrders,
      lowStockProducts: lowStockCount,
      averageOrderValue: avgOrderValue,
      ordersByStatus: ordersByStatus.map((s) => ({ status: s._id || 'Unknown', count: s.count })),
      paymentStatusBreakdown: paymentStatus.map((s) => ({ status: s._id || 'Unknown', count: s.count })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/v1/dashboard/revenue-over-time
router.get('/revenue-over-time', requireAdmin, async (req, res) => {
  try {
    const { period = 'day', days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    let groupId;
    if (period === 'month') {
      groupId = { year: { $year: '$dateOrdered' }, month: { $month: '$dateOrdered' } };
    } else if (period === 'week') {
      groupId = { year: { $year: '$dateOrdered' }, week: { $isoWeek: '$dateOrdered' } };
    } else {
      groupId = { $dateToString: { format: '%Y-%m-%d', date: '$dateOrdered' } };
    }

    const data = await Order.aggregate([
      { $match: { dateOrdered: { $gte: startDate } } },
      { $group: { _id: groupId, revenue: { $sum: '$totalPrice' }, orderCount: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json(data.map((d) => ({
      date: typeof d._id === 'object' ? `${d._id.year}-${String(d._id.month || d._id.week).padStart(2, '0')}` : d._id,
      revenue: d.revenue,
      orderCount: d.orderCount,
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/v1/dashboard/top-products
router.get('/top-products', requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data = await Order.aggregate([
      { $unwind: '$orderItems' },
      { $lookup: { from: 'orderitems', localField: 'orderItems', foreignField: '_id', as: 'item' } },
      { $unwind: '$item' },
      { $group: { _id: '$item.product', totalSold: { $sum: '$item.quantity' }, totalRevenue: { $sum: { $multiply: ['$item.quantity', '$item.product'] } } } },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
    ]);

    res.json(data.map((d) => ({
      product: d.product ? { id: d.product._id, name: d.product.name, price: d.product.price, image: d.product.image } : null,
      totalSold: d.totalSold,
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/v1/dashboard/category-distribution
router.get('/category-distribution', requireAdmin, async (req, res) => {
  try {
    const data = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $sort: { count: -1 } },
    ]);

    res.json(data.map((d) => ({
      category: d.category ? { id: d.category._id, name: d.category.name } : { id: null, name: 'Uncategorized' },
      count: d.count,
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/v1/dashboard/reviews-summary
router.get('/reviews-summary', requireAdmin, async (req, res) => {
  try {
    const data = await Review.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const total = data.reduce((sum, d) => sum + d.count, 0);
    const weightedSum = data.reduce((sum, d) => sum + d._id * d.count, 0);

    res.json({
      totalReviews: total,
      averageRating: total > 0 ? weightedSum / total : 0,
      ratingDistribution: data.map((d) => ({ rating: d._id, count: d.count })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/v1/dashboard/recent-orders
router.get('/recent-orders', requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ dateOrdered: -1 })
      .limit(limit)
      .select('user totalPrice status paymentStatus dateOrdered');

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
```

- [ ] **Step 2: Mount in app.js**

Add after existing router mounts in `D:\E-Backend\app.js`:
```javascript
const dashboardRouter = require('./routers/dashboard');
app.use(`${api}/dashboard`, dashboardRouter);
```

- [ ] **Step 3: Write tests**

`D:\E-Backend\tests\dashboard.test.js`:
```javascript
const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../app');
const { User } = require('../models/user');
const { Product } = require('../models/product');
const { Order } = require('../models/order');
const { Category } = require('../models/category');
const { Review } = require('../models/review');
const jwt = require('jsonwebtoken');

let adminToken;

beforeAll(async () => {
  const admin = await User.create({ name: 'Admin', email: 'admin@test.com', password: '123456', phone: '123', isAdmin: true });
  adminToken = jwt.sign({ userId: admin._id, isAdmin: true }, process.env.JWT_SECRET || 'test-secret');
});

afterAll(async () => {
  await User.deleteMany({});
  await Product.deleteMany({});
  await Order.deleteMany({});
  await Category.deleteMany({});
  await Review.deleteMany({});
});

describe('Dashboard Endpoints', () => {
  describe('GET /api/v1/dashboard/summary', () => {
    it('should return summary data for admin', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/summary')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('totalRevenue');
      expect(res.body).toHaveProperty('totalOrders');
      expect(res.body).toHaveProperty('totalProducts');
      expect(res.body).toHaveProperty('totalUsers');
      expect(res.body).toHaveProperty('ordersByStatus');
      expect(Array.isArray(res.body.ordersByStatus)).toBe(true);
    });

    it('should reject non-admin', async () => {
      const user = await User.create({ name: 'User', email: 'user@test.com', password: '123456', phone: '123' });
      const userToken = jwt.sign({ userId: user._id, isAdmin: false }, process.env.JWT_SECRET || 'test-secret');
      const res = await request(app)
        .get('/api/v1/dashboard/summary')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/v1/dashboard/revenue-over-time', () => {
    it('should return revenue data', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/revenue-over-time?period=day&days=30')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/v1/dashboard/category-distribution', () => {
    it('should return category data', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/category-distribution')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/v1/dashboard/reviews-summary', () => {
    it('should return review summary', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/reviews-summary')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('totalReviews');
      expect(res.body).toHaveProperty('averageRating');
      expect(res.body).toHaveProperty('ratingDistribution');
    });
  });

  describe('GET /api/v1/dashboard/recent-orders', () => {
    it('should return recent orders', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/recent-orders')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
```

- [ ] **Step 4: Run tests**

```bash
cd D:\E-Backend && npm test
```

- [ ] **Step 5: Commit**

```bash
cd D:\E-Backend && git add routers/dashboard.js tests/dashboard.test.js app.js && git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "feat: add dashboard aggregation endpoints with tests"
```

---

## Task 2: Frontend Dashboard Service + Charts Setup

**Files:**
- Create: `src/app/core/services/dashboard.service.ts`
- Install: `ng2-charts` + `chart.js`

- [ ] **Step 1: Install chart dependencies**

```bash
cd D:\admin-dashboard-v2 && npm install ng2-charts chart.js
```

- [ ] **Step 2: Create dashboard service**

`src/app/core/services/dashboard.service.ts`:
```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardSummary {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  totalReviews: number;
  pendingOrders: number;
  lowStockProducts: number;
  averageOrderValue: number;
  ordersByStatus: { status: string; count: number }[];
  paymentStatusBreakdown: { status: string; count: number }[];
}

export interface RevenuePoint {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface TopProduct {
  product: { id: string; name: string; price: number; image: any } | null;
  totalSold: number;
}

export interface CategoryDist {
  category: { id: string; name: string };
  count: number;
}

export interface ReviewsSummary {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { rating: number; count: number }[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}dashboard`;

  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.base}/summary`);
  }

  getRevenueOverTime(period = 'day', days = 30): Observable<RevenuePoint[]> {
    return this.http.get<RevenuePoint[]>(`${this.base}/revenue-over-time`, { params: { period, days: String(days) } });
  }

  getTopProducts(limit = 10): Observable<TopProduct[]> {
    return this.http.get<TopProduct[]>(`${this.base}/top-products`, { params: { limit: String(limit) } });
  }

  getCategoryDistribution(): Observable<CategoryDist[]> {
    return this.http.get<CategoryDist[]>(`${this.base}/category-distribution`);
  }

  getReviewsSummary(): Observable<ReviewsSummary> {
    return this.http.get<ReviewsSummary>(`${this.base}/reviews-summary`);
  }

  getRecentOrders(limit = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/recent-orders`, { params: { limit: String(limit) } });
  }
}
```

- [ ] **Step 3: Verify build**

```bash
cd D:\admin-dashboard-v2 && npx ng build --configuration development
```

- [ ] **Step 4: Commit**

```bash
cd D:\admin-dashboard-v2 && git add src/app/core/services/dashboard.service.ts package.json package-lock.json && git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "feat: add dashboard service and chart.js dependencies"
```

---

## Task 3: KPI Cards + Dashboard Layout

**Files:**
- Create: `src/app/admin/pages/dashboard/kpi-card.component.ts`
- Modify: `src/app/admin/pages/dashboard/dashboard.component.ts`

- [ ] **Step 1: Create KPI card component**

`src/app/admin/pages/dashboard/kpi-card.component.ts`:
```typescript
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  template: `
    <div class="rounded-lg border border-slate-200 bg-white p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-slate-500">{{ label }}</p>
          <p class="mt-1 text-2xl font-bold text-slate-900">{{ value }}</p>
          @if (subtitle) {
            <p class="mt-1 text-xs text-slate-400">{{ subtitle }}</p>
          }
        </div>
        <div class="rounded-lg p-3" [ngClass]="iconBg">
          <i [class]="icon + ' text-lg ' + iconColor"></i>
        </div>
      </div>
    </div>
  `,
})
export class KpiCardComponent {
  @Input() label = '';
  @Input() value: string | number = '';
  @Input() subtitle = '';
  @Input() icon = 'pi pi-chart-bar';
  @Input() iconBg = 'bg-indigo-100';
  @Input() iconColor = 'text-indigo-600';
}
```

- [ ] **Step 2: Rewrite dashboard component**

Replace `src/app/admin/pages/dashboard/dashboard.component.ts` with a full dashboard that loads data from the dashboard service and displays KPI cards, charts, and recent orders. The dashboard should:

1. Load summary data on init
2. Display 6 KPI cards: Total Revenue, Total Orders, Total Products, Total Users, Pending Orders, Low Stock
3. Show a revenue line chart (placeholder for Task 4)
4. Show an orders status donut chart (placeholder for Task 4)
5. Show category distribution pie chart (placeholder for Task 4)
6. Show recent orders table

Keep the template clean with Tailwind grid layout. Use `@for` and `@if` control flow.

- [ ] **Step 3: Verify build**

```bash
cd D:\admin-dashboard-v2 && npx ng build --configuration development
```

- [ ] **Step 4: Commit**

```bash
cd D:\admin-dashboard-v2 && git add src/app/admin/pages/dashboard/ && git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "feat: add KPI cards and dashboard layout with data loading"
```

---

## Task 4: Chart Components

**Files:**
- Create: `src/app/admin/pages/dashboard/revenue-chart.component.ts`
- Create: `src/app/admin/pages/dashboard/orders-chart.component.ts`
- Create: `src/app/admin/pages/dashboard/category-chart.component.ts`
- Create: `src/app/admin/pages/dashboard/status-chart.component.ts`

- [ ] **Step 1: Create revenue chart**

Revenue line chart showing revenue over time. Uses ng2-charts `BaseChartDirective`.

- [ ] **Step 2: Create category pie chart**

Pie chart showing products per category.

- [ ] **Step 3: Create status donut chart**

Donut chart showing orders by status.

- [ ] **Step 4: Create orders bar chart**

Bar chart showing orders over time.

- [ ] **Step 5: Wire charts into dashboard**

Update dashboard component to include all chart components in a responsive grid.

- [ ] **Step 6: Verify build**

```bash
cd D:\admin-dashboard-v2 && npx ng build --configuration development
```

- [ ] **Step 7: Commit**

```bash
cd D:\admin-dashboard-v2 && git add src/app/admin/pages/dashboard/ && git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "feat: add revenue, category, status, and orders chart components"
```

---

## Task 5: Final Dashboard Verification

- [ ] **Step 1: Production build**

```bash
cd D:\admin-dashboard-v2 && npx ng build --configuration production
```

- [ ] **Step 2: Run all tests**

```bash
cd D:\admin-dashboard-v2 && npx ng test --watch=false
```

- [ ] **Step 3: Backend tests**

```bash
cd D:\E-Backend && npm test
```

- [ ] **Step 4: Verify dev server**

```bash
cd D:\admin-dashboard-v2 && npx ng serve
```

- [ ] **Step 5: Final commit if needed**
