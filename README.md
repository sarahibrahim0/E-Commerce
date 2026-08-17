# E-Commerce Storefront

Angular 22 storefront — standalone, zoneless, signals-first, Tailwind-only — consuming a REST API with Stripe checkout.

## Quick Start

```bash
npm install
npm start        # or: npx ng serve
```

Open http://localhost:4200.

## Backend

The app targets a REST API at `https://dashboard-pnlv.onrender.com/api/v1/` by default.
For local development switch the base URL in `src/environments/environment.ts`.

Required backend endpoints: products, categories, auth, orders, coupons, addresses, reviews, and PageContent.

## Scripts

| Command | Description |
|---------|-------------|
| `ng serve` | Dev server with HMR |
| `ng test` | Unit tests — Karma + Jasmine, headless Chrome |
| `ng build` | Production build |
| `ng build --configuration production` | Optimised production build |

## Stripe Test Mode

Use test card **4242 4242 4242 4242** with any future expiry and CVC during checkout.
Stripe public key is configured in `src/environments/environment.ts`.

## Page Content

About and Contact pages are powered by the backend `PageContent` API (`GET /content/:key`).
These can be edited from the admin dashboard without redeploying the storefront.

## Tech Stack

- Angular 22 (standalone components, zoneless change detection)
- Angular Signals (all state management)
- Tailwind CSS 4 (utility-first, no component stylesheets)
- Karma + Jasmine (headless Chrome)
- Stripe.js v4 (redirect checkout)
