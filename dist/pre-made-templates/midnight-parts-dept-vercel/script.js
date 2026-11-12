const products = [
  {name:'The Four-Pack of Definitely Not Missing Wheels',price:404,category:'cd7'},
  {name:'Center Console Button Collection',price:38.5,category:'cd7'},
  {name:'Front Lip with a Very Convincing Alibi',price:89,category:'cd7'},
  {name:'Pair of Rear Lamps, No Questions',price:72,category:'cd7'},
  {name:'Mystery Fastener Jar',price:12,category:'garage'},
  {name:'New Car Smell Air Freshener',price:6.66,category:'garage'},
  {name:'Unlabeled Switch',price:9.99,category:'garage'},
  {name:'Handwritten Receipt of Unclear Origin',price:2,category:'garage'}
];
let activeFilter='all';
const cart=new Map();
const cards=[...document.querySelectorAll('.product-card')];
const searchInput=document.getElementById('searchInput');
const emptyState=document.getElementById('emptyState');
function applyFilters(){
  const query=searchInput.value.trim().toLowerCase();let visible=0;
  cards.forEach(card=>{const categoryMatch=activeFilter==='all'||card.dataset.category===activeFilter;const searchMatch=(card.dataset.search+' '+card.querySelector('h3').textContent).toLowerCase().includes(query);const show=categoryMatch&&searchMatch;card.hidden=!show;if(show)visible++});
  emptyState.style.display=visible?'none':'block';
}
document.querySelectorAll('.filter').forEach(button=>button.addEventListener('click',()=>{document.querySelector('.filter.active')?.classList.remove('active');button.classList.add('active');activeFilter=button.dataset.filter;applyFilters()}));
searchInput.addEventListener('input',applyFilters);
document.addEventListener('keydown',event=>{if(event.key==='/'&&document.activeElement!==searchInput){event.preventDefault();searchInput.focus()}if(event.key==='Escape')closeCart()});
document.getElementById('resetFilters').addEventListener('click',()=>{activeFilter='all';searchInput.value='';document.querySelector('.filter.active')?.classList.remove('active');document.querySelector('[data-filter="all"]').classList.add('active');applyFilters()});
let toastTimer;
function showToast(message){const toast=document.getElementById('toast');toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2200)}
document.querySelectorAll('[data-add]').forEach(button=>button.addEventListener('click',()=>{const name=button.dataset.add;cart.set(name,(cart.get(name)||0)+1);renderCart();showToast('Added to your pretend bag: '+name)}));
function renderCart(){const count=[...cart.values()].reduce((sum,value)=>sum+value,0);document.getElementById('cartCount').textContent=count;const container=document.getElementById('cartItems');if(!count){container.innerHTML='<div class="cart-empty">Your bag is as empty as our legal department\'s calendar.</div>'}else{container.innerHTML=[...cart].map(([name,qty])=>{const item=products.find(product=>name.startsWith(product.name.slice(0,18)))||products.find(product=>product.name===name)||{price:6.66};return `<div class="cart-row"><span>${qty} × ${name}</span><b>$${(item.price*qty).toFixed(2)}</b></div>`}).join('')}const total=[...cart].reduce((sum,[name,qty])=>{const item=products.find(product=>product.name===name);return sum+(item?item.price*qty:0)},0);document.getElementById('cartTotal').textContent='$'+total.toFixed(2)}
const drawer=document.getElementById('cartDrawer'),backdrop=document.getElementById('drawerBackdrop');
function openCart(){drawer.classList.add('open');backdrop.classList.add('show');drawer.setAttribute('aria-hidden','false')}
function closeCart(){drawer.classList.remove('open');backdrop.classList.remove('show');drawer.setAttribute('aria-hidden','true')}
document.getElementById('cartButton').addEventListener('click',openCart);document.getElementById('closeCart').addEventListener('click',closeCart);backdrop.addEventListener('click',closeCart);
document.getElementById('checkoutButton').addEventListener('click',()=>showToast('Just kidding. This is a parody, and checkout is fictional.'));
