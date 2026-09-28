#!/usr/bin/env node
// Seed reviews through the deployed API. ADD-ONLY: never deletes or updates existing data.
// The API only accepts reviews from a user that has a verified (non-cancelled) order
// containing the product, so seeding works for products the login account actually bought.

const API_URL = (process.env.API_URL || 'https://dashboard-pnlv.onrender.com/api/v1').replace(/\/$/, '');
const EMAIL = process.env.REVIEW_SEED_EMAIL || arg('email');
const PASSWORD = process.env.REVIEW_SEED_PASSWORD || arg('password');
const TOKEN = process.env.REVIEW_SEED_TOKEN || arg('token');
const IDS = (arg('ids') || '').split(',').map((s) => s.trim()).filter(Boolean);
const PER_PRODUCT = parseInt(arg('per-product') || '2', 10);
const FORCE = process.argv.includes('--force');
const DRY_RUN = process.argv.includes('--dry-run');

if (!TOKEN && (!EMAIL || !PASSWORD)) {
  printUsage();
  process.exit(1);
}

const COMMENTS = [
  'Exactly what I needed, the finish is superb.',
  'Very comfortable and looks great in my home.',
  'Solid product, though the color was slightly different from photos.',
  'Great craftsmanship and sturdy materials.',
  'Very happy with this purchase, customer service was helpful.',
  'Good value for the price. Would buy again.',
  'Beautiful design and quick delivery.',
];

let token = TOKEN;

function arg(name) {
  const prefix = `--${name}=`;
  const found = process.argv.find((a) => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : '';
}

function printUsage() {
  console.log(`
Seed reviews through the API (add-only, never deletes).

Usage:
  node scripts/seed-reviews-api.mjs --email=<login> --password=<login> [options]
  node scripts/seed-reviews-api.mjs --token=<jwt> [options]

Options:
  --api=<url>       API base URL (default: deployed backend)
  --ids=<ids>       comma-separated product ids (default: products that have no reviews)
  --per-product=<n> reviews per product (default: 2)
  --force           also add reviews to products that already have reviews
  --dry-run         login + list targets only, no inserts

Env (alternative): REVIEW_SEED_EMAIL, REVIEW_SEED_PASSWORD, REVIEW_SEED_TOKEN, API_URL
`);
}

async function login() {
  const res = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`login failed (${res.status}): ${body.message || JSON.stringify(body)}`);
  token = body.token;
  console.log(`Logged in as ${EMAIL}`);
}

async function call(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { ok: res.ok, status: res.status, body };
}

async function waitForBackend() {
  for (let i = 1; i <= 12; i++) {
    try {
      const res = await call('/products?page=1&limit=1');
      if (res.ok) return;
    } catch { /* backend still waking up */ }
    console.log(`Backend not ready, retrying (${i}/15)...`);
    await new Promise((r) => setTimeout(r, 10000));
  }
  throw new Error('backend did not wake up within ~2 minutes');
}

async function fetchAllProducts() {
  const all = [];
  let page = 1;
  const limit = 100;
  for (;;) {
    const res = await call(`/products?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error(`failed to list products (${res.status}): ${res.body?.message || ''}`);
    const data = res.body.data ?? [];
    all.push(...data);
    if (page >= (res.body.totalPages ?? 1)) break;
    page += 1;
  }
  return all;
}

async function productReviewCount(productId) {
  const res = await call(`/products/${productId}/reviews?page=1&limit=1`);
  if (!res.ok) return 0;
  return res.body.total ?? 0;
}

async function main() {
  if (!TOKEN) await login();
  else console.log('Using provided token.');
  await waitForBackend();

  const products = await fetchAllProducts();
  console.log(`Found ${products.length} products.`);

  const targets = IDS.length
    ? products.filter((p) => IDS.includes(p.id ?? p._id))
    : products;
  if (targets.length === 0) {
    console.log('No target products matched.');
    return;
  }

  let inserted = 0;
  let skipped = 0;
  let noPurchase = 0;

  for (const product of targets) {
    const id = product.id ?? product._id;
    const name = typeof product.name === 'string' ? product.name : product.name?.en ?? id;
    if (!FORCE && (product.numbReviews ?? 0) > 0) {
      console.log(`SKIP  ${name} (already has ${product.numbReviews} reviews)`);
      skipped += 1;
      continue;
    }
    const total = await productReviewCount(id);
    if (!FORCE && total > 0) {
      console.log(`SKIP  ${name} (list shows ${total} reviews)`);
      skipped += 1;
      continue;
    }

    for (let i = 0; i < PER_PRODUCT; i++) {
      const rating = 4 + Math.floor(Math.random() * 2);
      const comment = COMMENTS[(COMMENTS.length - 1 - i) % COMMENTS.length];
      if (DRY_RUN) {
        console.log(`DRY ${name} rating=${rating}`);
        continue;
      }
      const res = await call(`/products/${id}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment }),
      });
      if (res.ok) {
        inserted += 1;
        console.log(`POST ${name} rating=${rating} -> ${res.status}`);
      } else if (res.status === 403) {
        noPurchase += 1;
        console.log(`DENY ${name} (no verified purchase): ${res.body?.message}`);
        break;
      } else if (res.status === 401) {
        await login();
        const retry = await call(`/products/${id}/reviews`, {
          method: 'POST',
          body: JSON.stringify({ rating, comment }),
        });
        if (retry.ok) { inserted += 1; console.log(`POST ${name} rating=${rating} -> ${retry.status}`); }
        else if (retry.status === 403) { noPurchase += 1; console.log(`DENY ${name} (no verified purchase): ${retry.body?.message}`); break; }
        else { console.log(`FAIL ${name} (${retry.status}): ${retry.body?.message}`); }
      } else {
        console.log(`FAIL ${name} (${res.status}): ${res.body?.message}`);
      }
    }
  }

  console.log(`\nDone. inserted=${inserted} skipped=${skipped} no-verified-purchase=${noPurchase}`);
  if (noPurchase > 0) {
    console.log('Products without a verified purchase were skipped; use a customer account that has an order for them, or run the DB seed (scripts/seed-reviews.js in D:\\E-Backend).');
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});