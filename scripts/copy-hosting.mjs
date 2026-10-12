import { rm, cp } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(projectRoot, 'dist', 'ecommerce-v2', 'browser');
const dest = join(projectRoot, 'dist', 'hosting');

await rm(dest, { recursive: true, force: true });
await cp(src, dest, { recursive: true });
console.log(`Copied ${src} -> ${dest}`);