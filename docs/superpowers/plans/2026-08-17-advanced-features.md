# Advanced Features — Admin Dashboard

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** WebSocket notifications, Two-Factor Auth (TOTP), Audit Logs, and CSV/Excel export for the admin dashboard.

**Architecture:** Backend-first: install deps, create models/endpoints, then frontend integration.

**Repo:** `D:\admin-dashboard-v2` (frontend), `D:\E-Backend` (backend)

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Modify | `D:\E-Backend\package.json` | Add socket.io, speakeasy, exceljs |
| Create | `D:\E-Backend\helpers\socket.js` | Socket.io server setup |
| Modify | `D:\E-Backend\index.js` | Attach socket to HTTP server |
| Create | `D:\E-Backend\models\audit-log.js` | Audit log model |
| Create | `D:\E-Backend\routers\audit-logs.js` | Audit log endpoints |
| Create | `D:\E-Backend\routers\two-factor.js` | 2FA setup/verify/disable |
| Create | `D:\E-Backend\routers\export.js` | CSV/Excel export endpoints |
| Modify | `D:\E-Backend\models\user.js` | Add 2FA fields |
| Modify | `D:\E-Backend\routers\users.js` | Integrate 2FA into login |
| Create | `src/app/core/services/socket.service.ts` | Frontend socket client |
| Create | `src/app/core/services/two-factor.service.ts` | Frontend 2FA service |
| Create | `src/app/core/services/audit-log.service.ts` | Frontend audit log service |
| Create | `src/app/core/services/export.service.ts` | Frontend export service |
| Create | `src/app/admin/pages/audit-logs/audit-logs-list.component.ts` | Audit logs page |
| Create | `src/app/admin/pages/settings/two-factor.component.ts` | 2FA settings page |
| Create | `src/app/admin/pages/settings/settings.routes.ts` | Settings routes |
| Modify | `src\app\admin\layout\sidebar.component.ts` | Add Audit Logs + Settings nav |

---

## Task 1: Audit Log Model + Endpoints

**Files:**
- Create: `D:\E-Backend\models\audit-log.js`
- Create: `D:\E-Backend\routers\audit-logs.js`
- Create: `D:\E-Backend\tests\audit-logs.test.js`
- Modify: `D:\E-Backend\app.js`

- [ ] **Step 1: Create AuditLog model**

`D:\E-Backend\models\audit-log.js`:
```javascript
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  entity: { type: String, required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  changes: { type: mongoose.Schema.Types.Mixed },
  ip: { type: String },
  userAgent: { type: String },
}, { timestamps: true });

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ entity: 1, entityId: 1 });
auditLogSchema.index({ user: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
```

- [ ] **Step 2: Create audit log helper**

`D:\E-Backend\helpers\audit.js`:
```javascript
const AuditLog = require('../models/audit-log');

async function logAction({ action, entity, entityId, user, changes, req }) {
  try {
    await AuditLog.create({
      action,
      entity,
      entityId,
      user,
      changes,
      ip: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.get('user-agent'),
    });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
}

module.exports = { logAction };
```

- [ ] **Step 3: Create audit log router**

`D:\E-Backend\routers\audit-logs.js`:
```javascript
const express = require('express');
const router = express.Router();
const AuditLog = require('../models/audit-log');
const { requireAdmin } = require('../helpers/permission');

// GET /api/v1/audit-logs
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, entity, action, userId } = req.query;
    const filter = {};
    if (entity) filter.entity = entity;
    if (action) filter.action = action;
    if (userId) filter.user = userId;

    const total = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ logs, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/v1/audit-logs/entities
router.get('/entities', requireAdmin, async (req, res) => {
  try {
    const entities = await AuditLog.distinct('entity');
    res.json(entities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
```

- [ ] **Step 4: Mount in app.js**

Add after existing router mounts:
```javascript
const auditLogsRouter = require('./routers/audit-logs');
app.use(`${api}/audit-logs`, auditLogsRouter);
```

- [ ] **Step 5: Write tests**

