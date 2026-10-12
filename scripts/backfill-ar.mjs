#!/usr/bin/env node
/**
 * Backfills Arabic ({en, ar}) localized fields for products and categories
 * on an e-commerce backend that stores localized data as { en, ar } objects.
 *
 * Usage:
 *   node scripts/backfill-ar.mjs                  # dry-run: print the plan
 *   node scripts/backfill-ar.mjs --apply          # write changes via the API
 *
 * Auth (one of):
 *   ADMIN_TOKEN="<jwt>"                     node scripts/backfill-ar.mjs --apply
 *   ADMIN_EMAIL="a@b.c" ADMIN_PASSWORD="x"  node scripts/backfill-ar.mjs --apply
 *
 * Optional:
 *   API_BASE="https://dashboard-pnlv.onrender.com/api/v1"
 *
 * Safe to re-run: only fields that are currently plain strings (missing `ar`)
 * get upgraded to { en, ar }; existing localized objects are left untouched.
 */

const BASE = process.env.API_BASE || 'https://dashboard-pnlv.onrender.com/api/v1';
const APPLY = process.argv.includes('--apply');

const NAME_AR = {
  'Zoe Wardrobe': 'خزانة زوي',
  'Juno Planter': 'زُرّاعة جونو',
  'Terra Outdoor Set': 'طقم تيرا الخارجي',
  'Noor Side Table': 'طاولة جانبية نور',
  'Vera Wall Mirror': 'مرآة حائط فيرا',
  'Sela Pendant Light': 'ثريا معلقة سيلا',
  'Eto Floor Lamp': 'أباجورة أرضية إيتو',
  'Lima Bookshelf': 'مكتبة ليما',
  'Ergo Office Chair': 'كرسي مكتب إرجو',
  'Granville Desk': 'مكتب جرانفيل',
  'Kenzi Bar Stool': 'كرسي بار كِنزي',
  'Fane Buffet': 'بوفيه فاين',
  'Prim Dining Chair': 'كرسي طعام بريم',
  'Dio Dining Table': 'طاولة طعام ديو',
  'Maia Bedside Lamp': 'أباجورة سرير مايا',
  'Clyde Nightstand': 'منضدة جانبية كلايد',
  'Rowan Dresser': 'تسريحة روان',
  'Nellie Bed': 'سرير نيلي',
  'Aria Bed Frame': 'هيكل سرير آريا',
  'Owyn TV Stand': 'ستاند تلفزيون أوين',
  'Claude Coffee Table': 'طاولة قهوة كلود',
  'Haven Armchair': 'كرسي استرخاء هيفن',
  'Valeon Sofa': 'كنبة فالون',
  'Louisa Sofa': 'كنبة لويزا',
};

const COLOR_AR = {
  Oak: 'بلوطي',
  Terracotta: 'طيني',
  Grey: 'رمادي',
  Marble: 'رخامي',
  Gold: 'ذهبي',
  'Matte Black': 'أسود مطفي',
  Walnut: 'جوزي',
  Black: 'أسود',
  Brown: 'بني',
  Brass: 'نحاسي',
  White: 'أبيض',
  Ivory: 'عاجي',
  Beige: 'بيج',
};

const BRAND_AR = {
  'Nathalie Home': 'ناتالي هوم',
  'Outdoor Living': 'أوت دور ليفينج',
  Modular: 'موديولر',
  Rove: 'روف',
  Lume: 'لوم',
  ErgoWorks: 'إرجو ووركس',
  'Paola & Pia': 'باولا و بييا',
};

const ROOM_AR = {
  Storage: 'تخزين',
  Outdoor: 'خارجية',
  Decor: 'ديكور',
  Lighting: 'إضاءة',
  Office: 'مكتب',
  'Dining Room': 'لغرفة الطعام',
  Bedroom: 'لغرفة النوم',
  'Living Room': 'لغرفة المعيشة',
};

const CATEGORY_AR = {
  Storage: 'تخزين',
  Outdoor: 'خارجي',
  Decor: 'ديكور',
  Lighting: 'إضاءة',
  Office: 'مكتب',
  'Dining Room': 'غرفة طعام',
  Bedroom: 'غرفة نوم',
  'Living Room': 'غرفة معيشة',
};

const DESC_EN = /^Premium (.+) piece from our (.+) collection\. Built with quality materials for lasting comfort and style\.$/;
const RICH_EN = /^Crafted with care, the (.+) brings modern elegance to any space\. Solid construction, easy assembly, and backed by our quality guarantee\.$/;

function enDesc(room, brand) {
  return `Premium ${room} piece from our ${brand} collection. Built with quality materials for lasting comfort and style.`;
}
function arDesc(roomAr, brandAr) {
  return `قطعة ${roomAr} فاخرة من مجموعة ${brandAr}. صُنعت بخامات عالية الجودة لضمان الراحة والأناقة وطول العمر.`;
}
function arRich(nameAr) {
  return `صُنعت بعناية، وتضيف قطعة ${nameAr} لمسة أناقة عصرية لأي مساحة في منزلك. بتصميم متين وتجميع سهل، ومدعومة بضمان جودة كامل.`;
}

function localize(fieldName, value, dict) {
  if (!value || typeof value === 'object') return null; // already localized / empty
  const ar = dict[String(value).trim()];
  if (!ar) return null;
  return { en: value, ar };
}

