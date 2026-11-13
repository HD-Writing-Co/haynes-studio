const products=[
  {name:'Roadline 17-Inch 5-Spoke Alloy Wheel',price:189,category:'wheels'},
  {name:'Sport Brake Rotor & Caliper Set',price:329,category:'brakes'},
  {name:'LED Headlight Assembly',price:219,category:'lighting'},
  {name:'High-Flow Panel Air Filter',price:54,category:'performance'},
  {name:'All-Weather Floor Mat Set',price:89,category:'accessories'},
  {name:'Roof Rack Crossbar Kit',price:149,category:'accessories'},
  {name:'Replacement Cabin Air Filter',price:24,category:'performance'},
  {name:'Vented Rotor & Ceramic Pad Kit',price:219,category:'brakes'}
];
const cards=[...document.querySelectorAll('.product-card')];
const grid=document.getElementById('productGrid');
const searchInput=document.getElementById('searchInput');
const sortSelect=document.getElementById('sortSelect');
const cart=new Map();
let activeFilter='all';
let selectedVehicle='';
const money=value=>'$'+value.toFixed(2);

// Populate a simple vehicle selector. Replace these sample options with a verified fitment source.
const yearSelect=document.getElementById('yearSelect');
const makeSelect=document.getElementById('makeSelect');
const modelSelect=document.getElementById('modelSelect');
for(let year=new Date().getFullYear();year>=1990;year--){const option=document.createElement('option');option.value=year;option.textContent=year;yearSelect.append(option)}
const models={Honda:['Accord','Civic','CR-V','Pilot'],Ford:['F-150','Escape','Mustang','Explorer'],Toyota:['Camry','Corolla','RAV4','Tacoma'],Chevrolet:['Silverado','Equinox','Malibu','Tahoe'],Subaru:['Outback','Forester','Impreza','Crosstrek']};
makeSelect.addEventListener('change',()=>{modelSelect.innerHTML='<option value="">Select model</option>';(models[makeSelect.value]||[]).forEach(model=>{const option=document.createElement('option');option.value=model;option.textContent=model;modelSelect.append(option)});modelSelect.disabled=!makeSelect.value});

