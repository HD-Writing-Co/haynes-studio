/**
 * Back2Life Designs — Payhip storefront post-build updater (paid + free).
 *
 * REPLACES the earlier apply-payhip-everywhere.mjs. The existing
 * build-template-catalog.mjs can keep its one-line post-build import.
 *
 * Paid products remain in payhip-products.json (UNCHANGED).
 * Free products live in payhip-free-products.json; this keeps the existing
 * catalog generator from incorrectly turning $0 items into premium items.
 *
 * Idempotent: safe to run on every build; no duplicate buttons or banners.
 * Public HTML gets Payhip checkout links only, NEVER private paid ZIPs.
 */
import { readFile, writeFile, stat } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const templatesDir = join(root, 'dist', 'pre-made-templates');
const paid = JSON.parse(await readFile(join(root, 'scripts', 'payhip-products.json'), 'utf8'));
const free = JSON.parse(await readFile(join(root, 'scripts', 'payhip-free-products.json'), 'utf8'));
const all = { ...paid, ...free };
const START = '<!-- B2L-PAYHIP-START -->';
const END = '<!-- B2L-PAYHIP-END -->';
const escapeHtml = (v) => String(v ?? '')
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const isFile = async (p) => { try { return (await stat(p)).isFile(); } catch { return false; } };
const payhipLink = /^https:\/\/payhip\.com\/b\/[A-Za-z0-9]+$/;
for (const [slug, p] of Object.entries(all)) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) throw new Error(`Invalid folder slug: ${slug}`);
  if (!p.name || !payhipLink.test(p.url)) throw new Error(`Invalid Payhip configuration for ${slug}`);
  if (Object.hasOwn(paid, slug) && !/^\$\d+(?:\.\d{2})?$/.test(p.price)) {
    throw new Error(`Missing/invalid paid price for ${slug}`);
  }
}

const CSS = `<style id="b2l-payhip-style">
.b2l-checkout-ribbon{box-sizing:border-box;position:relative;z-index:999;background:#12372f;color:#fff!important;display:flex;align-items:center;justify-content:center;gap:12px 24px;padding:12px 20px;font:600 14px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;text-align:center;flex-wrap:wrap;border-bottom:2px solid #c59b5c}
.b2l-checkout-ribbon *{box-sizing:border-box}.b2l-checkout-ribbon strong{color:#fff;font-weight:800}.b2l-checkout-ribbon .b2l-price{color:#fff;font-size:18px;font-weight:800}
.b2l-checkout-ribbon .b2l-buy{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:9px 18px;background:#f4e8d2;border:2px solid #f4e8d2;border-radius:999px;color:#12372f!important;font-weight:800;text-decoration:none;white-space:normal}
.b2l-checkout-ribbon .b2l-buy:hover{background:#fff;border-color:#fff;text-decoration:none}.b2l-checkout-ribbon a:focus-visible{outline:3px solid #73cfff;outline-offset:3px}
body.storefront .store-listing-actions .store-link-buy,body.storefront .store-listing-actions .store-link-free{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 18px;min-height:44px;background:#145d46;color:#fff!important;font-weight:800;text-decoration:none;border-radius:100px;border:2px solid #145d46}
body.storefront .store-listing-actions .store-link-buy:hover,body.storefront .store-listing-actions .store-link-free:hover{background:#104534;border-color:#104534}
body.storefront .store-listing-actions .store-link-buy:focus-visible,body.storefront .store-listing-actions .store-link-free:focus-visible{outline:3px solid #2688d1;outline-offset:3px}
@media(max-width:600px){.b2l-checkout-ribbon{gap:8px 14px;padding:12px}.b2l-checkout-ribbon .b2l-brand{width:100%}}
</style>`;