`D:\E-Backend\tests\audit-logs.test.js`:
```javascript
const request = require('supertest');
const { app } = require('../app');
const { User } = require('../models/user');
const AuditLog = require('../models/audit-log');
const jwt = require('jsonwebtoken');

let adminToken;

beforeAll(async () => {
  const admin = await User.create({ name: 'Admin', email: 'admin@audit.com', password: '123456', phone: '123', isAdmin: true });
  adminToken = jwt.sign({ userId: admin._id, isAdmin: true }, process.env.JWT_SECRET || 'test-secret');
});

afterAll(async () => {
  await User.deleteMany({ email: 'admin@audit.com' });
  await AuditLog.deleteMany({});
});

describe('Audit Log Endpoints', () => {
  it('GET /api/v1/audit-logs should return paginated logs', async () => {
    const res = await request(app)
      .get('/api/v1/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('logs');
    expect(res.body).toHaveProperty('total');
    expect(Array.isArray(res.body.logs)).toBe(true);
  });

  it('GET /api/v1/audit-logs should reject non-admin', async () => {
    const user = await User.create({ name: 'User', email: 'user@audit.com', password: '123456', phone: '123' });
    const userToken = jwt.sign({ userId: user._id, isAdmin: false }, process.env.JWT_SECRET || 'test-secret');
    const res = await request(app)
      .get('/api/v1/audit-logs')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('GET /api/v1/audit-logs/entities should return distinct entities', async () => {
    const res = await request(app)
      .get('/api/v1/audit-logs/entities')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
```

- [ ] **Step 6: Run tests**

```bash
cd D:\E-Backend && npm test
```

- [ ] **Step 7: Commit**

```bash
cd D:\E-Backend && git add models/audit-log.js helpers/audit.js routers/audit-logs.js tests/audit-logs.test.js app.js && git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "feat: add audit log model, helper, and endpoints with tests"
```

---

## Task 2: Two-Factor Auth (TOTP)

**Files:**
- Modify: `D:\E-Backend\models\user.js` — add 2FA fields
- Create: `D:\E-Backend\routers\two-factor.js` — setup/verify/disable endpoints
- Modify: `D:\E-Backend\routers\users.js` — integrate 2FA into login flow
- Create: `D:\E-Backend\tests\two-factor.test.js`

- [ ] **Step 1: Add 2FA fields to User model**

Add to `D:\E-Backend\models\user.js` schema:
```javascript
twoFactorSecret: { type: String, default: null },
twoFactorEnabled: { type: Boolean, default: false },
```

- [ ] **Step 2: Install speakeasy + qrcode**

```bash
cd D:\E-Backend && npm install speakeasy qrcode
```

- [ ] **Step 3: Create 2FA router**

`D:\E-Backend\routers\two-factor.js`:
```javascript
const express = require('express');
const router = express.Router();
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { User } = require('../models/user');

// POST /api/v1/2fa/setup — generate secret + QR code
router.post('/setup', async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const secret = speakeasy.generateSecret({
      name: `E-Commerce Admin (${user.email})`,
      issuer: 'E-Commerce',
    });

    user.twoFactorSecret = secret.base32;
    await user.save();

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({ secret: secret.base32, qrCode: qrCodeUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/v1/2fa/verify — verify token and enable 2FA
router.post('/verify', async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { token } = req.body;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user || !user.twoFactorSecret) return res.status(400).json({ message: '2FA not setup' });

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) return res.status(400).json({ message: 'Invalid token' });

    user.twoFactorEnabled = true;
    await user.save();

    res.json({ message: '2FA enabled successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/v1/2fa/disable — disable 2FA
router.post('/disable', async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { token } = req.body;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user || !user.twoFactorEnabled) return res.status(400).json({ message: '2FA not enabled' });

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) return res.status(400).json({ message: 'Invalid token' });

    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    await user.save();

    res.json({ message: '2FA disabled successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/v1/2fa/status — get 2FA status
router.get('/status', async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId).select('twoFactorEnabled');
    res.json({ enabled: user?.twoFactorEnabled || false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
```

- [ ] **Step 4: Integrate 2FA into login**

In `D:\E-Backend\routers\users.js`, after the password verification in the login route, check if 2FA is enabled. If so, return a partial token and require a second step:

