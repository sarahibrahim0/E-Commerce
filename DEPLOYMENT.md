# Deployment Guide

## Prerequisites

- Firebase CLI (`npm install -g firebase-tools`) + `firebase login`
- Render account (https://dashboard.render.com)
- Stripe dashboard (https://dashboard.stripe.com)
- MongoDB Atlas (https://cloud.mongodb.com)

---

## 1. Backend (Render)

### One-time setup

1. Push `E-Backend` to GitHub
2. On Render → New → Web Service → Connect repo
3. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
   - **Node Version:** 18+ (set in env or `.node-version`)

### Environment Variables (Render Dashboard → Environment)

```
MONGO_URL=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/E-shopDB?retryWrites=true&w=majority
SECRET=<your-jwt-secret>
API_URL=/api/v1
FRONTEND_URL=https://<your-firebase-app>.web.app
STRIPE_SECRET=sk_test_51NWyWY...
STRIPE_WEBHOOK_SECRET=whsec_<from-stripe-dashboard>
EMAIL_USER=<gmail-address>
EMAIL_PASS=<gmail-app-password>
CONTACT_EMAIL=<your-inbox>
```

### Get the Render URL

After deploy, Render gives you a URL like `https://your-app.onrender.com`.
Note this — the frontend needs it.

---

## 2. Frontend (Firebase Hosting)

### One-time setup

```bash
cd ecommerce-v2
firebase login
firebase init  # select your project, hosting
```

### Update environment for production

Edit `src/environments/environment.ts`:
- Set `apiUrl` to your Render URL: `'https://your-app.onrender.com/api/v1/'`

### Build and deploy

```bash
npx ng build --configuration production
firebase deploy --only hosting
```

Firebase gives you `https://<project>.web.app`.

---

## 3. Stripe Webhook

1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint:
   - **URL:** `https://your-app.onrender.com/api/v1/webhooks/stripe`
   - **Events:** `checkout.session.completed`, `checkout.session.expired`
3. Copy the signing secret (`whsec_...`)
4. Update `STRIPE_WEBHOOK_SECRET` in Render env vars
5. Redeploy the backend (or restart the service)

---

## 4. MongoDB Atlas — IP Whitelist

1. Go to https://cloud.mongodb.com → Network Access
2. Add IP Address:
   - **For Render:** Add `0.0.0.0/0` (Render uses dynamic IPs)
   - **Or** add Render's IP ranges if you prefer stricter control
3. Save

---

## 5. Verify

### Backend health
```bash
curl https://your-app.onrender.com/api/v1/products
curl https://your-app.onrender.com/api/v1/content/about
```

### Frontend
Open `https://<project>.web.app` in browser.

### Full flow
1. Register a new account
2. Browse products, add to cart
3. Checkout with Stripe test card: `4242 4242 4242 4242`
4. Verify order appears in Profile → Orders
5. Check About/Contact pages load content from API

---

## Local Development

### Backend
```bash
cd E-Backend
npm install
node index.js  # starts on :3000
```

### Frontend
```bash
cd ecommerce-v2
npm install
ng serve  # starts on :4200, proxies API to localhost:3000
```

The `environment.development.ts` is auto-used by `ng serve` (points to `localhost:3000`).