function translateDescription(value, fallbackEn) {
  if (!value || typeof value === 'object') return null;
  const m = DESC_EN.exec(value);
  if (!m) return null;
  const roomAr = ROOM_AR[m[1]];
  const brandAr = BRAND_AR[m[2]];
  if (!roomAr || !brandAr) return null;
  return { en: value, ar: arDesc(roomAr, brandAr) };
}

function translateRichDescription(value, name) {
  if (!value || typeof value === 'object') return null;
  const m = RICH_EN.exec(value);
  if (!m) return null;
  const nameAr = NAME_AR[m[1]] || NAME_AR[name];
  if (!nameAr) return null;
  return { en: value, ar: arRich(nameAr) };
}

function buildPatch(item, kind) {
  let patch = {};
  if (kind === 'product') {
    patch.name = localize('name', item.name, NAME_AR);
    patch.color = localize('color', item.color, COLOR_AR);
    patch.brand = localize('brand', item.brand, BRAND_AR);
    patch.description = translateDescription(item.description, item.name);
    patch.richDescription = translateRichDescription(item.richDescription, item.name);
  } else if (kind === 'category') {
    patch.name = localize('name', item.name, CATEGORY_AR);
  }
  for (const k of Object.keys(patch)) {
    if (!patch[k]) delete patch[k];
  }
  return patch;
}

async function api(path, options = {}) {
  const res = await fetch(BASE + path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }
  return { status: res.status, body };
}

async function resolveToken() {
  if (process.env.ADMIN_TOKEN) return { token: process.env.ADMIN_TOKEN };
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.error('ERROR: set ADMIN_TOKEN or ADMIN_EMAIL+ADMIN_PASSWORD.');
    process.exit(1);
  }
  const { status, body } = await api('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (status !== 200 || !body?.token) {
    console.error(`LOGIN FAILED (${status}):`, JSON.stringify(body));
    process.exit(1);
  }
  const user = await api(`/users/${body.userId}`, { headers: { Authorization: `Bearer ${body.token}` } });
  if (!user.body?.isAdmin) {
    console.error('ERROR: account is not an admin.');
    process.exit(1);
  }
  return { token: body.token };
}

async function fetchAll(path) {
  const out = [];
  const { status, body } = await api(path);
  if (status !== 200) throw new Error(`GET ${path} => ${status} ${JSON.stringify(body)}`);
  const data = Array.isArray(body) ? body : body.data;
  out.push(...data);
  let page = 1;
  while (out.length < (body.total ?? Infinity) && data?.length) {
    page += 1;
    const next = await api(`${path}${path.includes('?') ? '&' : '?'}page=${page}`);
    const nextData = Array.isArray(next.body) ? next.body : next.body.data;
    if (!nextData?.length) break;
    out.push(...nextData);
  }
  return out;
}

async function applyPatch(kind, id, patch, token) {
  const path = `/${kind}s/${id}`;
  const headers = { Authorization: `Bearer ${token}` };
  const { status, body } = await api(path, { method: 'PUT', headers, body: JSON.stringify(patch) });
  if (status === 404 || status === 405) {
    return api(path, { method: 'PATCH', headers, body: JSON.stringify(patch) }).then((r) => ({
      ...r,
      used: 'PATCH',
    }));
  }
  return { status, body, used: 'PUT' };
}

async function verifySample(token) {
  const { body } = await api('/products?limit=3', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  console.log('\n--- VERIFY (first products) ---');
  for (const p of (Array.isArray(body) ? body : body.data ?? []).slice(0, 3)) {
    console.log('-', p._id, '->', JSON.stringify(p.name));
    console.log('  desc  ->', JSON.stringify(p.description));
    console.log('  brand ->', JSON.stringify(p.brand));
  }
}

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN'}  API: ${BASE}`);

  let token = null;
  if (APPLY) {
    ({ token } = await resolveToken());
  }

  const products = await fetchAll('/products?limit=50');
  const categories = await fetchAll('/categories');
  console.log(`Fetched ${products.length} products, ${categories.length} categories.\n`);

  const changes = [];
  for (const p of products) {
    const patch = buildPatch(p, 'product');
    if (Object.keys(patch).length) changes.push({ kind: 'product', id: p._id, label: p.name, patch });
  }
  for (const c of categories) {
    const patch = buildPatch(c, 'category');
    if (Object.keys(patch).length) changes.push({ kind: 'category', id: c._id, label: c.name, patch });
  }

  if (!changes.length) {
    console.log('Nothing to backfill — all fields already localized.');
    return;
  }

  console.log(`Planned updates: ${changes.length}\n`);
  for (const { kind, id, label, patch } of changes) {
    console.log(`[${kind}] ${id} "${label}"`);
    for (const [field, v] of Object.entries(patch)) {
      console.log(`   ${field}.ar = ${v.ar}`);
    }
  }

  if (!APPLY) {
    console.log('\nDry-run only. Re-run with --apply to write. (Admin token required.)');
    return;
  }

  let ok = 0;
  let failed = 0;
  for (const { kind, id, patch } of changes) {
    const { status, used } = await applyPatch(kind, id, patch, token);
    if (status === 200) {
      ok += 1;
      console.log(`OK (${used}) ${kind}/${id}`);
    } else {
      failed += 1;
      console.log(`FAIL (status=${status}) ${kind}/${id} ${JSON.stringify(patch).slice(0, 160)}`);
    }
  }
  console.log(`\nDone: ${ok} updated, ${failed} failed.`);
  await verifySample(token);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});