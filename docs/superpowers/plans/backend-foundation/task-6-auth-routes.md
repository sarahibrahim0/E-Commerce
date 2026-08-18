# Task 6: Auth Routes (Refresh + Logout)

**Files:**
- Create: `routers/auth.js`
- Create: `test/routes/auth-refresh.test.js`
- Modify: `helpers/jwt.js` (add auth routes to public list)

- [ ] **Step 1: Write the failing test**

```javascript
// test/routes/auth-refresh.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const jwt = require('jsonwebtoken');
require('dotenv/config');
const app = require('../../app');
const { RefreshToken } = require('../../models/refresh-token');

function accessToken(payload) {
  return jwt.sign(payload, process.env.SECRET, { expiresIn: '15m' });
}

test('POST /api/v1/auth/refresh returns new tokens for valid refresh token', async () => {
  const userId = 'u_refresh_1';
  const refreshTkn = jwt.sign({ userId }, process.env.SECRET, { expiresIn: '7d' });
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const mockFindOne = async (query) => {
    if (query.token === refreshTkn) return { token: refreshTkn, user: userId, expiresAt };
    return null;
  };
  const mockDeleteOne = async () => ({});
  const mockSave = async () => ({});

  const origFindOne = RefreshToken.findOne;
  const origDeleteOne = RefreshToken.deleteOne;
  const origSave = RefreshToken.prototype.save;
  RefreshToken.findOne = mockFindOne;
  RefreshToken.deleteOne = mockDeleteOne;
  RefreshToken.prototype.save = mockSave;

  try {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: refreshTkn });
    assert.equal(res.status, 200);
    assert.ok(res.body.accessToken, 'returns accessToken');
    assert.ok(res.body.refreshToken, 'returns refreshToken');
  } finally {
    RefreshToken.findOne = origFindOne;
    RefreshToken.deleteOne = origDeleteOne;
    RefreshToken.prototype.save = origSave;
  }
});

test('POST /api/v1/auth/refresh returns 401 for invalid refresh token', async () => {
  const mockFindOne = async () => null;
  const origFindOne = RefreshToken.findOne;
  RefreshToken.findOne = mockFindOne;

  try {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'invalid_token_xyz' });
    assert.equal(res.status, 401);
  } finally {
    RefreshToken.findOne = origFindOne;
  }
});

test('POST /api/v1/auth/refresh returns 400 for missing refresh token', async () => {
  const res = await request(app)
    .post('/api/v1/auth/refresh')
    .send({});
  assert.equal(res.status, 400);
});

test('POST /api/v1/auth/logout deletes refresh token', async () => {
  let deleted = false;
  const mockDeleteOne = async (query) => { deleted = true; return {}; };
  const origDeleteOne = RefreshToken.deleteOne;
  RefreshToken.deleteOne = mockDeleteOne;

  try {
    const t = accessToken({ userId: 'u1', isAdmin: false });
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${t}`)
      .send({ refreshToken: 'some_token' });
    assert.equal(res.status, 200);
    assert.equal(deleted, true);
  } finally {
    RefreshToken.deleteOne = origDeleteOne;
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/routes/auth-refresh.test.js`
Expected: FAIL with 404 (route not found)

- [ ] **Step 3: Write implementation**

```javascript
// routers/auth.js
const express = require('express');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const { RefreshToken } = require('../models/refresh-token');

const router = express.Router();

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

function generateAccessToken(user) {
  return jwt.sign(
    {
      userId: user._id || user.id,
      isAdmin: user.isAdmin,
      role: user.role ? {
        _id: user.role._id || user.role.id,
        name: user.role.name,
        permissions: user.role.permissions || [],
      } : undefined,
    },
    process.env.SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

function generateRefreshToken(userId) {
  return jwt.sign({ userId }, process.env.SECRET, { expiresIn: `${REFRESH_TOKEN_EXPIRY_DAYS}d` });
}

router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: 'refreshToken is required' });
  }

  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.SECRET);
  } catch {
    return res.status(401).json({ message: 'invalid or expired refresh token' });
  }

  const stored = await RefreshToken.findOne({ token: refreshToken });
  if (!stored) {
    return res.status(401).json({ message: 'refresh token not found' });
  }

  if (stored.expiresAt < new Date()) {
    await RefreshToken.deleteOne({ token: refreshToken });
    return res.status(401).json({ message: 'refresh token expired' });
  }

  // Rotate: delete old, create new
  await RefreshToken.deleteOne({ token: refreshToken });

  const newRefreshToken = generateRefreshToken(payload.userId);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  const rt = new RefreshToken({ token: newRefreshToken, user: payload.userId, expiresAt });
  await rt.save();

  const newAccessToken = jwt.sign(
    { userId: payload.userId, isAdmin: payload.isAdmin, role: payload.role },
    process.env.SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
}));

router.post('/logout', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await RefreshToken.deleteOne({ token: refreshToken });
  }
  res.json({ message: 'logged out' });
}));

module.exports = router;
module.exports.generateAccessToken = generateAccessToken;
module.exports.generateRefreshToken = generateRefreshToken;
```

- [ ] **Step 4: Update jwt.js public routes**

Add to the `unless.path` array in `helpers/jwt.js`:

```javascript
{ url: /api\/v1\/auth\/refresh(.*)/, methods: ['POST', 'OPTIONS'] },
{ url: /api\/v1\/auth\/logout(.*)/, methods: ['POST', 'OPTIONS'] },
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test test/routes/auth-refresh.test.js`
Expected: 4 tests PASS

- [ ] **Step 6: Commit**

```bash
git add routers/auth.js helpers/jwt.js test/routes/auth-refresh.test.js
git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "feat: add auth refresh and logout routes with token rotation"
```
