# Task 5: Shared Permission Middleware

**Files:**
- Create: `helpers/permission.js`
- Create: `test/helpers/permission.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
// test/helpers/permission.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
require('dotenv/config');
const { requirePermission, requireAdmin, requireOwner } = require('../../helpers/permission');

function token(payload) {
  return jwt.sign(payload, process.env.SECRET, { expiresIn: '1h' });
}

function appWithMiddleware(mw) {
  const app = express();
  app.use(express.json());
  app.get('/check', mw, (req, res) => res.json({ ok: true }));
  app.use((err, req, res, next) => res.status(err.status || 500).json({ message: err.message }));
  return app;
}

test('requirePermission allows user with matching permission', async () => {
  const t = token({ userId: 'u1', isAdmin: false, role: { permissions: ['products:read'] } });
  const app = appWithMiddleware(requirePermission('products:read'));
  const res = await request(app).get('/check').set('Authorization', `Bearer ${t}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);
});

test('requirePermission denies user without matching permission', async () => {
  const t = token({ userId: 'u1', isAdmin: false, role: { permissions: ['orders:read'] } });
  const app = appWithMiddleware(requirePermission('products:read'));
  const res = await request(app).get('/check').set('Authorization', `Bearer ${t}`);
  assert.equal(res.status, 403);
});

test('requirePermission allows admin with isAdmin flag', async () => {
  const t = token({ userId: 'u1', isAdmin: true });
  const app = appWithMiddleware(requirePermission('products:read'));
  const res = await request(app).get('/check').set('Authorization', `Bearer ${t}`);
  assert.equal(res.status, 200);
});

test('requirePermission denies unauthenticated request', async () => {
  const app = appWithMiddleware(requirePermission('products:read'));
  const res = await request(app).get('/check');
  assert.equal(res.status, 401);
});

test('requireAdmin allows admin user', async () => {
  const t = token({ userId: 'u1', isAdmin: true });
  const app = appWithMiddleware(requireAdmin);
  const res = await request(app).get('/check').set('Authorization', `Bearer ${t}`);
  assert.equal(res.status, 200);
});

test('requireAdmin denies non-admin user', async () => {
  const t = token({ userId: 'u1', isAdmin: false });
  const app = appWithMiddleware(requireAdmin);
  const res = await request(app).get('/check').set('Authorization', `Bearer ${t}`);
  assert.equal(res.status, 403);
});

test('requireOwner allows owner of resource', async () => {
  const t = token({ userId: 'u1', isAdmin: false });
  const app = express();
  app.use(express.json());
  app.get('/check/:id', requireOwner((req) => req.params.id), (req, res) => res.json({ ok: true }));
  app.use((err, req, res, next) => res.status(err.status || 500).json({ message: err.message }));
  const res = await request(app).get('/check/u1').set('Authorization', `Bearer ${t}`);
  assert.equal(res.status, 200);
});

test('requireOwner allows admin for any resource', async () => {
  const t = token({ userId: 'u2', isAdmin: true });
  const app = express();
  app.use(express.json());
  app.get('/check/:id', requireOwner((req) => req.params.id), (req, res) => res.json({ ok: true }));
  app.use((err, req, res, next) => res.status(err.status || 500).json({ message: err.message }));
  const res = await request(app).get('/check/u1').set('Authorization', `Bearer ${t}`);
  assert.equal(res.status, 200);
});

test('requireOwner denies non-owner non-admin', async () => {
  const t = token({ userId: 'u2', isAdmin: false });
  const app = express();
  app.use(express.json());
  app.get('/check/:id', requireOwner((req) => req.params.id), (req, res) => res.json({ ok: true }));
  app.use((err, req, res, next) => res.status(err.status || 500).json({ message: err.message }));
  const res = await request(app).get('/check/u1').set('Authorization', `Bearer ${t}`);
  assert.equal(res.status, 403);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/helpers/permission.test.js`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Write implementation**

```javascript
// helpers/permission.js

function requirePermission(permissionKey) {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({ message: 'authentication required' });
    }
    if (req.auth.isAdmin) return next();
    const permissions = req.auth.role && req.auth.role.permissions;
    if (Array.isArray(permissions) && permissions.includes(permissionKey)) {
      return next();
    }
    return res.status(403).json({ message: 'insufficient permissions' });
  };
}

function requireAdmin(req, res, next) {
  if (!req.auth || !req.auth.isAdmin) {
    return res.status(403).json({ message: 'admin only' });
  }
  next();
}

function requireOwner(getOwnerId) {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({ message: 'authentication required' });
    }
    if (req.auth.isAdmin) return next();
    const ownerId = typeof getOwnerId === 'function' ? getOwnerId(req) : getOwnerId;
    if (req.auth.userId === String(ownerId)) return next();
    return res.status(403).json({ message: 'not allowed' });
  };
}

module.exports = { requirePermission, requireAdmin, requireOwner };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/helpers/permission.test.js`
Expected: 10 tests PASS

- [ ] **Step 5: Commit**

```bash
git add helpers/permission.js test/helpers/permission.test.js
git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "feat: add shared requirePermission, requireAdmin, requireOwner middleware"
```
