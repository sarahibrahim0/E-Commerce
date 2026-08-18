# Task 3: RefreshToken Model

**Files:**
- Create: `models/refresh-token.js`
- Create: `test/models/refresh-token.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
// test/models/refresh-token.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { RefreshToken, refreshTokenSchema } = require('../../models/refresh-token');

test('RefreshToken model exists and has expected fields', () => {
  const paths = Object.keys(refreshTokenSchema.paths);
  assert.ok(paths.includes('token'), 'has token field');
  assert.ok(paths.includes('user'), 'has user field');
  assert.ok(paths.includes('expiresAt'), 'has expiresAt field');
});

test('RefreshToken token is required and unique', () => {
  const tokenPath = refreshTokenSchema.path('token');
  assert.equal(tokenPath.instance, 'String');
  assert.equal(tokenPath.isRequired, true);
  assert.equal(tokenPath.options.unique, true);
});

test('RefreshToken user is an ObjectId ref to User', () => {
  const userPath = refreshTokenSchema.path('user');
  assert.equal(userPath.instance, 'ObjectId');
  assert.equal(userPath.options.ref, 'User');
  assert.equal(userPath.isRequired, true);
});

test('RefreshToken expiresAt is required', () => {
  const expiresPath = refreshTokenSchema.path('expiresAt');
  assert.equal(expiresPath.isRequired, true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/models/refresh-token.test.js`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Write implementation**

```javascript
// models/refresh-token.js
const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
});

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

exports.RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
exports.refreshTokenSchema = refreshTokenSchema;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/models/refresh-token.test.js`
Expected: 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add models/refresh-token.js test/models/refresh-token.test.js
git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "feat: add RefreshToken model with TTL index"
```
