# Task 8: Mount New Routers in app.js

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Add role and auth router imports**

After existing router requires, add:

```javascript
const rolesRouter = require('./routers/roles');
const authRouter = require('./routers/auth');
```

- [ ] **Step 2: Mount the new routers**

After existing `app.use` lines, add:

```javascript
app.use(`${api}/roles`, rolesRouter);
app.use(`${api}/auth`, authRouter);
```

- [ ] **Step 3: Verify existing tests still pass**

Run: `node --test test/app.test.js`
Expected: PASS

- [ ] **Step 4: Run all tests**

Run: `node --test`
Expected: All existing tests PASS, new tests PASS

- [ ] **Step 5: Commit**

```bash
git add app.js
git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "feat: mount roles and auth routers in app.js"
```
