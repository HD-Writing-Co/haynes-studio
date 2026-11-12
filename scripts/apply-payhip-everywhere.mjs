/**
 * Back2Life Designs — apply Payhip pricing to generated catalog and demo/details HTML.
 * Re-runnable and idempotent; updates only specific paid product pages.
 * IMPORTANT: never put the customer's paid ZIP in the public dist folder.
 */
import { readFile, writeFile, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const folder = join(root, 'dist', 'pre-made-templates');
const configFile = join(root, 'scripts', 'payhip-products.json');
const config = JSON.parse(await readFile(configFile,'utf8'));
const safe = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const isFile = async path => { try {return (await stat(path)).isFile();}catch{return false;} };
const START = '<!-- B2L-PAYHIP-START -->';
const END = '<!-- B2L-PAYHIP-END -->';
const style = `<style id="b2l-payhip-style">
.b2l-checkout-ribbon{box-sizing:border-box;position:relative;z-index:999;background:#12372f;color:#fff!important;display:flex;align-items:center;justify-content:center;gap:14px 25px;padding:12px 22px;font:600 14px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;text-align:center;flex-wrap:wrap;border-bottom:2px solid #c59b5c}
.b2l-checkout-ribbon *{box-sizing:border-box}.b2l-checkout-ribbon strong{color:#fff;font-weight:800}.b2l-checkout-ribbon .b2l-price{color:#fff;font-size:18px;font-weight:800}.b2l-checkout-ribbon .b2l-buy{display:inline-flex;align-items:center;justify-content:center;border:2px solid #f4e8d2;border-radius:999px;background:#f4e8d2;color:#12372f!important;padding:8px 16px;font-weight:800;text-decoration:none;min-height:42px}
.b2l-checkout-ribbon .b2l-buy:hover{background:#fff;border-color:#fff;text-decoration:none}.b2l-checkout-ribbon a:focus-visible{outline:3px solid #73cfff;outline-offset:3px}
body.storefront .store-listing-actions .store-link-buy{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 18px;min-height:44px;background:#145d46;color:#fff!important;font-weight:800;text-decoration:none;border-radius:100px;border:2px solid #145d46}
body.storefront .store-listing-actions .store-link-buy:hover{background:#104534;border-color:#104534}
body.storefront .store-listing-actions .store-link-buy:focus-visible{outline:3px solid #2688d1;outline-offset:3px}
@media(max-width:600px){.b2l-checkout-ribbon{gap:8px 14px;padding:12px}.b2l-checkout-ribbon .b2l-brand{width:100%}}
</style>`;
const ribbon = (p) => `${START}
<div class="b2l-checkout-ribbon" role="region" aria-label="Template purchase information"><span class="b2l-brand">Back2Life Designs · Template preview</span><strong>${safe(p.name)}</strong><span class="b2l-price">${safe(p.price)}</span><a class="b2l-buy" href="${safe(p.url)}" target="_blank" rel="noopener noreferrer">Buy on Payhip ↗</a></div>
${END}`;
const sanitize = (p, slug) => {
 if(!/^\$\d+(?:\.\d{2})?$/.test(p.price))throw Error('Invalid price for '+slug);
 if(!/^https:\/\/payhip\.com\/b\/[A-Za-z0-9]+$/.test(p.url))throw Error('Invalid Payhip link for '+slug);
};
for(const [slug,p] of Object.entries(config))sanitize(p,slug);
function insertStyle(html){
 if(!html.includes('id="b2l-payhip-style"')){
  if(!/<\/head\s*>/i.test(html))throw Error('Missing </head>');
  html=html.replace(/<\/head\s*>/i,`${style}</head>`);
 }
 return html;
}
function updatePage(html,p,{ridgeline=false}={}){
 if(!/<body\b/i.test(html))throw Error('Missing body');
 html=insertStyle(html);
 if(html.includes(START)&&html.includes(END)){
  const start=html.indexOf(START), end=html.indexOf(END,start)+END.length;
  html=html.slice(0,start)+ribbon(p)+html.slice(end);
 }else{
  html=html.replace(/(<body\b[^>]*>)/i,`$1\n${ribbon(p)}`);
 }
 // The original Ridgeline product page has an inactive checkout panel.
 if(ridgeline){
  html=html.replace(/(<p\b[^>]*class="product-price"[^>]*>)[\s\S]*?(<\/p>)/i,`$1${safe(p.price)} · one-time purchase$2`);
  html=html.replace(/(<a\b[^>]*\bid="checkout-link"[^>]*>)[\s\S]*?(<\/a>)/i, (_m,open,close)=>{
   const attrs=open.replace(/\s+hidden(?=[\s>])/g,'').replace(/\s+href="[^"]*"/g,'');
   return attrs.replace(/>$/,` href="${safe(p.url)}" target="_blank" rel="noopener noreferrer">`)+`Buy for ${safe(p.price)} ↗`+close;
  });
  html=html.replace(/(<p\b[^>]*id="checkout-notice"[^>]*>)[\s\S]*?(<\/p>)/i,`$1Secure checkout and automatic digital delivery are provided by Payhip.$2`);
  html=html.replace(/No payment is collected on this preview\./g,'Checkout is completed securely on Payhip.');
 }
 return html;
}
function updateCatalog(html){
 const art=/<article\b[^>]*class="[^"]*\bstore-listing\b[^"]*"[^>]*>[\s\S]*?<\/article>/g;
 let matched=0;
 const next=html.replace(art,(card)=>{
  const entry=Object.entries(config).find(([slug])=>card.includes(`${slug}/index.html`) || card.includes(`data-slug="${slug}"`));
  if(!entry)return card;
  const [,p]=entry;
  matched++;
  card=card.replace(/(<p\b[^>]*class="store-listing-price"[^>]*>)[\s\S]*?(<\/p>)/i,`$1${safe(p.price)} · one-time purchase$2`);
  card=card.replace(/\s*<a\b[^>]*class="store-link-buy"[^>]*>[\s\S]*?<\/a>/gi,'');
  const buy=`<a class="store-link-buy" href="${safe(p.url)}" target="_blank" rel="noopener noreferrer">Buy for ${safe(p.price)} ↗</a>`;
  if(/<div\b[^>]*class="store-listing-actions"[^>]*>/i.test(card)){
   card=card.replace(/(<div\b[^>]*class="store-listing-actions"[^>]*>)/i,`$1${buy}`);
  }else throw Error('The paid product catalog card has no actions section: '+p.name);
  return card.replace(/data-tier="(?:preview|premium)"/,'data-tier="premium"');
 });
 if(!matched)throw Error('Found no paid product cards on the catalog page. Check folder names and whether you ran the existing builder.');
 return {html:insertStyle(next),matched};
}
async function writeIfChanged(path,fn){
 if(!(await isFile(path)))return false;
 const old=await readFile(path,'utf8');
 const updated=fn(old);
 if(old!==updated)await writeFile(path,updated,'utf8');
 return true;
}
const catalogPath=join(folder,'index.html');
let cards=0;
await writeIfChanged(catalogPath,(old)=>{const result=updateCatalog(old);cards=result.matched;return result.html;});
let pages=0;
let folders=0;
for(const [slug,p] of Object.entries(config)){
 const path=join(folder,slug);
 const index=join(path,'index.html');
 if(!(await isFile(index)))continue;
 folders++;
 for(const name of ['index.html','details.html']){
  const file=join(path,name);
  if(await writeIfChanged(file,old=>updatePage(old,p,{ridgeline:slug==='ridgeline'})))pages++;
 }
}
if(!folders)throw Error('No matching paid template folders were found under dist/pre-made-templates.');
console.log(`✓ Payhip links and prices: ${cards} catalog cards, ${pages} template pages in ${folders} folders.`);
console.log('✓ Prices: Ridgeline $49; Ironwood $129; Veloura $129; Sable & Saffron $149.');
console.log('✓ Paid files remain private: only links appear in HTML.');