document.querySelectorAll('.filter').forEach(button=>button.addEventListener('click',()=>{document.querySelector('.filter.active')?.classList.remove('active');button.classList.add('active');activeFilter=button.dataset.filter;applyFilters()}));
searchInput.addEventListener('input',applyFilters);
sortSelect.addEventListener('change',sortProducts);
function applyFilters(){const query=searchInput.value.trim().toLowerCase();let visible=0;cards.forEach(card=>{const categoryMatch=activeFilter==='all'||card.dataset.category===activeFilter;const searchMatch=(card.dataset.search+' '+card.querySelector('h3').textContent).toLowerCase().includes(query);const show=categoryMatch&&searchMatch;card.hidden=!show;if(show)visible++});document.getElementById('emptyState').style.display=visible?'none':'block'}
function sortProducts(){const mode=sortSelect.value;const ordered=[...cards].sort((a,b)=>{const one=products.find(item=>a.querySelector('[data-add]').dataset.add===item.name),two=products.find(item=>b.querySelector('[data-add]').dataset.add===item.name);if(mode==='low')return one.price-two.price;if(mode==='high')return two.price-one.price;if(mode==='name')return one.name.localeCompare(two.name);return cards.indexOf(a)-cards.indexOf(b)});ordered.forEach(card=>grid.append(card))}
document.querySelectorAll('[data-category-link]').forEach(link=>link.addEventListener('click',()=>{const category=link.dataset.categoryLink;const target=document.querySelector(`.filter[data-filter="${category}"]`);if(target)target.click()}));
document.getElementById('fitmentForm').addEventListener('submit',event=>{event.preventDefault();selectedVehicle=`${yearSelect.value} ${makeSelect.value} ${modelSelect.value}`;document.getElementById('fitmentMessage').textContent=`Vehicle selected: ${selectedVehicle}. Connect verified fitment data to show confirmed compatible parts.`;const banner=document.getElementById('fitmentBanner');banner.hidden=false;document.getElementById('fitmentBannerText').textContent=`Browsing for ${selectedVehicle} — verify each part before ordering.`;document.getElementById('featured').scrollIntoView({behavior:'smooth'})});
document.getElementById('clearFitment').addEventListener('click',()=>{selectedVehicle='';document.getElementById('fitmentBanner').hidden=true;document.getElementById('fitmentMessage').textContent='';yearSelect.value='';makeSelect.value='';modelSelect.innerHTML='<option value="">Select model</option>';modelSelect.disabled=true});
let toastTimer;
function toast(message){const node=document.getElementById('toast');node.textContent=message;node.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.classList.remove('show'),2400)}
document.querySelectorAll('[data-add]').forEach(button=>button.addEventListener('click',()=>{const name=button.dataset.add;cart.set(name,(cart.get(name)||0)+1);renderCart();toast(`${name} added to your cart.`)}));
function renderCart(){const count=[...cart.values()].reduce((sum,qty)=>sum+qty,0);document.getElementById('cartCount').textContent=count;const list=document.getElementById('cartItems');if(!count){list.innerHTML='<div class="cart-empty">Your cart is empty. Find something for the road.</div>'}else{list.innerHTML=[...cart].map(([name,qty])=>{const item=products.find(product=>product.name===name);return `<div class="cart-row"><span class="cart-row-name">${name}</span><div class="cart-row-controls"><button type="button" data-qty="-1" data-name="${name}" aria-label="Remove one ${name}">−</button><span>${qty}</span><button type="button" data-qty="1" data-name="${name}" aria-label="Add one ${name}">+</button><button type="button" class="remove-item" data-remove="${name}">Remove</button></div><span class="cart-row-price">${money(item.price*qty)}</span></div>`}).join('')};const subtotal=[...cart].reduce((sum,[name,qty])=>sum+products.find(product=>product.name===name).price*qty,0);document.getElementById('cartTotal').textContent=money(subtotal);list.querySelectorAll('[data-qty]').forEach(button=>button.addEventListener('click',()=>{const name=button.dataset.name,qty=(cart.get(name)||0)+Number(button.dataset.qty);if(qty<=0)cart.delete(name);else cart.set(name,qty);renderCart()}));list.querySelectorAll('[data-remove]').forEach(button=>button.addEventListener('click',()=>{cart.delete(button.dataset.remove);renderCart()}))}
const drawer=document.getElementById('cartDrawer'),backdrop=document.getElementById('drawerBackdrop');
function openCart(){drawer.classList.add('open');backdrop.classList.add('show');drawer.setAttribute('aria-hidden','false');document.getElementById('closeCart').focus()}
function closeCart(){drawer.classList.remove('open');backdrop.classList.remove('show');drawer.setAttribute('aria-hidden','true')}
document.getElementById('cartButton').addEventListener('click',openCart);document.getElementById('closeCart').addEventListener('click',closeCart);backdrop.addEventListener('click',closeCart);document.addEventListener('keydown',event=>{if(event.key==='Escape')closeCart();if(event.key==='/'&&document.activeElement!==searchInput){event.preventDefault();searchInput.focus()}});document.getElementById('focusSearch').addEventListener('click',()=>{document.getElementById('featured').scrollIntoView({behavior:'smooth'});setTimeout(()=>searchInput.focus(),350)});
document.getElementById('checkoutButton').addEventListener('click',()=>toast('Demo checkout only. Connect your ecommerce platform to accept orders.'));
document.getElementById('newsletterForm').addEventListener('submit',event=>{event.preventDefault();toast('Thanks for joining. Connect an email platform to collect subscribers.');event.currentTarget.reset()});
document.getElementById('menuToggle').addEventListener('click',event=>{const nav=document.querySelector('.main-nav'),open=nav.classList.toggle('is-open');event.currentTarget.setAttribute('aria-expanded',String(open));event.currentTarget.setAttribute('aria-label',open?'Close navigation':'Open navigation')});
