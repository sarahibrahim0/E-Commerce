# Task 4: Update User Model with Role Field

**Files:**
- Modify: `models/user.js` (add role field)
- Modify: `test/models/role.test.js` (add integration test)

- [ ] **Step 1: Write the failing test**

Add to end of `test/models/role.test.js`:

```javascript
const { User, userSchema } = require('../../models/user');

test('User model has role field', () => {
  const paths = Object.keys(userSchema.paths);
  assert.ok(paths.includes('role'), 'has role field');
});

test('User role is an ObjectId ref to Role', () => {
  const rolePath = userSchema.path('role');
  assert.equal(rolePath.instance, 'ObjectId');
  assert.equal(rolePath.options.ref, 'Role');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/models/role.test.js`
Expected: FAIL on new tests (role field not found)

- [ ] **Step 3: Write implementation**

Add to `models/user.js` before the closing of `userSchema`:

```javascript
// Add after isAdmin field
role: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Role',
  default: null,
},
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/models/role.test.js`
Expected: 7 tests PASS (5 original + 2 new)

- [ ] **Step 5: Commit**

```bash
git add models/user.js test/models/role.test.js
git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "feat: add role field to User model"
```
