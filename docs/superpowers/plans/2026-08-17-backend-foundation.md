# Backend Foundation — Auth + RBAC

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Add dynamic RBAC, refresh token auth, shared admin middleware to Express/Mongoose backend.

**Architecture:** Role + RefreshToken models, shared `requirePermission` middleware, roles CRUD, refresh token flow (access 15min + refresh 7d), user model update.

**Tech Stack:** Express 4, Mongoose 8, express-jwt 6, jsonwebtoken, node:test, supertest

**Repo:** `D:\E-Backend`

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Create | `constants/permissions.js` | Permission key constants + hasPermission helper |
| Create | `models/role.js` | Role schema |
| Create | `models/refresh-token.js` | RefreshToken schema with TTL index |
| Create | `helpers/permission.js` | Shared requirePermission, requireAdmin, requireOwner |
| Create | `routers/roles.js` | Roles CRUD |
| Create | `routers/auth.js` | Auth refresh + logout |
| Modify | `models/user.js` | Add role field |
| Modify | `helpers/jwt.js` | Add auth routes to public list |
| Modify | `routers/users.js` | Login returns refreshToken, register assigns default role |
| Modify | `routers/orders.js` | Use shared requireAdmin |
| Modify | `routers/coupons.js` | Use shared requireAdmin |
| Modify | `routers/content.js` | Use shared requireAdmin |
| Modify | `routers/products.js` | Add requirePermission for write ops |
| Modify | `routers/categories.js` | Add requirePermission for write ops |
| Modify | `app.js` | Mount roles + auth routers |

See individual task files for full implementation details:
- [task-1-permissions.md](./backend-foundation/task-1-permissions.md)
- [task-2-role-model.md](./backend-foundation/task-2-role-model.md)
- [task-3-refresh-token-model.md](./backend-foundation/task-3-refresh-token-model.md)
- [task-4-user-model-update.md](./backend-foundation/task-4-user-model-update.md)
- [task-5-permission-middleware.md](./backend-foundation/task-5-permission-middleware.md)
- [task-6-auth-routes.md](./backend-foundation/task-6-auth-routes.md)
- [task-7-roles-routes.md](./backend-foundation/task-7-roles-routes.md)
- [task-8-mount-routers.md](./backend-foundation/task-8-mount-routers.md)
- [task-9-migrate-existing-routers.md](./backend-foundation/task-9-migrate-existing-routers.md)
- [task-10-seed-default-role.md](./backend-foundation/task-10-seed-default-role.md)
