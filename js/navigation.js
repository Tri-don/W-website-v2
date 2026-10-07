(() => {
 const header=document.querySelector('.nv-header');
 const nav=document.querySelector('.nv-navigation');
 const triggers=[...document.querySelectorAll('.nv-trigger')];
 const dropdowns=[...document.querySelectorAll('.nv-dropdown')];
 const mobileButton=document.querySelector('.nv-mobile-toggle');
 const desktop=matchMedia('(min-width:841px)');
 const hover=matchMedia('(hover:hover) and (pointer:fine)');
 let current=null,closeTimer;
 function closeDropdown(returnFocus=false){
  clearTimeout(closeTimer);
  const previous=triggers.find(t=>t.dataset.menu===current);
  triggers.forEach(t=>t.setAttribute('aria-expanded','false'));
  dropdowns.forEach(d=>d.hidden=true);
  document.body.classList.remove('nv-menu-open');
  current=null;
  if(returnFocus)previous?.focus();
 }
 function openDropdown(key){
  clearTimeout(closeTimer);
  current=key;
  triggers.forEach(t=>t.setAttribute('aria-expanded',String(t.dataset.menu===key)));
  dropdowns.forEach(d=>d.hidden=d.id!=='nv-'+key);
  document.body.classList.add('nv-menu-open');
 }
 function toggleMobile(open){
  nav.classList.toggle('nv-is-open',open);
  mobileButton.setAttribute('aria-expanded',String(open));
  mobileButton.setAttribute('aria-label',open?'Close navigation':'Open navigation');
  document.body.classList.toggle('nv-mobile-open',open);
  if(!open)closeDropdown();
 }
 // Place each mobile disclosure immediately after its button in DOM order.
 function arrange(){
  closeDropdown();toggleMobile(false);
  dropdowns.forEach(d=>{
   if(desktop.matches)header.append(d);
   else triggers.find(t=>t.getAttribute('aria-controls')===d.id).after(d);
  });
 }
 triggers.forEach(t=>{
  t.addEventListener('click',()=>current===t.dataset.menu?closeDropdown():openDropdown(t.dataset.menu));
  t.addEventListener('pointerenter',()=>{if(desktop.matches&&hover.matches)openDropdown(t.dataset.menu);});
  t.addEventListener('keydown',e=>{
   if(e.key==='ArrowDown'){
    e.preventDefault();openDropdown(t.dataset.menu);
    document.getElementById(t.getAttribute('aria-controls')).querySelector('button[tabindex="0"],a')?.focus();
   }
   if(e.key==='Tab'&&!e.shiftKey&&desktop.matches&&current===t.dataset.menu){
    e.preventDefault();document.getElementById(t.getAttribute('aria-controls')).querySelector('button[tabindex="0"],a')?.focus();
   }
  });
 });
 const categories=[...document.querySelectorAll('.nv-category')];
 const panels=[...document.querySelectorAll('.nv-capabilities')];
 function selectCategory(key){
  categories.forEach(t=>{const active=t.dataset.category===key;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;});
  panels.forEach(p=>p.hidden=p.id!=='panel-'+key);
 }
 categories.forEach((t,i)=>{
  t.addEventListener('click',()=>{selectCategory(t.dataset.category);if(!desktop.matches)document.getElementById('panel-'+t.dataset.category).scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});});
  t.addEventListener('pointerenter',()=>{if(desktop.matches&&hover.matches)selectCategory(t.dataset.category);});
  t.addEventListener('keydown',e=>{
   let next;
   if(e.key==='ArrowDown')next=(i+1)%categories.length;
   if(e.key==='ArrowUp')next=(i+categories.length-1)%categories.length;
   if(e.key==='Home')next=0;
   if(e.key==='End')next=categories.length-1;
   if(next!==undefined){e.preventDefault();selectCategory(categories[next].dataset.category);categories[next].focus();}
   if(e.key==='ArrowRight'){e.preventDefault();document.getElementById('panel-'+t.dataset.category).querySelector('a')?.focus();}
  });
 });
 // Make Tab traverse an open desktop disclosure before the next nav item.
 dropdowns.forEach(d=>{
  d.addEventListener('keydown',e=>{
   if(e.key!=='Tab'||!desktop.matches)return;
   const focusables=[...d.querySelectorAll('a,button[tabindex="0"]')].filter(el=>el.getClientRects().length);
   const trigger=triggers.find(t=>t.getAttribute('aria-controls')===d.id);
   if(e.shiftKey&&document.activeElement===focusables[0]){e.preventDefault();trigger.focus();}
   else if(!e.shiftKey&&document.activeElement===focusables.at(-1)){
    e.preventDefault();const list=[...nav.children];list[list.indexOf(trigger)+1]?.focus();closeDropdown();
   }
  });
 });
 header.addEventListener('pointerenter',()=>clearTimeout(closeTimer));
 header.addEventListener('pointerleave',()=>{if(desktop.matches&&hover.matches)closeTimer=setTimeout(()=>{if(!header.contains(document.activeElement))closeDropdown();},180);});
 header.addEventListener('focusout',()=>setTimeout(()=>{if(!header.contains(document.activeElement))closeDropdown();},0));
 document.querySelector('.nv-backdrop').addEventListener('click',()=>{closeDropdown();if(!desktop.matches)toggleMobile(false);});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(current)closeDropdown(true);else if(nav.classList.contains('nv-is-open')){toggleMobile(false);mobileButton.focus();}}});
 mobileButton.addEventListener('click',()=>toggleMobile(!nav.classList.contains('nv-is-open')));
 document.querySelector('[data-open-services]')?.addEventListener('click',()=>{if(!desktop.matches)toggleMobile(true);openDropdown('services');categories.find(t=>t.tabIndex===0)?.focus();});
 nav.querySelectorAll('.nv-plain').forEach(a=>a.addEventListener('pointerenter',()=>{if(desktop.matches&&hover.matches)closeDropdown();}));
 header.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{closeDropdown();if(!desktop.matches)toggleMobile(false);}));
 desktop.addEventListener('change',arrange);
 arrange();
 
})();
