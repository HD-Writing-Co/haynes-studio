/**
 * Back2Life Designs — One-time Payhip connector for the automatic storefront.
 *
 * This does NOT publish any paid ZIP files, create products, or process payments.
 * It updates the existing catalog generator to read scripts/payhip-products.json,
 * display real prices, and show external Payhip product links next to Live Demo.
 *
 * Does not overwrite the existing generator with an older template.
 * If the catalog generator differs materially, fail safely instead of guessing.
 */
import { readFile, writeFile, stat } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const root = resolve(process.cwd());
const generatorPath = join(root, 'scripts', 'build-template-catalog.mjs');
const storefrontPath = join(root, 'dist', 'pre-made-templates', 'index.html');
const configPath = join(root, 'scripts', 'payhip-products.json');
const marker = '/* BACK2LIFE PAYHIP CHECKOUT INTEGRATION */';
const cssMarker = '/* BACK2LIFE PAYHIP CHECKOUT BUTTON */';

const fail = (m) => { throw new Error(m + '\nNo changes have been written. Open README-PAYHIP-SETUP.md for help.'); };
const exists = async (p) => { try { return (await stat(p)).isFile(); } catch { return false; } };

if (!(await exists(generatorPath))) fail('Could not find scripts/build-template-catalog.mjs. Run this script from the haynes-studio project ROOT folder.');
if (!(await exists(storefrontPath))) fail('Could not find dist/pre-made-templates/index.html.');
if (!(await exists(configPath))) fail('Could not find scripts/payhip-products.json.');

const config = JSON.parse(await readFile(configPath, 'utf8'));
for (const [slug, p] of Object.entries(config)) {
  if (!/^https:\/\/payhip\.com\/b\/[a-zA-Z0-9]+$/.test(p.url || '')) fail(`Invalid Payhip product link for ${slug}: ${p.url}`);
  if (!p.priceLabel || !p.buttonText) fail(`Missing label or button text for ${slug}`);
}

let gen = await readFile(generatorPath, 'utf8');
let html = await readFile(storefrontPath, 'utf8');

const genIsPatched = gen.includes(marker);
if (!genIsPatched) {
  const replaceOnce = (needle, replacement, label) => {
    if (!gen.includes(needle)) fail(`The current catalog generator doesn't have the expected ${label} section. The script stopped to avoid overwriting your changes.`);
    if (gen.indexOf(needle) !== gen.lastIndexOf(needle)) fail(`More than one ${label} section was found. No changes made.`);
    gen = gen.replace(needle, replacement);
  };

  replaceOnce(
    "const storefrontPath = join(directory, 'index.html');",
    `const storefrontPath = join(directory, 'index.html');\n${marker}\nconst checkoutProducts = JSON.parse(await readFile(join(projectRoot, 'scripts', 'payhip-products.json'), 'utf8'));`,
    'storefront path'
  );
  replaceOnce(
    "  const download = item.download ?",
    "  const buyLink = item.purchaseUrl ? `<a class=\"store-link-buy\" href=\"${esc(item.purchaseUrl)}\" target=\"_blank\" rel=\"noopener noreferrer\" aria-label=\"${esc(item.purchaseText)} — ${esc(item.name)} on Payhip\">${esc(item.purchaseText)} <span aria-hidden=\"true\">↗</span></a>` : '';\n  const download = item.download ?",
    'download button'
  );
  replaceOnce('${link}${details}${download}', '${link}${buyLink}${details}${download}', 'catalog action buttons');
  replaceOnce(
    "  items.push({\n    slug,",
    `  const purchase = checkoutProducts[slug] || null;\n  items.push({\n    slug,`,
    'catalog item collection'
  );
  replaceOnce(
    "    tier,\n    badge: text(meta.badge),",
    "    tier: purchase ? 'premium' : tier,\n    badge: purchase ? 'PAID TEMPLATE' : text(meta.badge),",
    'tier and badge'
  );
  replaceOnce(
    "    priceLabel: text(meta.priceLabel, tier === 'free' ? 'Free starter · Demo available' : 'Pricing to be announced'),",
    "    priceLabel: purchase ? purchase.priceLabel : text(meta.priceLabel, tier === 'free' ? 'Free starter · Demo available' : 'Pricing to be announced'),\n    purchaseUrl: purchase ? purchase.url : '',\n    purchaseText: purchase ? purchase.buttonText : '',",
    'price and Payhip button metadata'
  );
  replaceOnce(
    "${premium} premium preview${premium === 1 ? '' : 's'}.",
    "${premium} premium template${premium === 1 ? '' : 's'}.",
    'storefront summary'
  );
}

if (!html.includes('<!-- AUTO-CATALOG:START -->') || !html.includes('<!-- AUTO-CATALOG:END -->')) {
  fail('The storefront has no automatic catalog markers.');
}
if (!html.includes(cssMarker)) {
  if (!html.includes('</style>')) fail('The storefront has no inline stylesheet to insert the Buy button styling.');
  html = html.replace('</style>', `${cssMarker}\n.storefront .store-link-buy{display:inline-flex;align-items:center;gap:10px;padding:13px 18px;min-height:46px;background:#193b33;color:#fff!important;text-decoration:none;border:1px solid #193b33;border-radius:10px;font-weight:800;font-size:.91rem;line-height:1.2;transition:background-color .18s ease}\n.storefront .store-link-buy:hover{background:#0c2b22;color:#fff!important}\n.storefront .store-link-buy:focus-visible{outline:3px solid #2688d1;outline-offset:3px}\n@media(prefers-reduced-motion:reduce){.storefront .store-link-buy{transition:none}}\n</style>`);
}

if (!genIsPatched) await writeFile(generatorPath, gen, 'utf8');
if (!((await readFile(storefrontPath,'utf8')).includes(cssMarker))) await writeFile(storefrontPath, html, 'utf8');

const productSlugs = Object.keys(config);
const dir = join(root, 'dist', 'pre-made-templates');
const seen = [];
for (const slug of productSlugs) {
  if (await exists(join(dir, slug, 'index.html'))) seen.push(slug);
}
console.log(genIsPatched ? '✓ Catalog generator already supports Payhip.': '✓ Added Payhip purchase button support to catalog generator.');
console.log('✓ Payhip button styling is in the storefront.');
console.log('✓ Found linked product folders:', seen.length ? seen.join(', ') : '(none—check folder slugs)');
console.log('NEXT: node scripts/build-template-catalog.mjs');
console.log('THEN: Preview http://localhost:8000/pre-made-templates/index.html');
console.log('NOTE: Buttons point to Payhip product pages, not a fabricated checkout endpoint.');
