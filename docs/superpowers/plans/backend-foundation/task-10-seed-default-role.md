# Task 10: Seed Default Admin Role + Update Login/Register

**Files:**
- Modify: `routers/users.js` (login returns refreshToken, register assigns default role)
- Modify: `helpers/seed-content.js` (seed default roles)

- [ ] **Step 1: Update users.js login to return refreshToken**

At the top of `routers/users.js`, add:

```javascript
const { RefreshToken } = require('../models/refresh-token');
const { Role } = require('../models/role');
const { generateAccessToken, generateRefreshToken } = require('./auth');
```

In the login route handler, after verifying password and finding user, populate the role:

```javascript
// In POST /login, after password check succeeds:
const userWithRole = await User.findById(user._id).populate('role');

const accessToken = generateAccessToken(userWithRole);
const refreshToken = generateRefreshToken(user._id);

// Save refresh token
const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
const rt = new RefreshToken({ token: refreshToken, user: user._id, expiresAt });
await rt.save();

res.send({
  user: userWithRole.email,
  token: accessToken,
  refreshToken,
  userId: userWithRole._id,
});
```

- [ ] **Step 2: Update users.js register to assign default role**

In the register route, after creating the user, find and assign the default role:

```javascript
// After user.save():
const defaultRole = await Role.findOne({ isDefault: true });
if (defaultRole) {
  user.role = defaultRole._id;
  await user.save();
}
```

- [ ] **Step 3: Create seed helper for default roles**

Create or update `helpers/seed-roles.js`:

```javascript
// helpers/seed-roles.js
const { Role } = require('../models/role');
const { PERMISSIONS } = require('../constants/permissions');

const DEFAULT_ROLES = [
  {
    name: 'Super Admin',
    permissions: Object.values(PERMISSIONS).flatMap(group => Object.values(group)),
    isDefault: false,
  },
  {
    name: 'Admin',
    permissions: [
      PERMISSIONS.dashboard.read,
      PERMISSIONS.products.read, PERMISSIONS.products.create, PERMISSIONS.products.update, PERMISSIONS.products.delete,
      PERMISSIONS.categories.read, PERMISSIONS.categories.create, PERMISSIONS.categories.update, PERMISSIONS.categories.delete,
      PERMISSIONS.orders.read, PERMISSIONS.orders.update, PERMISSIONS.orders.delete,
      PERMISSIONS.users.read, PERMISSIONS.users.create, PERMISSIONS.users.update, PERMISSIONS.users.delete,
      PERMISSIONS.coupons.read, PERMISSIONS.coupons.create, PERMISSIONS.coupons.update, PERMISSIONS.coupons.delete,
      PERMISSIONS.content.read, PERMISSIONS.content.create, PERMISSIONS.content.update, PERMISSIONS.content.delete,
      PERMISSIONS.reviews.read, PERMISSIONS.reviews.delete,
    ],
    isDefault: false,
  },
  {
    name: 'Editor',
    permissions: [
      PERMISSIONS.dashboard.read,
      PERMISSIONS.products.read, PERMISSIONS.products.create, PERMISSIONS.products.update,
      PERMISSIONS.categories.read, PERMISSIONS.categories.create, PERMISSIONS.categories.update,
      PERMISSIONS.content.read, PERMISSIONS.content.create, PERMISSIONS.content.update,
      PERMISSIONS.reviews.read,
    ],
    isDefault: false,
  },
  {
    name: 'Customer',
    permissions: [],
    isDefault: true,
  },
];

async function seedRoles() {
  for (const roleData of DEFAULT_ROLES) {
    const existing = await Role.findOne({ name: roleData.name });
    if (!existing) {
      await Role.create(roleData);
      console.log(`Seeded role: ${roleData.name}`);
    }
  }
}

module.exports = { seedRoles };
```

- [ ] **Step 4: Call seedRoles in index.js**

In `index.js`, after `ensureDefaultContent()`, add:

```javascript
const { seedRoles } = require('./helpers/seed-roles');
// In the .then() callback after mongoose.connect:
await ensureDefaultContent();
await seedRoles();
```

- [ ] **Step 5: Run all tests**

Run: `node --test`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add routers/users.js helpers/seed-roles.js index.js
git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "feat: update login to return refresh token, register to assign default role, seed default roles"
```

---

## Verification

After all tasks are complete, run the full test suite:

```bash
node --test
```

Expected: All tests PASS (existing + new).

Then manually verify by starting the server:

```bash
node index.js
```

Test the refresh flow:
```bash
# 1. Login (will need a real user in DB)
curl -X POST http://localhost:3000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test1234"}'

# 2. Use the refreshToken from response to refresh
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<token from step 1>"}'

# 3. Logout
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<new refresh token>"}'
```