```javascript
// After password check succeeds:
if (user.twoFactorEnabled) {
  return res.json({
    user: user.email,
    requires2FA: true,
    tempToken: jwt.sign({ userId: user._id, temp: true }, process.env.JWT_SECRET, { expiresIn: '5m' }),
  });
}
```

Add a new endpoint `POST /api/v1/users/login/2fa` that verifies the TOTP token and returns the full tokens.

- [ ] **Step 5: Mount in app.js**

```javascript
const twoFactorRouter = require('./routers/two-factor');
app.use(`${api}/2fa`, twoFactorRouter);
```

- [ ] **Step 6: Write tests**

- [ ] **Step 7: Run tests**

```bash
cd D:\E-Backend && npm test
```

- [ ] **Step 8: Commit**

```bash
cd D:\E-Backend && git add models/user.js routers/two-factor.js routers/users.js tests/two-factor.test.js app.js package.json package-lock.json && git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "feat: add two-factor auth (TOTP) with setup, verify, and disable"
```

---

## Task 3: CSV/Excel Export

**Files:**
- Create: `D:\E-Backend\routers\export.js`
- Create: `D:\E-Backend\tests\export.test.js`
- Modify: `D:\E-Backend\app.js`
- Modify: `D:\E-Backend\package.json` — install exceljs

- [ ] **Step 1: Install exceljs**

```bash
cd D:\E-Backend && npm install exceljs
```

- [ ] **Step 2: Create export router**

`D:\E-Backend\routers\export.js`:
```javascript
const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const { requireAdmin } = require('../helpers/permission');
const { Order } = require('../models/order');
const { Product } = require('../models/product');
const { User } = require('../models/user');

// GET /api/v1/export/orders
router.get('/orders', requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ dateOrdered: -1 });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Orders');

    sheet.columns = [
      { header: 'Order ID', key: 'id', width: 25 },
      { header: 'Customer', key: 'customer', width: 25 },
      { header: 'Total', key: 'total', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Payment', key: 'payment', width: 15 },
      { header: 'Date', key: 'date', width: 20 },
    ];

    orders.forEach((o) => {
      sheet.addRow({
        id: o._id.toString(),
        customer: o.user?.name || o.user?.email || '-',
        total: o.totalPrice,
        status: o.status,
        payment: o.paymentStatus,
        date: o.dateOrdered?.toISOString(),
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=orders.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/v1/export/products
router.get('/products', requireAdmin, async (req, res) => {
  try {
    const products = await Product.find().populate('category', 'name').sort({ dateCreated: -1 });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Products');

    sheet.columns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Price', key: 'price', width: 15 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Stock', key: 'stock', width: 15 },
      { header: 'Rating', key: 'rating', width: 10 },
      { header: 'Featured', key: 'featured', width: 12 },
      { header: 'Date Created', key: 'date', width: 20 },
    ];

    products.forEach((p) => {
      sheet.addRow({
        name: p.name,
        price: p.price,
        category: p.category?.name || '-',
        stock: p.countInStock,
        rating: p.rating,
        featured: p.isFeatured ? 'Yes' : 'No',
        date: p.dateCreated?.toISOString(),
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=products.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/v1/export/users
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ _id: -1 });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Users');

    sheet.columns = [
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Admin', key: 'admin', width: 10 },
      { header: 'City', key: 'city', width: 20 },
      { header: 'Country', key: 'country', width: 15 },
    ];

    users.forEach((u) => {
      sheet.addRow({
        name: u.name,
        email: u.email,
        phone: u.phone,
        admin: u.isAdmin ? 'Yes' : 'No',
        city: u.city || '-',
        country: u.country || '-',
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
```

- [ ] **Step 3: Mount in app.js**

```javascript
const exportRouter = require('./routers/export');
app.use(`${api}/export`, exportRouter);
```

- [ ] **Step 4: Write tests**

- [ ] **Step 5: Run tests**

```bash
cd D:\E-Backend && npm test
```

- [ ] **Step 6: Commit**

```bash
cd D:\E-Backend && git add routers/export.js tests/export.test.js app.js package.json package-lock.json && git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "feat: add CSV/Excel export endpoints for orders, products, users"
```

---

