#!/usr/bin/env node
// The Angular build writes the English bundle into dist/.../browser/en and bakes
// `<base href="/en/">` into index.html, so every relative asset request resolves
// to /en/<file>. Firebase Hosting serves the configured public dir at the root,
// where those paths 404 and fall through to index.html (MIME type text/html),
// which makes the browser refuse every module script.
//
// This stages a flat copy of the en bundle with <base href="/"> instead, and
// points public at it. The Arabic bundle under browser/ar keeps its own /ar/ base.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'dist', 'ecommerce-v2', 'browser', 'en');
const OUT = path.join(ROOT, 'dist', 'hosting', 'en');

if (!fs.existsSync(SRC)) {
  console.error(`Missing build output: ${SRC}\nRun "npm run build" first.`);
  process.exit(1);
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.cpSync(SRC, OUT, { recursive: true });

const indexPath = path.join(OUT, 'index.html');
const before = fs.readFileSync(indexPath, 'utf8');
const after = before.replace('<base href="/en/">', '<base href="/">');
if (before === after) {
  console.warn('Note: no <base href="/en/"> found; index.html left unchanged.');
}
fs.writeFileSync(indexPath, after);

const count = fs.readdirSync(OUT).length;
console.log(`Staged ${count} entries from browser/en -> dist/hosting/en (base href rewritten to "/")`);
