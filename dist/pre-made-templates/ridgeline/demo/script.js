"use strict";
const config = window.SITE_CONFIG || {};
document.querySelectorAll('[data-config]').forEach(el => { const value = config[el.dataset.config]; if(value) el.textContent=value; });
document.querySelectorAll('[data-phone]').forEach(el => {el.textContent=config.phone;el.href=`tel:${config.phoneHref}`;});
document.querySelectorAll('[data-email]').forEach(el => {el.textContent=config.email;el.href=`mailto:${config.email}`;});
if(config.accentColor) document.documentElement.style.setProperty('--accent',config.accentColor);
document.title=`${config.businessName || 'Your Business'} | ${config.businessType || 'Home services'}`;
document.getElementById('year').textContent=new Date().getFullYear();
const menuButton=document.querySelector('.menu-toggle'), menu=document.getElementById('mobile-nav');
function closeMenu(){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');}
menuButton.addEventListener('click',()=>{menu.hidden=!menu.hidden;menuButton.setAttribute('aria-expanded',String(!menu.hidden));});
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){closeMenu();menuButton.focus();}});
const dialog=document.getElementById('media-dialog'), media=document.getElementById('media-content');
let opener;
function openMedia(title,node,trigger){opener=trigger;document.getElementById('media-title').textContent=title;media.replaceChildren(node);dialog.showModal();}
document.querySelectorAll('[data-video]').forEach(button=>button.addEventListener('click',()=>{const video=document.createElement('video');video.controls=true;video.playsInline=true;video.src='assets/placeholder-video.mp4';video.poster='assets/roof-home.webp';video.setAttribute('aria-label','Silent abstract roofing placeholder video');openMedia('Company introduction — placeholder video',video,button);video.play().catch(()=>{});}));
document.querySelectorAll('[data-image]').forEach(button=>button.addEventListener('click',()=>{const img=document.createElement('img');img.src=button.dataset.image;img.alt=button.dataset.caption;openMedia(button.dataset.caption,img,button);}));
document.getElementById('close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{media.querySelector('video')?.pause();media.replaceChildren();opener?.focus();});
const reviews=[['Clear communication from the first call to the final cleanup. We always knew what to expect.','Sample customer A','Roof replacement'],['The team took time to explain our options and helped us feel comfortable with the next steps.','Sample customer B','Roof repair'],['Thoughtful service, attention to detail, and a smooth process from start to finish.','Sample customer C','Commercial project']];
let reviewIndex=0;function showReview(offset){reviewIndex=(reviewIndex+offset+reviews.length)%reviews.length;const r=reviews[reviewIndex];document.getElementById('review-quote').textContent=r[0];document.getElementById('review-person').textContent=r[1];document.getElementById('review-detail').textContent=r[2]+' · Example review';document.getElementById('review-count').textContent=`0${reviewIndex+1} / 03`;}
document.getElementById('review-prev').addEventListener('click',()=>showReview(-1));document.getElementById('review-next').addEventListener('click',()=>showReview(1));
document.querySelectorAll('[data-service]').forEach(a=>a.addEventListener('click',()=>{document.getElementById('service').value=a.dataset.service;}));
const form=document.getElementById('contact-form'),status=document.getElementById('form-status');
form.querySelector('[type=submit]').disabled=false;
if(config.formEndpoint)document.getElementById('form-note').textContent='Share a few details and our team will follow up.';
form.addEventListener('submit',async e=>{e.preventDefault();if(!form.reportValidity())return;if(!config.formEndpoint){status.textContent='Demo complete — your form is valid. No message was sent or stored. Connect a form service in config.js to receive inquiries.';return;}const button=form.querySelector('[type=submit]');button.disabled=true;status.textContent='Sending your request…';try{if(!config.formEndpoint.startsWith('https://'))throw new Error('HTTPS required');const response=await fetch(config.formEndpoint,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}});if(!response.ok)throw new Error('Submission failed');status.textContent='Thank you. Your request has been sent.';form.reset();}catch{status.textContent='We could not send your request. Please try again or contact us by phone or email.';}finally{button.disabled=false;}});
