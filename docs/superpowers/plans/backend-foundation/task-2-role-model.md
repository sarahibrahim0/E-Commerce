# Task 2: Role Model

**Files:**
- Create: `models/role.js`
- Create: `test/models/role.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
// test/models/role.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { Role, roleSchema } = require('../../models/role');

test('Role model exists and has expected fields', () => {
  const paths = Object.keys(roleSchema.paths);
  assert.ok(paths.includes('name'), 'has name field');
  assert.ok(paths.includes('permissions'), 'has permissions field');
  assert.ok(paths.includes('isDefault'), 'has isDefault field');
  assert.ok(paths.includes('createdAt'), 'has createdAt field');
});

test('Role name is required and unique', () => {
  const namePath = roleSchema.path('name');
  assert.equal(namePath.instance, 'String');
  assert.equal(namePath.isRequired, true);
  assert.equal(namePath.options.unique, true);
});

test('Role permissions is an array of strings', () => {
  const permPath = roleSchema.path('permissions');
  assert.equal(permPath.instance, 'Array');
  assert.equal(permPath.caster.instance, 'String');
});

test('Role isDefault defaults to false', () => {
  const isDefaultPath = roleSchema.path('isDefault');
  assert.equal(isDefaultPath.instance, 'Boolean');
  assert.equal(isDefaultPath.options.default, false);
});

test('Role has virtual id field', () => {
  assert.ok(roleSchema.virtuals.id, 'has id virtual');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/models/role.test.js`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Write implementation**

```javascript
// models/role.js
const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  permissions: [{
    type: String,
  }],
  isDefault: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

roleSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

roleSchema.set('toJSON', { virtuals: true });

exports.Role = mongoose.model('Role', roleSchema);
exports.roleSchema = roleSchema;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/models/role.test.js`
Expected: 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add models/role.js test/models/role.test.js
git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "feat: add Role model with name, permissions, isDefault"
```
