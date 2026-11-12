/** One-time safe hook into Back2Life's existing catalog build. */
import {readFile,writeFile,stat} from 'node:fs/promises';
import {dirname,resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const file=join(root,'scripts','build-template-catalog.mjs');
const addon=join(root,'scripts','apply-payhip-everywhere.mjs');
const data=join(root,'scripts','payhip-products.json');
const needed=[file,addon,data];
for(const p of needed){try{if(!(await stat(p)).isFile())throw Error('Missing '+p);}catch{throw Error('Missing '+p+'; copy all three scripts into your existing scripts folder.');}}
let s=await readFile(file,'utf8');
const MARK='// B2L PAYHIP ALL-PAGES POSTBUILD';
if(!s.includes(MARK)){
  if(!s.includes('await writeFile(storefrontPath, html'))throw Error('Cannot recognize the existing catalog builder. No changes made.');
  s=s.trimEnd()+`\n\n${MARK}\nawait import('./apply-payhip-everywhere.mjs');\n`;
  await writeFile(file,s,'utf8');
  console.log('✓ Added automatic Payhip update to the END of existing catalog generator.');
}else console.log('✓ Payhip updater already installed; no duplicate created.');
console.log('NEXT: node scripts/build-template-catalog.mjs');
