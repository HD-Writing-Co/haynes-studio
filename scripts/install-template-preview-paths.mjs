/**
 * Back2Life Designs — one-time installer for automatic preview path correction.
 * Appends a tiny post-build hook to the EXISTING catalog generator.
 * Does not replace that generator or alter your pricing/Payhip configuration.
 */
import { readFile, writeFile, stat, copyFile } from 'node:fs/promises';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const builder = join(root, 'scripts', 'build-template-catalog.mjs');
const fixer = join(root, 'scripts', 'fix-template-preview-paths.mjs');
const backup = join(root, 'scripts', 'build-template-catalog.mjs.before-preview-fix.bak');
const isFile = async p => { try { return (await stat(p)).isFile(); } catch { return false; } };
if (!(await isFile(builder))) throw Error('Missing scripts/build-template-catalog.mjs. Run this from your EXISTING haynes-studio project, not the extracted ZIP.');
if (!(await isFile(fixer))) throw Error('Missing scripts/fix-template-preview-paths.mjs. Copy both included scripts into your project scripts folder.');
const marker = '// B2L AUTO-PREVIEW PATHS POSTBUILD';
let source = await readFile(builder, 'utf8');
if (source.includes(marker)) {
  console.log('✓ Preview-path hook is already installed; no duplicate added.');
} else {
  if (!source.includes('await writeFile(storefrontPath, html')) {
    throw Error('Catalog generator does not match the known Back2Life builder. Refusing to edit it. Please share scripts/build-template-catalog.mjs for an exact patch.');
  }
  if (!(await isFile(backup))) await copyFile(builder, backup);
  source = source.trimEnd() + `\n\n${marker}\nawait import('./fix-template-preview-paths.mjs');\n`;
  await writeFile(builder, source, 'utf8');
  console.log('✓ Added automatic thumbnail path fix at the end of your existing catalog build.');
  console.log('✓ Backup: scripts/build-template-catalog.mjs.before-preview-fix.bak');
}
console.log('NEXT: node scripts/build-template-catalog.mjs');
