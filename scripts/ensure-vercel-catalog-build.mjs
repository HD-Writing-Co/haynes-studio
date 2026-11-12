/**
 * Preserve existing Vercel settings; set two build properties needed by
 * Back2Life Designs' static catalog generator + Payhip postbuild.
 * Usage: node scripts/ensure-vercel-catalog-build.mjs
 * Review the resulting git diff before publishing.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const file = join(root, 'vercel.json');
let data = {};
try { data = JSON.parse(await readFile(file, 'utf8')); }
catch (err) { if (err.code !== 'ENOENT') throw err; }
if (Array.isArray(data) || typeof data !== 'object' || data === null) throw Error('vercel.json must contain a JSON object');
const previous = [data.buildCommand, data.outputDirectory];
data.version ??= 2;
data.buildCommand = 'node scripts/build-template-catalog.mjs';
data.outputDirectory = 'dist';
await writeFile(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('✓ Vercel build command:', data.buildCommand);
console.log('✓ Vercel output directory:', data.outputDirectory);
if (previous.some(x => x !== undefined)) console.log('Original values:', previous);
console.log('Review git diff -- vercel.json before pushing. Other Vercel fields were retained.');
