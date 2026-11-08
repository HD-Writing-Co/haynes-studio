"use strict";
const settings=window.STUDIO_CONFIG||{};
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
$$('[data-brand]').forEach(e=>e.textContent=settings.brand||'Haynes Studio');
$$('[data-year]').forEach(e=>e.textContent=new Date().getFullYear());
$$('[data-founder-first]').forEach(e=>e.textContent=(settings.founder||'Billy').split(' ')[0]+'.');
if(settings.brand)document.title=document.title.replace('Haynes Studio',settings.brand);
const menu=$('#navigation'),menuButton=$('.menu-button');
menuButton?.addEventListener('click',()=>{const open=menu.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));});
function closeMenu(){menu?.classList.remove('open');menuButton?.setAttribute('aria-expanded','false');}
menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.classList.contains('open')){closeMenu();menuButton.focus();}});
if(settings.customProjectsOpen){$$('[data-custom-label]').forEach(e=>e.textContent='Custom projects — inquiries welcome');$$('[data-custom-copy]').forEach(e=>e.textContent='Have an idea beyond a template? Tell me what you need. We’ll confirm fit, scope, and availability before work begins.');$$('[data-custom-faq]').forEach(e=>e.textContent='Yes. Send a custom-project inquiry with your goals and requirements. We’ll discuss scope, budget, and availability before booking.');const opt=$('#interest option:last-child');if(opt)opt.textContent='Custom project';}
$('#business-preview')?.addEventListener('input',e=>{$('#sample-logo').textContent=e.target.value.trim()||'YOUR BUSINESS';});
$$('[data-color]').forEach(b=>b.addEventListener('click',()=>{$('#style-preview').dataset.palette=b.dataset.color;$$('[data-color]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}));
$$('[data-price]').forEach(e=>{const item=settings.products?.[e.dataset.price];if(item)e.textContent=item.priceLabel||'Pricing announced at launch';});
function validHttps(url){try{return new URL(url).protocol==='https:';}catch{return false;}}
const product=settings.products?.ridgeline;
if($('#checkout-link')&&product?.checkoutUrl&&validHttps(product.checkoutUrl)){$('#checkout-link').href=product.checkoutUrl;$('#checkout-link').hidden=false;$('#checkout-notice').textContent='Secure checkout and file delivery are handled by the linked store. Review the final price and license there.';$('#launch-link').hidden=true;$('.purchase-panel small').textContent='Customization, hosting, and domains are separate unless the product listing explicitly includes them.';}
$$('[data-device]').forEach(b=>b.addEventListener('click',()=>{$('#template-frame').classList.toggle('mobile',b.dataset.device==='mobile');$$('[data-device]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}));
const form=$('#inquiry-form'),dialog=$('#draft-dialog'),status=$('#form-status');
if(form){
 const select=$('#interest');const params=new URLSearchParams(location.search);
 if(params.get('interest')==='customization')select.value='Template customization';
 if(params.get('template'))form.elements.order.value=params.get('template').slice(0,150);
 $$('[data-inquiry]').forEach(a=>a.addEventListener('click',()=>{select.value=a.dataset.inquiry;}));
 const endpoint=settings.formEndpoint?.trim();const email=settings.email?.trim();
 const liveEndpoint=!!endpoint&&validHttps(endpoint), hasEmail=!!email&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
 const submit=$('#submit-inquiry');submit.disabled=false;
 if(liveEndpoint){submit.firstChild.textContent='Send inquiry ';$('#contact-mode').textContent='Your inquiry is sent to the studio’s connected form service.';}
 else if(hasEmail){submit.firstChild.textContent='Prepare email ';$('#contact-mode').textContent='Prepare an email draft, then review and send it in your email app.';}
 if(hasEmail){const link=$('#email-link');link.hidden=false;link.textContent=email;link.href='mailto:'+email;}
 let draft='';
 form.addEventListener('submit',async e=>{e.preventDefault();if(!form.reportValidity())return;if(form.elements._gotcha.value)return;const data=new FormData(form);
 draft=`Name: ${data.get('name')}\nEmail: ${data.get('email')}\nInterest: ${data.get('interest')}\nBusiness: ${data.get('business')||'Not supplied'}\nTemplate / order: ${data.get('order')||'Not supplied'}\n\n${data.get('message')}`;
 if(!liveEndpoint){$('#draft-text').value=draft;$('#draft-note').textContent=hasEmail?'Your email draft is ready. Review it, then open your email app and send it. Nothing has been sent yet.':'Preview only. No inbox is connected and nothing has been sent or stored. You can copy this draft.';const send=$('#send-email');send.hidden=!hasEmail;if(hasEmail)send.href=`mailto:${email}?subject=${encodeURIComponent('Website inquiry: '+data.get('interest'))}&body=${encodeURIComponent(draft)}`;$('#copy-status').textContent='';dialog.showModal();status.textContent='Draft prepared. Nothing has been sent.';return;}
 submit.disabled=true;status.textContent='Sending your inquiry…';const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),15000);
 try{const result=await fetch(endpoint,{method:'POST',body:data,headers:{Accept:'application/json'},signal:controller.signal});if(!result.ok)throw new Error('Send failed');status.textContent='Thank you. Your inquiry was submitted successfully.';form.reset();}catch{status.textContent='We couldn’t confirm delivery. Please try again later'+(hasEmail?' or use the email link.':'.');}finally{clearTimeout(timeout);submit.disabled=false;}
 });
 $('[data-close-dialog]').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>submit.focus());
 $('#copy-draft').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(draft);$('#copy-status').textContent='Draft copied. Nothing has been sent.';}catch{$('#draft-text').focus();$('#draft-text').select();$('#copy-status').textContent='Select and copy the draft above using your device’s copy command.';}});
}
