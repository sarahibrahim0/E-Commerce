# Task 9: Migrate Existing Routers to Shared Middleware

**Files:**
- Modify: `routers/orders.js` (replace local requireAdmin/requireOwner with shared)
- Modify: `routers/coupons.js` (replace local requireAdmin with shared)
- Modify: `routers/content.js` (replace local requireAdmin with shared)
- Modify: `routers/products.js` (add requirePermission for POST/PUT/DELETE)
- Modify: `routers/categories.js` (add requirePermission for POST/PUT/DELETE)

- [ ] **Step 1: Migrate orders.js**

Remove the local `requireAdmin` and `requireOwner` functions from `routers/orders.js`. Add at top:

```javascript
const { requireAdmin, requireOwner } = require('../helpers/permission');
```

Change `requireAdmin(req, res)` calls to `requireAdmin(req, res, () => {})` pattern, or better — refactor to use as middleware:

For routes that currently do `if (!requireAdmin(req, res)) return;`, change to use the middleware pattern:

```javascript
// Before:
router.get(`/`, async (req, res) => {
  if (!requireAdmin(req, res)) return;
  ...
});

// After:
router.get('/', requireAdmin, async (req, res) => {
  ...
});
```

Apply this pattern to all admin-only routes in orders.js: `GET /`, `PUT /:id`, `DELETE /:id`, `GET /get/totalsales`, `GET /get/count`.

For `requireOwner` routes (`GET /:id`, `GET /getuserorders/:userid`, `POST /:id/cancel`), use:

```javascript
const { requireOwner } = require('../helpers/permission');

router.get('/:id', requireOwner((req) => req.params.id), async (req, res) => {
  // Still need to fetch order and check user field manually for complex cases
  ...
});
```

Note: For complex ownership checks (where the owner ID comes from a DB lookup), keep the manual check but use the shared `requireAdmin` for admin bypass.

- [ ] **Step 2: Migrate coupons.js**

Remove local `requireAdmin`. Add:

```javascript
const { requireAdmin } = require('../helpers/permission');
```

Change all `if (!requireAdmin(req, res)) return;` to middleware pattern.

- [ ] **Step 3: Migrate content.js**

Remove local `requireAdmin`. Add:

```javascript
const { requireAdmin } = require('../helpers/permission');
```

Note: content.js has a special `requireAdmin` that falls back to manual JWT parsing for public-exempt routes. For POST/PUT/DELETE routes, use the shared middleware directly. The manual fallback is not needed since those routes go through global JWT.

- [ ] **Step 4: Add requirePermission to products.js**

Add at top of `routers/products.js`:

```javascript
const { requirePermission } = require('../helpers/permission');
```

Wrap write routes with permission middleware:

```javascript
router.post('/', requirePermission('products:create'), upload.single('image'), async (req, res) => { ... });
router.put('/gallery-images/:id', requirePermission('products:update'), upload.array('images', 10), async (req, res) => { ... });
router.put('/:id', requirePermission('products:update'), upload.single('image'), async (req, res) => { ... });
router.delete('/:id', requirePermission('products:delete'), async (req, res) => { ... });
```

- [ ] **Step 5: Add requirePermission to categories.js**

Add at top of `routers/categories.js`:

```javascript
const { requirePermission } = require('../helpers/permission');
```

Wrap write routes:

```javascript
router.post('/', requirePermission('categories:create'), async (req, res) => { ... });
router.put('/:id', requirePermission('categories:update'), async (req, res) => { ... });
router.delete('/:id', requirePermission('categories:delete'), async (req, res) => { ... });
```

- [ ] **Step 6: Run all tests**

Run: `node --test`
Expected: All tests PASS (no regressions)

- [ ] **Step 7: Commit**

```bash
git add routers/orders.js routers/coupons.js routers/content.js routers/products.js routers/categories.js
git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "refactor: migrate routers to shared requirePermission middleware"
```
