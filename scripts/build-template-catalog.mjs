/**
 * Back2Life Designs: static storefront catalog generator.
 * Discovers every immediate subfolder of dist/pre-made-templates with index.html.
 * Optional template.json enriches the listing; new folders appear without editing the storefront.
 * No packages, service credentials, API requests, or CMS required.
 */
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const directory = join(projectRoot, 'dist', 'pre-made-templates');
const storefrontPath = join(directory, 'index.html');
const START = '<!-- AUTO-CATALOG:START -->';
const END = '<!-- AUTO-CATALOG:END -->';
const esc = (value) => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const fileExists = async (path) => { try { return (await stat(path)).isFile(); } catch { return false; } };
const plainName = (slug) => slug.split('-').filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
const text = (v, fallback='') => typeof v === 'string' && v.trim() ? v.trim() : fallback;

function makeCard(item) {
  const slug = encodeURIComponent(item.slug);
  const demoHref = `${slug}/${item.demoPath}`;
  const detailsHref = item.detailsPath ? `${slug}/${item.detailsPath}` : demoHref;
  const badge = item.badge || (item.tier === 'free' ? 'FREE STARTER' : item.tier === 'premium' ? 'PAID TEMPLATE' : 'PREVIEW');
  const image = item.preview ? `<img src="${esc(item.preview)}" alt="${esc(item.imageAlt)}" loading="lazy" width="1092" height="656">` : `<span class="store-placeholder-title">${esc(item.name)}</span>`;
  const visual = `<a class="store-listing-visual" href="${esc(demoHref)}" aria-label="Preview ${esc(item.name)}">${image}<span class="store-listing-badge">${badge}</span></a>`;
  const feature = item.featured ? ' store-listing-featured' : '';
  const details = item.detailsPath && item.detailsPath !== item.demoPath ? `<a href="${esc(detailsHref)}" class="store-link-secondary">Details &amp; specifications <span aria-hidden="true">↗</span></a>` : '';
  const link = `<a class="store-link-primary" href="${esc(demoHref)}">View live demo <span aria-hidden="true">↗</span></a>`;
  const download = item.download ? `<a class="store-link-download" href="${esc(item.download)}" download>Download files <span aria-hidden="true">↓</span></a>` : '';
  return `<article class="store-listing${feature}" data-tier="${esc(item.tier)}" data-niche="${esc(item.niche)}" data-search="${esc([item.name, item.niche, item.description, item.idealFor].join(' ').toLowerCase())}">
  ${visual}
  <div class="store-listing-content">
    <p class="store-listing-kicker">${esc(item.niche)}</p>
    <h3>${esc(item.name)}</h3>
    <p class="store-listing-desc">${esc(item.description)}</p>
    <dl class="store-listing-facts"><div><dt>Best for</dt><dd>${esc(item.idealFor)}</dd></div><div><dt>Built with</dt><dd>${esc(item.platform)}</dd></div></dl>
    <p class="store-listing-price">${esc(item.priceLabel)}</p>
    <div class="store-listing-actions">${link}${details}${download}</div>
  </div>
</article>`;
}

const entries = (await readdir(directory, { withFileTypes: true })).filter(e => e.isDirectory() && !e.name.startsWith('.'));
const items = [];
for (const entry of entries) {
  const slug = entry.name;
  if (!(await fileExists(join(directory, slug, 'index.html')))) continue;
  let meta = {};
  const metaFile = join(directory, slug, 'template.json');
  if (await fileExists(metaFile)) {
    try { meta = JSON.parse(await readFile(metaFile, 'utf8')); }
    catch (err) { throw new Error(`Invalid ${slug}/template.json: ${err.message}`); }
  }
  // Unconfigured folders become a preview: never assume price, licensing, or download permissions.
  const tier = ['free', 'premium', 'preview'].includes(meta.tier) ? meta.tier : 'preview';
  let preview = text(meta.preview);
  if (!preview) {
    for (const image of ['preview.webp', 'preview.png', 'preview.jpg', 'assets/preview.webp', 'assets/preview.png']) {
      if (await fileExists(join(directory, slug, image))) { preview = `${slug}/${image}`; break; }
    }
  }
  // Download links are enabled only after the owner adds an explicitly configured path.
  const download = text(meta.download);
  items.push({
    slug,
    name: text(meta.name, plainName(slug)),
    niche: text(meta.niche, 'Other businesses'),
    description: text(meta.description, 'Explore this website design in the live preview.'),
    idealFor: text(meta.idealFor, 'Small businesses'),
    platform: text(meta.platform, 'HTML · CSS · JavaScript'),
    tier,
    badge: text(meta.badge),
    priceLabel: text(meta.priceLabel, tier === 'free' ? 'Free starter · Demo available' : 'Pricing to be announced'),
    preview,
    imageAlt: text(meta.imageAlt, `Website screenshot of ${text(meta.name, plainName(slug))}`),
    demoPath: text(meta.demoPath, 'index.html'),
    detailsPath: text(meta.detailsPath),
    download: download.startsWith('../downloads/') && await fileExists(join(directory, '..', download.slice(3))) ? download : '',
    featured: !!meta.featured,
    order: Number.isFinite(meta.order) ? meta.order : 999,
  });
}
items.sort((a,b) => a.order-b.order || a.name.localeCompare(b.name));
let html = await readFile(storefrontPath, 'utf8');
if (!html.includes(START) || !html.includes(END)) throw new Error(`Missing catalog markers in ${storefrontPath}`);
const catalog = items.map(makeCard).join('\n');
html = html.replace(new RegExp(`${START}[\\s\\S]*?${END}`), `${START}\n${catalog || '<p class="store-empty">No templates have been added yet.</p>'}\n${END}`);
const free = items.filter(x => x.tier === 'free').length;
const premium = items.filter(x => x.tier !== 'free').length;
const setText = (id, content) => {
  const re = new RegExp(`(<([a-z][\\w-]*)[^>]*\\bid="${id}"[^>]*>)[\\s\\S]*?(<\\/\\2>)`, 'i');
  if (!re.test(html)) throw new Error(`Missing text marker ${id} in storefront`);
  html = html.replace(re, (_m, open, _t, close) => `${open}${esc(content)}${close}`);
};
setText('store-hero-number', String(items.length).padStart(2,'0'));
setText('store-hero-summary', `${items.length} website designs to explore.`);
setText('store-hero-details', `${free} free starter${free === 1 ? '' : 's'} and ${premium} premium preview${premium === 1 ? '' : 's'}. Explore live demos before choosing a design.`);
setText('store-total-count', `Showing ${items.length} template${items.length === 1 ? '' : 's'}`);
const categoryOptions = [...new Set(items.map(x => x.niche))].sort();
const selectStart='<!-- AUTO-CATEGORIES:START -->', selectEnd='<!-- AUTO-CATEGORIES:END -->';
if (!html.includes(selectStart) || !html.includes(selectEnd)) throw new Error('Missing category markers in storefront');
html = html.replace(new RegExp(`${selectStart}[\\s\\S]*?${selectEnd}`), `${selectStart}\n<option value="all">All niches</option>\n${categoryOptions.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('\n')}\n${selectEnd}`);
await writeFile(storefrontPath, html, 'utf8');
console.log(`✓ Catalog updated: ${items.length} templates (${free} free, ${premium} other).`);
for (const item of items) console.log(`  • ${item.name} — ${item.tier} — ${item.slug}/index.html`);

// B2L PAYHIP ALL-PAGES POSTBUILD
await import('./apply-payhip-everywhere.mjs');

// Automatically correct preview images for all templates
await import('./fix-template-preview-paths.mjs');
