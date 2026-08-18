# Task 1: Permission Constants

**Files:**
- Create: `constants/permissions.js`
- Create: `test/constants/permissions.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
// test/constants/permissions.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { PERMISSIONS, GROUPS, hasPermission } = require('../../constants/permissions');

test('PERMISSIONS contains expected keys', () => {
  assert.ok(PERMISSIONS.products.create);
  assert.ok(PERMISSIONS.products.read);
  assert.ok(PERMISSIONS.products.update);
  assert.ok(PERMISSIONS.products.delete);
  assert.ok(PERMISSIONS.orders.read);
  assert.ok(PERMISSIONS.roles.manage);
  assert.ok(PERMISSIONS.dashboard.read);
});

test('GROUPS is an array of group names', () => {
  assert.ok(Array.isArray(GROUPS));
  assert.ok(GROUPS.includes('products'));
  assert.ok(GROUPS.includes('orders'));
  assert.ok(GROUPS.includes('roles'));
});

test('hasPermission checks if role permissions include a key', () => {
  const rolePermissions = ['products:create', 'products:read', 'orders:read'];
  assert.equal(hasPermission(rolePermissions, 'products:create'), true);
  assert.equal(hasPermission(rolePermissions, 'products:delete'), false);
  assert.equal(hasPermission(rolePermissions, 'orders:read'), true);
});

test('hasPermission returns false for null/undefined inputs', () => {
  assert.equal(hasPermission(null, 'products:create'), false);
  assert.equal(hasPermission([], 'products:create'), false);
  assert.equal(hasPermission(['products:create'], null), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/constants/permissions.test.js`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Write implementation**

```javascript
// constants/permissions.js
const PERMISSIONS = {
  dashboard: { read: 'dashboard:read' },
  products: {
    read: 'products:read',
    create: 'products:create',
    update: 'products:update',
    delete: 'products:delete',
  },
  categories: {
    read: 'categories:read',
    create: 'categories:create',
    update: 'categories:update',
    delete: 'categories:delete',
  },
  orders: {
    read: 'orders:read',
    update: 'orders:update',
    delete: 'orders:delete',
  },
  users: {
    read: 'users:read',
    create: 'users:create',
    update: 'users:update',
    delete: 'users:delete',
  },
  coupons: {
    read: 'coupons:read',
    create: 'coupons:create',
    update: 'coupons:update',
    delete: 'coupons:delete',
  },
  content: {
    read: 'content:read',
    create: 'content:create',
    update: 'content:update',
    delete: 'content:delete',
  },
  reviews: {
    read: 'reviews:read',
    delete: 'reviews:delete',
  },
  roles: {
    read: 'roles:read',
    create: 'roles:create',
    update: 'roles:update',
    delete: 'roles:delete',
    manage: 'roles:manage',
  },
};

const GROUPS = Object.keys(PERMISSIONS);

function hasPermission(rolePermissions, permissionKey) {
  if (!Array.isArray(rolePermissions) || !permissionKey) return false;
  return rolePermissions.includes(permissionKey);
}

module.exports = { PERMISSIONS, GROUPS, hasPermission };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/constants/permissions.test.js`
Expected: 4 tests PASS

- [ ] **Step 5: Commit**

```bash
mkdir -p constants test/constants
git add constants/permissions.js test/constants/permissions.test.js
git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "feat: add permission constants and hasPermission helper"
```