## Task 4: WebSocket Notifications

**Files:**
- Create: `D:\E-Backend\helpers\socket.js`
- Modify: `D:\E-Backend\index.js` — attach socket.io
- Modify: `D:\E-Backend\routers\orders.js` — emit order events
- Create: `src\app\core\services\socket.service.ts` — frontend socket client

- [ ] **Step 1: Install socket.io**

```bash
cd D:\E-Backend && npm install socket.io
```

- [ ] **Step 2: Create socket helper**

`D:\E-Backend\helpers\socket.js`:
```javascript
const { Server } = require('socket.io');

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

function emitEvent(event, data) {
  if (io) io.emit(event, data);
}

module.exports = { initSocket, getIO, emitEvent };
```

- [ ] **Step 3: Attach to HTTP server**

In `D:\E-Backend\index.js`, wrap `app` with `http.createServer` and pass to `initSocket`:

```javascript
const http = require('http');
const { initSocket } = require('./helpers/socket');

const server = http.createServer(app);
initSocket(server);

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
```

- [ ] **Step 4: Emit events from order routes**

In `D:\E-Backend\routers\orders.js`, after order status updates, emit socket events:

```javascript
const { emitEvent } = require('../helpers/socket');

// After updating order status:
emitEvent('order:updated', { orderId: order._id, status: order.status });
```

- [ ] **Step 5: Create frontend socket service**

`src\app\core\services\socket.service.ts`:
```typescript
import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket | null = null;
  readonly connected = signal(false);
  readonly notifications = signal<{ event: string; data: any; time: Date }[]>([]);

  connect(): void {
    if (this.socket?.connected) return;
    this.socket = io(environment.apiUrl.replace('/api/v1/', ''), { transports: ['websocket'] });
    this.socket.on('connect', () => this.connected.set(true));
    this.socket.on('disconnect', () => this.connected.set(false));
    this.socket.on('order:updated', (data) => this.addNotification('order:updated', data));
    this.socket.on('order:created', (data) => this.addNotification('order:created', data));
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.connected.set(false);
  }

  private addNotification(event: string, data: any): void {
    this.notifications.update((n) => [{ event, data, time: new Date() }, ...n].slice(0, 50));
  }

  clearNotifications(): void {
    this.notifications.set([]);
  }
}
```

- [ ] **Step 6: Install socket.io-client**

```bash
cd D:\admin-dashboard-v2 && npm install socket.io-client
```

- [ ] **Step 7: Verify build + tests**

```bash
cd D:\E-Backend && npm test
cd D:\admin-dashboard-v2 && npx ng build --configuration development && npx ng test --watch=false
```

- [ ] **Step 8: Commit**

```bash
cd D:\E-Backend && git add helpers/socket.js index.js routers/orders.js package.json package-lock.json && git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "feat: add WebSocket notifications with socket.io"
cd D:\admin-dashboard-v2 && git add src/app/core/services/socket.service.ts package.json package-lock.json && git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "feat: add frontend socket service for real-time notifications"
```

---

## Task 5: Frontend Pages + Sidebar

**Files:**
- Create: `src\app\admin\pages\audit-logs\audit-logs-list.component.ts`
- Create: `src\app\admin\pages\audit-logs\audit-logs.routes.ts`
- Create: `src\app\admin\pages\settings\two-factor.component.ts`
- Create: `src\app\admin\pages\settings\settings.routes.ts`
- Modify: `src\app\admin\layout\sidebar.component.ts`
- Modify: `src\app\app.routes.ts`

- [ ] **Step 1: Create audit logs page**
- [ ] **Step 2: Create 2FA settings page**
- [ ] **Step 3: Create settings routes**
- [ ] **Step 4: Update sidebar with Audit Logs + Settings nav**
- [ ] **Step 5: Wire routes into app.routes.ts**
- [ ] **Step 6: Verify build**
- [ ] **Step 7: Commit**

---

## Task 6: Full Verification

- [ ] **Step 1: Production build (frontend)**
- [ ] **Step 2: All frontend tests**
- [ ] **Step 3: All backend tests**
- [ ] **Step 4: Git status check**
- [ ] **Step 5: Final commit if needed**
