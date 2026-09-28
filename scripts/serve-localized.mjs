import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, normalize, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = normalize(fileURLToPath(new URL('../dist/ecommerce-v2/browser', import.meta.url)));
const initialPort = Number(process.env.PORT) || 52155;
let port = initialPort;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

function safePath(locale, rest) {
  const candidate = normalize(join(root, locale, rest));
  if (candidate === root || !candidate.startsWith(root + sep)) {
    throw new Error('Path escapes root');
  }
  return candidate;
}

async function serveFile(res, filePath) {
  const body = await readFile(filePath);
  const type = MIME[extname(filePath).toLowerCase()] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': type });
  res.end(body);
}

async function serveIndex(res, locale) {
  const index = join(root, locale, 'index.html');
  const body = await readFile(index);
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(body);
}

const server = createServer(async (req, res) => {
  try {
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
    } catch {
      pathname = '/';
    }

    if (pathname === '/' || pathname === '') {
      res.writeHead(302, { Location: '/en/' });
      res.end();
      return;
    }

    const match = pathname.match(/^\/(en|ar)(?:\/(.*))?$/);
    if (!match) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    const locale = match[1];
    const rest = match[2] ?? 'index.html';

    // Serve real assets (hashed js/css/fonts/images under the locale folder).
    const filePath = safePath(locale, rest);
    const info = await stat(filePath);
    if (info.isFile()) {
      await serveFile(res, filePath);
      return;
    }
    // Directory request (e.g. /ar/ or /en/) -> index.html.
    await serveIndex(res, locale);
  } catch {
    try {
      // SPA fallback: any client-side route inside a locale -> that locale's index.html
      const fallback = new URL(req.url ?? '/', 'http://localhost').pathname;
      const m = fallback.match(/^\/(en|ar)(?:\/.*)?$/);
      const locale = m ? m[1] : 'en';
      await serveIndex(res, locale);
    } catch {
      if (!res.headersSent) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not found');
      }
    }
  }
});

function startServer(port) {
  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE' && port < initialPort + 20) {
      console.log(`Port ${port} is in use, trying the next free port...`);
      startServer(port + 1);
    } else {
      console.error(err);
      process.exit(1);
    }
  });
  server.listen(port, () => {
    console.log(`Serving localized app at http://localhost:${port}`);
    console.log(`  English (LTR): http://localhost:${port}/en/`);
    console.log(`  Arabic  (RTL): http://localhost:${port}/ar/`);
  });
}

startServer(port);