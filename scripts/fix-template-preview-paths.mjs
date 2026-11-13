/**
 * Back2Life Designs — correct relative template preview paths in the catalog.
 *
 * The catalog is served from /pre-made-templates/index.html; a thumbnail stored in
 * /pre-made-templates/my-template/preview.png therefore needs the catalog-relative
 * src="my-template/preview.png", not src="preview.png".
 *
 * This post-build step is generic, safe to rerun, and runs automatically whenever
 * build-template-catalog.mjs runs after installing the included hook.
 * It only rewrites <img src> / <img srcset> inside recognized template cards when
 * the proposed corrected image actually exists in that template's folder.
 */
import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { join, resolve, dirname, posix, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const catalogDir = join(repo, 'dist', 'pre-made-templates');
const catalogFile = join(catalogDir, 'index.html');
const photoNames = ['preview.png','preview.webp','preview.jpg','preview.jpeg','preview.svg','screenshot.png','thumbnail.png'];

const fileExists = async (file) => {
  try { return (await stat(file)).isFile(); } catch { return false; }
};
const escaped = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const decodeAttribute = (s) => s.replace(/&amp;/g, '&').replace(/&#38;/g, '&');
const isExternal = (s) => /^(?:[a-z][a-z\d+.-]*:|\/\/|\/|#|\?)/i.test(s);
const encodeAttribute = (s, quote) => quote === '"' ? s.replaceAll('&', '&amp;').replaceAll('"', '&quot;') : s.replaceAll('&', '&amp;').replaceAll("'", '&#39;');

const entries = (await readdir(catalogDir, { withFileTypes: true })).filter((d) => d.isDirectory());
const folders = [];
for (const entry of entries) {
  const dir = join(catalogDir, entry.name);
  const metaPath = join(dir, 'template.json');
  // Existing catalogs can contain starter templates without template.json.
  if (!(await fileExists(join(dir, 'index.html'))) && !(await fileExists(metaPath))) continue;
  let meta = {};
  if (await fileExists(metaPath)) {
    try { meta = JSON.parse(await readFile(metaPath, 'utf8')); }
    catch (e) { console.warn(`! Invalid metadata in ${entry.name}/template.json: ${e.message}`); }
  }
  folders.push({ name: entry.name, meta, dir });
}

function templateOfCard(card) {
  for (const folder of folders) {
    const slug = escaped(folder.name);
    // Match URLs in actual card links, or a genuine data-slug attribute.
    const link = new RegExp(`\\b(?:href|data-href)\\s*=\\s*["'](?:\\./)?${slug}(?:/[^"']*)?["']`, 'i');
    const slugAttr = new RegExp(`\\bdata-slug\\s*=\\s*["']${slug}["']`, 'i');
    if (link.test(card) || slugAttr.test(card)) return folder;
  }
  return null;
}

function candidates(folder, raw) {
  const source = decodeAttribute(raw.trim());
  if (isExternal(source)) return [];
  const [pathOnly, suffix = ''] = source.split(/(?=[?#])/, 2);
  const safe = pathOnly.replaceAll('\\', '/');
  if (!safe || safe.startsWith('../')) return [];
  const path = posix.normalize(safe.replace(/^\.\//, ''));
  if (path.startsWith('../') || path === '.') return [];
  const options = [];
  // Remove an accidental duplicate folder prefix.
  if (path.startsWith(`${folder.name}/`)) options.push(path);
  else {
    options.push(`${folder.name}/${path}`);
    if (path.includes('/')) options.push(`${folder.name}/${posix.basename(path)}`);
  }
  // Allow a metadata-specified name when the source markup has an invalid bare name.
  for (const key of ['preview', 'previewImage', 'thumbnail', 'image']) {
    const value = folder.meta[key];
    if (typeof value !== 'string' || isExternal(value) || value.includes('..')) continue;
    const name = posix.basename(value.split(/[?#]/)[0].replaceAll('\\', '/'));
    if (name) options.push(`${folder.name}/${name}`);
  }
  photoNames.forEach((f) => options.push(`${folder.name}/${f}`));
  return [...new Set(options)].map((p) => ({ path: p, suffix }));
}

let cardCount = 0;
let imagesFixed = 0;
let imagesOK = 0;
let missing = [];
const old = await readFile(catalogFile, 'utf8');

// We intentionally use only template card boundaries, not blanket src replacement;
// this protects site logos, design elements, and images belonging to other pages.
const articleRE = /<article\b[^>]*>[\s\S]*?<\/article\s*>/gi;
const cards = [...old.matchAll(articleRE)];
let next = '';
let cursor = 0;
for (const m of cards) {
  next += old.slice(cursor, m.index);
  cursor = m.index + m[0].length;
  const card = m[0];
  const folder = templateOfCard(card);
  if (!folder || !/<img\b/i.test(card)) { next += card; continue; }
  cardCount++;
  const tags = card.match(/<img\b[^>]*>/gi) || [];
  let updatedCard = card;
  for (const tag of tags) {
    let updatedTag = tag;
    const attrs = [...tag.matchAll(/\b(src|data-src)\s*=\s*(["'])(.*?)\2/gi)];
    for (const attr of attrs) {
      const [whole, kind, q, raw] = attr;
      const decoded = decodeAttribute(raw);
      if (isExternal(decoded) || decoded.startsWith('../')) continue;
      const [pathOnly] = decoded.split(/[?#]/, 1);
      // Prefer the file in THIS template folder, even if a stale preview.png
      // happens to exist in the catalog root (which would give every card the same image).
      const rootRelative = pathOnly.replaceAll('\\', '/');
      let corrected = null;
      for (const option of candidates(folder, raw)) {
        if (await fileExists(join(catalogDir, option.path))) {
          corrected = option.path + option.suffix;
          break;
        }
      }
      if (!corrected && await fileExists(resolve(catalogDir, rootRelative))) {
        imagesOK++;
        continue;
      }
      if (!corrected) { missing.push(`${folder.name}: ${decoded}`); continue; }
      if (corrected === decoded) { imagesOK++; continue; }
      const replacement = `${kind}=${q}${encodeAttribute(corrected, q)}${q}`;
      updatedTag = updatedTag.replace(whole, replacement);
      imagesFixed++;
    }
    if (updatedTag !== tag) updatedCard = updatedCard.replace(tag, updatedTag);
  }
  next += updatedCard;
}
next += old.slice(cursor);
if (next !== old) await writeFile(catalogFile, next, 'utf8');
console.log(`✓ Template preview paths: ${imagesFixed} corrected across ${cardCount} cards; ${imagesOK} already valid.`);
if (missing.length) console.warn(`! Preview assets not found (${missing.length}): ${missing.slice(0, 8).join('; ')}`);
