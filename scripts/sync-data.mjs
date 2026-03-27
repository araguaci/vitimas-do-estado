/**
 * Fonte única na raiz do repositório → cópia para public/data (consumo Vite).
 * Rode antes de dev/build ou use npm run sync-data.
 */
import { copyFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const destDir = join(root, 'public', 'data');

const FILES = [
  'registry.json',
  'state-victims-brazil.json',
  'state-victims-brazil-custody-deaths.json',
  'state-victims-cases.json',
];

function validateJson(path) {
  JSON.parse(readFileSync(path, 'utf8'));
}

mkdirSync(destDir, { recursive: true });

let err = 0;
for (const f of FILES) {
  const src = join(root, f);
  if (!existsSync(src)) {
    console.error(`[sync-data] arquivo em falta: ${f}`);
    err = 1;
    continue;
  }
  try {
    validateJson(src);
  } catch (e) {
    console.error(`[sync-data] JSON inválido: ${f}`, e.message);
    err = 1;
    continue;
  }
  const dst = join(destDir, f);
  copyFileSync(src, dst);
  console.log(`[sync-data] ${f} → public/data/${f}`);
}

process.exit(err);
