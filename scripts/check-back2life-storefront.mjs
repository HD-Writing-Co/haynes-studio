/**
 * Read-only health check for Back2Life Designs' eight Payhip templates.
 * Does NOT modify source files, checkouts, or public/private downloadable ZIPs.
 * Run from anywhere: node scripts/check-back2life-storefront.mjs
 */
import { readFile, access } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const templates = join(root, 'dist', 'pre-made-templates');
const exists = async (p) => access(p).then(() => true, () => false);
const readJSON = async (p) => JSON.parse(await readFile(p, 'utf8'));
const expect = [
  ['Ridgeline Roofing', '$49', 'https://payhip.com/b/GdYCe', ['ridgeline']],
  ['Ironwood Construction Pro', '$129', 'https://payhip.com/b/JTE1I', ['ironwood-construction-pro-theme', 'ironwood-construction-pro-theme-storefront-preview']],
  ['Veloura Beauty Pro', '$129', 'https://payhip.com/b/xCiDY', ['veloura-beauty-pro-theme']],
  ['Sable & Saffron', '$149', 'https://payhip.com/b/gSWhw', ['sable-saffron-restaurant-pro-theme']],
  ['Home Services Starter', 'FREE', 'https://payhip.com/b/dl15m', ['home-services-starter']],
  ['Beauty & Personal Care Starter', 'FREE', 'https://payhip.com/b/VHZya', ['beauty-personal-care-starter-free', 'beauty-personal-care-starter']],
  ['Table & Thyme', 'FREE', 'https://payhip.com/b/Jx6ZG', ['table-thyme-template-free', 'restaurant-food-starter']],
  ['Northline Auto', 'FREE', 'https://payhip.com/b/eG2EI', ['northline-auto-template']],
];
const catalogPath = join(templates, 'index.html');
const html = await readFile(catalogPath, 'utf8');
const paidFile = join(root, 'scripts', 'payhip-products.json');
const freeFile = join(root, 'scripts', 'payhip-free-products.json');
const paid = await exists(paidFile) ? await readJSON(paidFile) : {};
const free = await exists(freeFile) ? await readJSON(freeFile) : {};
let warnings = 0;
console.log('Back2Life Designs storefront diagnostic');
console.log('Project:', root, '\n');
for (const [name, price, url, folders] of expect) {
  const available = [];
  for (const slug of folders) if (await exists(join(templates, slug, 'index.html'))) available.push(slug);
  const catalogHasLink = html.includes(url);
  const pageHasLink = await Promise.all(available.map(async (slug) => (await readFile(join(templates, slug, 'index.html'), 'utf8')).includes(url)));
  const configFound = [...Object.values(paid), ...Object.values(free)].some(p => p?.url === url);
  const ok = available.length && catalogHasLink && pageHasLink.some(Boolean) && configFound;
  console.log(`${ok ? 'OK  ' : 'FIX '} ${name.padEnd(30)} ${price.padEnd(5)} | folders: ${available.length} | catalog link: ${catalogHasLink ? 'yes' : 'NO'} | page link: ${pageHasLink.some(Boolean) ? 'yes' : 'NO'} | config: ${configFound ? 'yes' : 'NO'}`);
  if (!ok) warnings++;
}
console.log('');
const articleCount = (html.match(/<article\b[^>]*class="[^"]*\bstore-listing\b/gi) || []).length;
console.log(`Catalog card count: ${articleCount} (expected 8)`);
if (articleCount !== 8) warnings++;
const buildScript = join(root, 'scripts', 'build-template-catalog.mjs');
const buildText = await exists(buildScript) ? await readFile(buildScript, 'utf8') : '';
const callsUpdater = buildText.includes("apply-payhip-everywhere.mjs");
console.log('Catalog invokes Payhip updater:', callsUpdater ? 'yes' : 'NO');
if (!callsUpdater) warnings++;
const vercelPath = join(root, 'vercel.json');
if (await exists(vercelPath)) {
  const vc = await readJSON(vercelPath);
  console.log('vercel.json buildCommand:', vc.buildCommand ?? '(not set)');
  console.log('vercel.json outputDirectory:', vc.outputDirectory ?? '(not set)');
  if (!(vc.buildCommand || '').includes('scripts/build-template-catalog.mjs') || vc.outputDirectory !== 'dist') {
    console.log('FIX Vercel must build the generated catalog and deploy dist.'); warnings++;
  }
} else { console.log('FIX No root vercel.json. Configure build command and output directory in Vercel project settings.'); warnings++; }
console.log(`\n${warnings ? `${warnings} issue(s) remain` : 'All 8 product links and deployment configuration checks passed locally.'}`);
if (warnings) process.exitCode = 1;