// Update the same style block in-place, rather than stacking new style tags.
function insertStyle(html) {
  const oldStyle = /<style\b[^>]*\bid=["']b2l-payhip-style["'][^>]*>[\s\S]*?<\/style\s*>/i;
  if (oldStyle.test(html)) return html.replace(oldStyle, CSS);
  if (!/<\/head\s*>/i.test(html)) throw new Error('Missing </head> in HTML page');
  return html.replace(/<\/head\s*>/i, `${CSS}\n</head>`);
}

function getProduct(slug) {
  if (Object.hasOwn(free, slug)) return { ...free[slug], kind: 'free', price: 'FREE', button: 'Get Free Template' };
  if (Object.hasOwn(paid, slug)) return { ...paid[slug], kind: 'paid', button: `Buy for ${paid[slug].price}` };
  return null;
}

function ribbon(p) {
  const label = p.kind === 'free' ? 'Free website template preview' : 'Template purchase information';
  const intro = p.kind === 'free' ? 'Free template preview' : 'Template preview';
  const action = p.kind === 'free' ? 'Get Free Template' : 'Buy on Payhip';
  return `${START}\n<div class="b2l-checkout-ribbon" role="region" aria-label="${label}"><span class="b2l-brand">Back2Life Designs · ${intro}</span><strong>${escapeHtml(p.name)}</strong><span class="b2l-price">${escapeHtml(p.price)}</span><a class="b2l-buy" href="${escapeHtml(p.url)}" target="_blank" rel="noopener noreferrer" aria-label="${action} — ${escapeHtml(p.name)} on Payhip">${action} ↗</a></div>\n${END}`;
}

function updateRidgelinePanel(html, p) {
  // Ridgeline has an older inactive checkout panel; keep it aligned with Payhip.
  html = html.replace(/(<p\b[^>]*class="product-price"[^>]*>)[\s\S]*?(<\/p>)/i, (_m, open, close) => {
    return open.replace(/\sdata-price="[^"]*"/g, '') + `${escapeHtml(p.price)} · one-time purchase` + close;
  });
  html = html.replace(/(<a\b[^>]*\bid="checkout-link"[^>]*>)[\s\S]*?(<\/a>)/i, (_m, open, close) => {
    const attrs = open.replace(/\s+hidden(?=[\s>])/g, '')
      .replace(/\s+href="[^"]*"/g, '')
      .replace(/\s+target="[^"]*"/g, '')
      .replace(/\s+rel="[^"]*"/g, '');
    return attrs.replace(/>$/, ` href="${escapeHtml(p.url)}" target="_blank" rel="noopener noreferrer">`) + `Buy for ${escapeHtml(p.price)} ↗` + close;
  });
  html = html.replace(/(<p\b[^>]*id="checkout-notice"[^>]*>)[\s\S]*?(<\/p>)/i, '$1Secure checkout and automatic digital delivery are provided by Payhip.$2');
  html = html.replace(/No payment is collected on this preview\./g, 'Checkout is completed securely on Payhip.');
  return html;
}

function updatePage(html, p, slug) {
  if (!/<body\b/i.test(html) || !/<\/head\s*>/i.test(html)) {
    throw new Error(`Missing HTML head/body in ${slug}`);
  }
  html = insertStyle(html);
  const nextRibbon = ribbon(p);
  if (html.includes(START) && html.includes(END)) {
    const start = html.indexOf(START);
    const end = html.indexOf(END, start) + END.length;
    html = html.slice(0, start) + nextRibbon + html.slice(end);
  } else {
    html = html.replace(/(<body\b[^>]*>)/i, (_match, open) => `${open}\n${nextRibbon}`);
  }
  if (slug === 'ridgeline' && p.kind === 'paid') html = updateRidgelinePanel(html, p);
  return html;
}

function updateCard(card) {
  const slug = Object.keys(all).find(s => card.includes(`${s}/index.html`) || card.includes(`${s}/demo/index.html`) || card.includes(`data-slug="${s}"`));
  if (!slug) return { card, slug: null };
  const p = getProduct(slug);
  const label = p.kind === 'free' ? 'FREE · Instant download via Payhip' : `${p.price} · one-time purchase`;
  card = card.replace(/(<p\b[^>]*class="store-listing-price"[^>]*>)[\s\S]*?(<\/p>)/i, (_match, open, close) => open + escapeHtml(label) + close);
  // Remove old Payhip links before injecting exactly one new one.
  card = card.replace(/\s*<a\b[^>]*class="[^"]*\bstore-link-(?:buy|free)\b[^"]*"[^>]*>[\s\S]*?<\/a>/gi, '');
  if (p.kind === 'free') {
    // If an old direct-download link exists, make Payhip the single download pathway.
    card = card.replace(/\s*<a\b[^>]*class="[^"]*\bstore-link-download\b[^"]*"[^>]*>[\s\S]*?<\/a>/gi, '');
    card = card.replace(/data-tier="(?:preview|premium)"/, 'data-tier="free"');
    card = card.replace(/(<span\b[^>]*class="store-listing-badge"[^>]*>)[\s\S]*?(<\/span>)/i, '$1FREE STARTER$2');
  } else {
    card = card.replace(/data-tier="(?:preview|free)"/, 'data-tier="premium"');
  }
  const cls = p.kind === 'free' ? 'store-link-free' : 'store-link-buy';
  const action = `<a class="${cls}" href="${escapeHtml(p.url)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(p.button)} — ${escapeHtml(p.name)} on Payhip">${escapeHtml(p.button)} ↗</a>`;
  if (!/<div\b[^>]*class="[^"]*\bstore-listing-actions\b[^"]*"[^>]*>/i.test(card)) {
    throw new Error(`Missing action container for ${slug}`);
  }
  card = card.replace(/(<div\b[^>]*class="[^"]*\bstore-listing-actions\b[^"]*"[^>]*>)/i, (_match, open) => open + action);
  return { card, slug, kind: p.kind };
}

function updateCatalog(html) {
  let paidCount = 0;
  let freeCount = 0;
  const seen = new Set();
  const article = /<article\b[^>]*class="[^"]*\bstore-listing\b[^"]*"[^>]*>[\s\S]*?<\/article>/gi;
  html = html.replace(article, card => {
    const out = updateCard(card);
    if (out.slug) {
      seen.add(out.slug);
      if (out.kind === 'free') freeCount++; else paidCount++;
    }
    return out.card;
  });
  if (!paidCount && !freeCount) throw new Error('No matching template cards; ensure catalog builder ran and folder slugs match.');
  // The generator counts folders without metadata as previews. Correct the summary
  // after setting known free template categories above (e.g. Table & Thyme alias).
  const freeTotal = [...html.matchAll(/<article\b[^>]*class="[^"]*\bstore-listing\b[^"]*"[^>]*\bdata-tier="free"/gi)].length;
  const allTotal = [...html.matchAll(/<article\b[^>]*class="[^"]*\bstore-listing\b[^"]*"/gi)].length;
  const paidTotal = allTotal - freeTotal;
  html = html.replace(/(<[^>]+\bid="store-hero-details"[^>]*>)[\s\S]*?(<\/[^>]+>)/i,
    `$1${freeTotal} free starter${freeTotal === 1 ? '' : 's'} and ${paidTotal} premium template${paidTotal === 1 ? '' : 's'}. Explore live demos before choosing a design.$2`);
  return { html: insertStyle(html), paidCount, freeCount, seen };
}

async function writeIfChanged(file, change) {
  if (!(await isFile(file))) return false;
  const original = await readFile(file, 'utf8');
  const updated = change(original);
  if (updated !== original) await writeFile(file, updated, 'utf8');
  return true;
}

let catalogPaid = 0, catalogFree = 0;
const catalogSeen = new Set();
const catalogPath = join(templatesDir, 'index.html');
await writeIfChanged(catalogPath, old => {
  const updated = updateCatalog(old);
  catalogPaid = updated.paidCount;
  catalogFree = updated.freeCount;
  for (const s of updated.seen) catalogSeen.add(s);
  return updated.html;
});

let pagePaid = 0, pageFree = 0, folders = 0;
const pageSeen = new Set();
for (const slug of Object.keys(all)) {
  const p = getProduct(slug);
  const dir = join(templatesDir, slug);
  const index = join(dir, 'index.html');
  if (!(await isFile(index))) continue;
  folders++;
  for (const name of ['index.html', 'details.html']) {
    const file = join(dir, name);
    if (await writeIfChanged(file, old => updatePage(old, p, slug))) {
      pageSeen.add(slug);
      if (p.kind === 'free') pageFree++; else pagePaid++;
    }
  }
}
console.log(`✓ Payhip catalog: ${catalogPaid} paid button(s), ${catalogFree} free button(s).`);
console.log(`✓ Payhip pages: ${pagePaid} paid + ${pageFree} free pages in ${folders} matched folders.`);
console.log('✓ All 4 paid Payhip product URLs preserved; premium downloads stay out of public HTML.');
const intendedFree = new Map(Object.entries(free).map(([slug,p]) => [p.url, p.name]));
for (const [url,name] of intendedFree) {
  const found = Object.keys(free).some(slug => free[slug].url === url && (catalogSeen.has(slug) || pageSeen.has(slug)));
  if (!found) console.warn(`⚠ Free product not found locally: ${name} (${url}). Check the local dist/pre-made-templates folder.`);
}
if (catalogFree === 0) console.warn('⚠ No FREE catalog cards matched. Check the folder slugs and whether the catalog generator found all free templates.');
