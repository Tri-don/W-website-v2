/* One loader per browser-tab session, including direct entry to any page. */
(()=>{
 let first=false;
 try{first=sessionStorage.getItem('wissen-site-visited')!=='1';sessionStorage.setItem('wissen-site-visited','1')}catch{first=!window.name.includes('wissen-site-visited');if(first)window.name+=' wissen-site-visited'}
 window.wissenFirstVisit=first;
 if(!first||matchMedia('(prefers-reduced-motion: reduce)').matches||location.hash){document.documentElement.classList.add('no-site-loader','intro-started');document.addEventListener('DOMContentLoaded',()=>document.querySelector('.m3-loader')?.remove(),{once:true})}
})();
(() => {
 const root=document.documentElement;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 if(!window.wissenFirstVisit || reduce.matches || location.hash) return;
 root.classList.add('intro-pending');
 let started=false, timer;
 const finish=()=>{
  if(started)return;started=true;
  clearTimeout(timer);
  root.classList.remove('intro-pending');root.classList.add('intro-started');
  document.querySelectorAll('[data-m3-inert]').forEach(e=>{e.inert=false;e.removeAttribute('data-m3-inert');});
  setTimeout(()=>document.querySelector('.m3-loader')?.remove(),900);
 };
 timer=setTimeout(finish,3500);
 document.addEventListener('DOMContentLoaded',()=>{
  if(started)return;
  const start=performance.now();
  const loader=document.querySelector('.m3-loader');
  document.querySelectorAll('body > header, body > main, body > footer').forEach(e=>{e.inert=true;e.dataset.m3Inert='';});
  const logo=loader?.querySelector('img');
  const ready=logo?.decode ? logo.decode().catch(()=>{}) : Promise.resolve();
  Promise.race([ready,new Promise(r=>setTimeout(r,1200))]).then(()=>setTimeout(finish,Math.max(0,1150-(performance.now()-start))));
 },{once:true});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')finish();});
 reduce.addEventListener('change',e=>{if(e.matches)finish();});
})();


(() => {
 function setupServiceHeight() {
  const host=document.querySelector('#nv-services .nv-panels');
  const menu=document.getElementById('nv-services');
  if(!host || !menu)return;
  const panels=[...host.querySelectorAll('.nv-capabilities')];
  let measuredWidth=0;
  function measure() {
   const width=host.getBoundingClientRect().width;
   if(!width)return;
   let height=0;
   for(const panel of panels) {
    const copy=panel.cloneNode(true);
    copy.removeAttribute('id');copy.removeAttribute('hidden');
    copy.setAttribute('aria-hidden','true');copy.inert=true;
    copy.style.cssText='position:absolute;left:-10000px;top:0;visibility:hidden;pointer-events:none;display:flex!important;flex:none;height:auto;min-height:0;animation:none!important;transform:none;width:'+width+'px;';
    host.append(copy);
    height=Math.max(height,Math.ceil(copy.getBoundingClientRect().height));
    copy.remove();
   }
   host.style.setProperty('--nv-service-panel-height',height+'px');
   measuredWidth=width;
  }
  new ResizeObserver(() => {
   const width=host.getBoundingClientRect().width;
   if(width && Math.abs(width-measuredWidth)>.5)measure();
  }).observe(host);
  new MutationObserver(() => {if(!menu.hidden)measure();}).observe(menu,{attributes:true,attributeFilter:['hidden']});
  document.fonts.ready.then(measure);
  measure();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setupServiceHeight,{once:true});else setupServiceHeight();
})();

document.addEventListener('DOMContentLoaded',()=>{
 document.querySelectorAll('.nv-header a,.wf a').forEach(a=>{
  const target=new URL(a.href,location.href);if(target.pathname===location.pathname&&!target.hash)a.setAttribute('aria-current','page');
 });
 if(!document.body.classList.contains('bf-page'))return;
 const header=document.querySelector('.nv-header'),progress=document.querySelector('.scroll-progress');
 const scroll=()=>{header.classList.toggle('nv-scrolled',scrollY>100);const max=document.documentElement.scrollHeight-innerHeight;progress.style.transform='scaleX('+(max>0?scrollY/max:0)+')'};
 addEventListener('scroll',scroll,{passive:true});scroll();
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

});


(()=>{
function startPage(){
const page=document.documentElement.dataset.sitePage;
if(page!=="bfsi"){
document.documentElement.classList.add('js');
(function(){
function initialize(){
/* js/main.js */
(function(){

const reduce = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reduce.matches;
const header = document.querySelector('.nv-header');

const progress = document.querySelector('.scroll-progress');
const videos = [...document.querySelectorAll('video:not([data-managed-brain])')];
function applyMotion(){document.body.classList.toggle('motion-paused',paused);document.documentElement.classList.toggle('motion-enabled',!paused);videos.forEach(v=>{v.autoplay=!paused;if(paused)v.pause();else if(!v.hidden && (v.dataset.loaded || !v.hasAttribute('data-lazy-video')))v.play().catch(()=>{});});}

reduce.addEventListener('change',e=>{paused=e.matches;applyMotion();});applyMotion();
let ticking=false;
function updateScroll(){header.classList.toggle('nv-scrolled',scrollY>100);const max=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${max>0?scrollY/max:0})`;ticking=false;}
addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(updateScroll);ticking=true;}},{passive:true});updateScroll();
const observer = new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.08,rootMargin:'0px 0px -25px 0px'});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
const videoObserver=new IntersectionObserver(entries=>entries.forEach(({target:v,isIntersecting})=>{if(isIntersecting){if(!v.dataset.loaded){v.querySelectorAll('source[data-src]').forEach(s=>s.src=s.dataset.src);v.load();v.dataset.loaded='true';}if(!paused && !v.hidden)v.play().catch(()=>{});}else v.pause();}),{rootMargin:'150px'});document.querySelectorAll('[data-lazy-video]').forEach(v=>videoObserver.observe(v));
const statObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;const el=entry.target;statObserver.unobserve(el);if(paused)return;const start=performance.now(),target=Number(el.dataset.count);function step(now){const p=Math.min((now-start)/1400,1),n=Math.round(target*(1-Math.pow(1-p,3)));el.textContent=(el.dataset.prefix||'')+n+(el.dataset.suffix||'');if(p<1&&!paused)requestAnimationFrame(step);else el.textContent=(el.dataset.prefix||'')+target+(el.dataset.suffix||'');}requestAnimationFrame(step);}),{threshold:.8});document.querySelectorAll('[data-count]').forEach(el=>statObserver.observe(el));
if(matchMedia('(pointer:fine)').matches){const glow=document.querySelector('.cursor-glow');document.addEventListener('pointermove',e=>{if(paused)return;glow.style.display='block';glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px';},{passive:true});document.querySelectorAll('.magnetic').forEach(el=>{el.addEventListener('pointermove',e=>{if(paused)return;const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.09}px,${(e.clientY-r.top-r.height/2)*.12}px)`;});el.addEventListener('pointerleave',()=>el.style.transform='');});document.querySelectorAll('.tilt').forEach(el=>{el.addEventListener('pointermove',e=>{if(paused)return;const r=el.getBoundingClientRect();el.style.transform=`perspective(1200px) rotateX(${-(e.clientY-r.top-r.height/2)/150}deg) rotateY(${(e.clientX-r.left-r.width/2)/150}deg)`;});el.addEventListener('pointerleave',()=>el.style.transform='');});}
const footerYear=document.querySelector('#year, #wf-year');if(footerYear)footerYear.textContent=new Date().getFullYear();

})();
/* js/services.js */
(function(){
(() => {
  const section = document.querySelector('.ws-services');
  if (!section) return;
  const elements = [...section.querySelectorAll('.ws-reveal')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('ws-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  elements.forEach((element, index) => {
    element.style.setProperty('--ws-delay', `${Math.min(index * 45, 180)}ms`);
    observer.observe(element);
  });
  section.classList.add('ws-ready');
  reduced.addEventListener('change', event => {
    if (event.matches) {
      observer.disconnect();
      elements.forEach(element => element.classList.add('ws-visible'));
    }
  });
})();

})();
/* js/partners.js */
(function(){
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const targets=[...document.querySelectorAll('.wi-heading,.wi-accordion,.wb-heading,.wb-grid')];
 document.querySelectorAll('.reveal').forEach(el=>{const siblings=[...el.parentElement.children].filter(e=>e.classList.contains('reveal'));el.style.setProperty('--m3-delay',Math.min(siblings.indexOf(el)*55,165)+'ms');});
 if(reduced.matches || !('IntersectionObserver' in window))return;
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('m3-visible');observer.unobserve(entry.target);}}),{threshold:.07,rootMargin:'0px 0px -20px 0px'});
 targets.forEach(el=>{el.classList.add('m3-reveal');observer.observe(el);});
 reduced.addEventListener('change',e=>{if(e.matches){observer.disconnect();targets.forEach(el=>el.classList.add('m3-visible'));}});
})();

})();
/* js/navigation.js */
(function(){
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

})();
/* js/difference.js */
(function(){
(()=>{
 const section=document.querySelector('.wd-difference');
 if(!section)return;
 const track=section.querySelector('.wd-track'),stage=section.querySelector('.wd-stage');
 const panels=[...section.querySelectorAll('.wd-panel')],buttons=[...section.querySelectorAll('.wd-nav button')];
 const desktop=matchMedia('(min-width:760px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const clamp=(v)=>Math.max(0,Math.min(1,v));
 const colors=['rgba(182,160,237,.18)','rgba(182,160,237,.23)','rgba(153,136,188,.19)','rgba(202,177,236,.22)'],origins=['72%','30%','75%','40%'];
 const number=document.createElement('div');number.className='wd-stage-number';number.setAttribute('aria-hidden','true');stage.prepend(number);
 const visuals=panels.map((panel,i)=>{
  const image=panel.querySelector('.wd-image'),base=image.querySelector('img');
  const next=document.createElement('img');next.src=panels[Math.min(3,i+1)].querySelector('.wd-image img').src;next.alt='';next.setAttribute('aria-hidden','true');next.className='wd-next';next.decoding='async';image.append(next);
  const ticks=document.createElement('span');ticks.className='wd-ticks';ticks.setAttribute('aria-hidden','true');ticks.innerHTML='<i><b></b></i>'.repeat(4);panel.querySelector('.wd-count').append(ticks);
  return {original:base.src,base,next,words:[...panel.querySelectorAll('.wd-word')],ticks:[...ticks.querySelectorAll('b')]};
 });
 let active=-1,pending=false,enhanced=false;
 function show(index){
  if(index===active)return;const previous=active;active=index;
  const visual=visuals[index];visual.base.src=previous>=0?visuals[previous].original:visual.original;visual.next.src=visual.original;
  visual.next.getAnimations().forEach(animation=>animation.cancel());
  visual.next.style.setProperty('--wd-radius','150%');
  if(enhanced&&previous>=0)visual.next.animate([{clipPath:'circle(0% at 50% 50%)'},{clipPath:'circle(150% at 50% 50%)'}],{duration:750,easing:'cubic-bezier(.22,.72,.16,1)'});
  panels.forEach((p,i)=>{p.classList.toggle('wd-active',i===index);p.setAttribute('aria-hidden',String(enhanced&&i!==index));p.inert=enhanced&&i!==index;});
  buttons.forEach((b,i)=>b.setAttribute('aria-current',String(i===index)));
  number.textContent='0'+(index+1);stage.style.setProperty('--wd-glow',colors[index]);stage.style.setProperty('--wd-origin',origins[index]);
 }
 function frame(){
  pending=false;if(!enhanced)return;
  const r=track.getBoundingClientRect(),distance=track.offsetHeight-stage.offsetHeight;
  const progress=clamp(-r.top/Math.max(1,distance)),f=progress*4,index=Math.min(3,Math.floor(f)),local=f-index;
  const glowPositions=[16,-14,19,-8],glowStrength=[.75,1,.8,.95];
  const nextIndex=Math.min(3,index+1),blend=clamp(local);
  stage.style.setProperty('--wd-glow-x',(glowPositions[index]+(glowPositions[nextIndex]-glowPositions[index])*blend).toFixed(3)+'%');
  stage.style.setProperty('--wd-glow-opacity',(glowStrength[index]+(glowStrength[nextIndex]-glowStrength[index])*blend).toFixed(3));
  show(index);const visual=visuals[index],on=Math.ceil(Math.min(1,local/0.62)*visual.words.length);
  visual.words.forEach((word,i)=>word.classList.toggle('wd-on',i<on||(index===3&&progress>=.999)));
  number.style.transform='translateY('+((.5-local)*60).toFixed(1)+'px) scale('+(1+local*.06).toFixed(4)+')';
  visual.ticks.forEach((tick,i)=>tick.style.transform='scaleX('+clamp(f-i).toFixed(4)+')');
  buttons.forEach((button,i)=>button.style.setProperty('--wd-progress',clamp(f-i).toFixed(4)));
 }
 function scroll(){if(!pending){pending=true;requestAnimationFrame(frame);}}
 function configure(){enhanced=desktop.matches&&!reduced.matches;section.classList.toggle('wd-enhanced',enhanced);active=-1;show(0);if(enhanced)frame();}
 buttons.forEach((button,i)=>button.addEventListener('click',()=>{if(!enhanced)return;const top=track.getBoundingClientRect().top+window.scrollY,distance=track.offsetHeight-stage.offsetHeight;window.scrollTo({top:top+distance*((i+.28)/4),behavior:'smooth'});}));
 window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',configure);desktop.addEventListener('change',configure);reduced.addEventListener('change',configure);configure();
})();

})();
/* js/people.js */
(function(){
/* Scoped word reveal: preserve the quote's text and emphasis; update at most once per animation frame. */
(()=>{
 const quotes=[...document.querySelectorAll('.wp-quote')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 quotes.forEach(quote=>{
  if(quote.hasAttribute('data-wp-reveal'))return;
  const walker=document.createTreeWalker(quote,NodeFilter.SHOW_TEXT);const nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(node=>{const fragment=document.createDocumentFragment();node.textContent.split(/(\s+)/).forEach(part=>{if(!part)return;if(/^\s+$/.test(part))fragment.append(document.createTextNode(part));else{const word=document.createElement('span');word.className='wp-word';word.textContent=part;fragment.append(word);}});node.replaceWith(fragment);});
  quote.setAttribute('data-wp-reveal','');
 });
 const items=quotes.map(quote=>({quote,words:[...quote.querySelectorAll('.wp-word')]}));let frame=0;
 const clamp=value=>Math.max(0,Math.min(1,value));
 const update=()=>{frame=0;const height=innerHeight;const maxScroll=Math.max(0,document.documentElement.scrollHeight-height);items.forEach(({quote,words})=>{const top=quote.getBoundingClientRect().top+scrollY;const start=Math.max(0,top-height*.9);const end=Math.max(start+1,Math.min(top-height*.45,maxScroll));const progress=reduced.matches||maxScroll===0?1:clamp((scrollY-start)/(end-start));words.forEach((word,index)=>{const brightness=clamp(progress*(words.length+3)-index);word.style.setProperty('--wp-word-opacity',String(.2+.8*brightness));});});};
 const request=()=>{if(!frame)frame=requestAnimationFrame(update);};
 addEventListener('scroll',request,{passive:true});addEventListener('resize',request);reduced.addEventListener('change',request);document.fonts.ready.then(request);update();
})();

})();
/* js/global-presence.js */
(function(){
(()=>{document.querySelectorAll('.wg').forEach(section=>{
 const locations=[{"id":"united-states","name":"United States","region":"North America","x":310.867,"y":167.457,"cities":["New York","Dallas","Seattle"],"points":[{"name":"New York","x":400.422,"y":166.153},{"name":"Dallas","x":314.322,"y":195.926},{"name":"Seattle","x":217.857,"y":140.292}],"zoom":2.6},{"id":"india","name":"India","region":"South Asia","x":965.9925000000001,"y":255.1615,"cities":["Bengaluru","Mumbai","Hyderabad","Pune"],"points":[{"name":"Bengaluru","x":973.135,"y":270.231},{"name":"Mumbai","x":955.316,"y":247.329},{"name":"Hyderabad","x":976.505,"y":253.673},{"name":"Pune","x":959.014,"y":249.413}],"zoom":5},{"id":"united-kingdom","name":"United Kingdom","region":"Europe","x":679.517,"y":125.655,"cities":["London"],"points":[{"name":"London","x":679.517,"y":125.655}],"zoom":5.5},{"id":"australia","name":"Australia","region":"Oceania","x":1251.235,"y":445.963,"cities":["Sydney"],"points":[{"name":"Sydney","x":1251.235,"y":445.963}],"zoom":3.1},{"id":"mexico","name":"Mexico","region":"North America","x":294.667,"y":232.607,"cities":[],"points":[{"name":"Mexico","x":294.667,"y":232.607,"countryOnly":true}],"zoom":3.3},{"id":"vietnam","name":"Vietnam","region":"Southeast Asia","x":1088,"y":258.869,"cities":[],"points":[{"name":"Vietnam","x":1088,"y":258.869,"countryOnly":true}],"zoom":3.3},{"id":"canada","name":"Canada","region":"North America","x":279.556,"y":108.8,"cities":[],"points":[{"name":"Canada","x":279.556,"y":108.8,"countryOnly":true}],"zoom":3.3},{"id":"singapore","name":"Singapore","region":"Southeast Asia","x":1072.208,"y":313.824,"cities":[],"points":[{"name":"Singapore","x":1072.208,"y":313.824}],"zoom":5.5}];const map=section.querySelector('.wg-map'),world=section.querySelector('.wg-zoom-layer'),layer=section.querySelector('.wg-pin-layer'),detail=section.querySelector('.wg-detail');let selected=null;
 const icon='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M9 2h5v5M14 2 7 9M7 3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9"/></svg>';
 const maps=(name,country)=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent('Wissen Technology '+name+' '+(name===country?'':country));
 const link=(name,country,tooltip)=>{const a=document.createElement('a');a.className=tooltip?'wg-tooltip-link':'wg-city-link';a.href=maps(name,country);a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label','Search Wissen Technology in '+name+' on Google Maps (opens in a new tab)');const text=document.createElement('span');text.textContent=tooltip?'Open Google Maps':name;a.append(text);a.insertAdjacentHTML('beforeend',icon);return a;};
 const updateDetail=location=>{detail.querySelector('h3').textContent=location?location.name:'Across borders.';detail.querySelector('.wg-region').textContent=location?location.region:'One connected footprint';const list=detail.querySelector('.wg-office-list');list.hidden=!location||!location.cities.length;const cities=detail.querySelector('.wg-cities');cities.replaceChildren();if(location)location.cities.forEach(city=>cities.append(link(city,location.name,false)));};
 let pinFrame=0,pinEnd=0;
 const syncPins=()=>{const svg=section.querySelector('.wg-world'),matrix=svg.getScreenCTM(),bounds=map.getBoundingClientRect();if(!matrix)return;
  layer.querySelectorAll('[data-map-x]').forEach(pin=>{const position=new DOMPoint(+pin.dataset.mapX,+pin.dataset.mapY).matrixTransform(matrix),x=position.x-bounds.left,y=position.y-bounds.top;pin.style.setProperty('--px',x+'px');pin.style.setProperty('--py',y+'px');if(pin.classList.contains('wg-city-point')){pin.dataset.placement=y<115?'below':'above';pin.style.setProperty('--tip-left',Math.max(8-x,Math.min(-66,map.clientWidth-178-x))+'px');}});
 };
 const followAnimation=()=>{syncPins();if(performance.now()<pinEnd)pinFrame=requestAnimationFrame(followAnimation);else pinFrame=0;};
 const render=(animate=false)=>{cancelAnimationFrame(pinFrame);pinEnd=performance.now()+(animate?1100:50);pinFrame=requestAnimationFrame(followAnimation);world.style.transition=animate?'':'none';const width=map.clientWidth,height=map.clientHeight,baseHeight=width*544/1360;const location=locations.find(l=>l.id===selected);let scale=1,cx=680,cy=272;
  if(location){scale=location.zoom*(width<500?Math.max(1.25,900/width):1);cx=location.points.reduce((n,p)=>n+p.x,0)/location.points.length;cy=location.points.reduce((n,p)=>n+p.y,0)/location.points.length;}
  if(location){const dx=Math.max(...location.points.map(p=>Math.abs(p.x-cx))),dy=Math.max(...location.points.map(p=>Math.abs(p.y-cy)));if(dx)scale=Math.min(scale,(width-64)/2/(dx*width/1360));if(dy)scale=Math.min(scale,(height-110)/2/(dy*baseHeight/544));}const tx=width/2-cx/1360*width*scale,ty=height/2-cy/544*baseHeight*scale;world.style.transform='translate('+tx+'px,'+ty+'px) scale('+scale+')';const pattern=section.querySelector('#wg-dots'),dot=pattern.querySelector('circle');pattern.setAttribute('width',12/scale);pattern.setAttribute('height',12/scale);dot.setAttribute('cx',6/scale);dot.setAttribute('cy',6/scale);dot.setAttribute('r',2.1/scale);map.dataset.zoom=String(scale);map.dataset.country=selected||'world';section.querySelector('.wg-map-status').textContent=location?location.name+' / '+(location.points[0].countryOnly?'Country view':'City view'):'World view';
  section.querySelectorAll('.wg-country').forEach(button=>{const active=button.dataset.location===selected;button.dataset.active=String(active);button.setAttribute('aria-pressed',String(active));});layer.replaceChildren();
  if(!location){locations.forEach(l=>{const b=document.createElement('button');b.type='button';b.className='wg-country-point';b.dataset.mapX=l.x;b.dataset.mapY=l.y;b.style.setProperty('--px',l.x/1360*width+tx+'px');b.style.setProperty('--py',l.y/544*baseHeight+ty+'px');b.setAttribute('aria-label','Zoom to '+l.name);const label=document.createElement('span');label.className='wg-country-point-label';label.textContent=l.name;b.append(label);b.addEventListener('mouseenter',()=>select(l.id));b.addEventListener('click',()=>select(l.id));b.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();select(l.id);}});layer.append(b);});return;}
  location.points.forEach((p,index)=>{const x=p.x/1360*width*scale+tx,y=p.y/544*baseHeight*scale+ty;const point=document.createElement('div');point.className='wg-city-point';point.dataset.mapX=p.x;point.dataset.mapY=p.y;point.style.animation='none';point.dataset.city=p.name;point.dataset.placement=y<115?'below':'above';point.style.setProperty('--px',x+'px');point.style.setProperty('--py',y+'px');point.style.setProperty('--tip-left',Math.max(8-x,Math.min(-66,width-178-x))+'px');const b=document.createElement('button');b.type='button';b.className='wg-city-trigger';b.setAttribute('aria-label',p.name+' — show map link');b.setAttribute('aria-expanded','false');const tooltipId='wg-v2-'+location.id+'-'+index;b.setAttribute('aria-controls',tooltipId);const label=document.createElement('span');label.className='wg-city-label';label.textContent=p.name;const tip=document.createElement('div');tip.className='wg-tooltip';tip.id=tooltipId;const name=document.createElement('strong');name.className='wg-tooltip-city';name.textContent=p.name;const country=document.createElement('span');country.className='wg-tooltip-country';country.textContent=p.countryOnly?'Country search':location.name;tip.append(name,country,link(p.name,location.name,true));point.append(b,label,tip);b.addEventListener('click',()=>{const open=point.dataset.open!=='true';layer.querySelectorAll('.wg-city-point').forEach(other=>{other.dataset.open='false';other.querySelector('button').setAttribute('aria-expanded','false');});point.dataset.open=String(open);b.setAttribute('aria-expanded',String(open));});point.addEventListener('keydown',event=>{if(event.key==='Escape'){point.dataset.open='false';b.setAttribute('aria-expanded','false');b.blur();}});layer.append(point);});
 };
 const select=id=>{if(selected===id)return;selected=id;updateDetail(locations.find(l=>l.id===id));render(true);};
 section.querySelectorAll('.wg-country').forEach(button=>{button.addEventListener('mouseenter',()=>select(button.dataset.location));button.addEventListener('focus',()=>select(button.dataset.location));button.addEventListener('click',()=>select(button.dataset.location));});const reset=()=>{if(selected===null)return;selected=null;updateDetail(null);render(true);};const panel=section.querySelector('.wg-panel');panel.addEventListener('mouseleave',reset);document.addEventListener('pointerdown',event=>{if(!panel.contains(event.target))reset();},{passive:true});panel.addEventListener('focusout',event=>{if(event.relatedTarget&&!panel.contains(event.relatedTarget))reset();});panel.addEventListener('keydown',event=>{if(event.key==='Escape'){reset();}});new ResizeObserver(()=>render(false)).observe(map);updateDetail(null);render();
});})();

})();
/* js/case-studies.js */
(function(){
(()=>{
 const section=document.querySelector('.m6-cases');if(!section)return;
 const track=section.querySelector('.m6-cases-track'),stage=section.querySelector('.m6-cases-stage'),viewport=section.querySelector('.m6-cases-viewport'),row=section.querySelector('.m6-cases-row'),bar=section.querySelector('.m6-cases-progress');
 const desktop=matchMedia('(min-width:900px)'),reduce=matchMedia('(prefers-reduced-motion:reduce)');let driven=false,frame=0;
 const distance=()=>Math.max(0,viewport.scrollWidth-viewport.clientWidth);
 const clamp=left=>Math.max(0,Math.min(distance(),left));
 const origin=()=>scrollY+track.getBoundingClientRect().top;
 const progress=()=>bar.style.setProperty('--case-progress',distance()?viewport.scrollLeft/distance():0);
 const update=()=>{frame=0;if(driven)viewport.scrollLeft=clamp(-track.getBoundingClientRect().top);progress();};
 const request=()=>{if(!frame)frame=requestAnimationFrame(update);};
 const size=()=>{driven=desktop.matches&&!reduce.matches;section.classList.toggle('is-scroll-driven',driven);track.style.height=driven?(Math.ceil(stage.getBoundingClientRect().height)+distance())+'px':'';viewport.scrollTop=0;request();};
 const moveTo=left=>{const target=clamp(left);if(driven)scrollTo({top:origin()+target,behavior:'instant'});viewport.scrollLeft=target;progress();};
 addEventListener('scroll',request,{passive:true});addEventListener('resize',size,{passive:true});viewport.addEventListener('scroll',progress,{passive:true});desktop.addEventListener('change',size);reduce.addEventListener('change',size);
 viewport.addEventListener('wheel',e=>{
  if(e.ctrlKey)return;
  const horizontal=Math.abs(e.deltaX)>Math.abs(e.deltaY)||e.shiftKey;
  // In the sticky desktop layout, vertical wheel input belongs to the page.
  // Its scroll position already drives the horizontal row, including entry/exit.
  if(driven&&!horizontal)return;
  const amount=(horizontal?(e.deltaX||e.deltaY):e.deltaY)*(e.deltaMode===1?16:e.deltaMode===2?viewport.clientWidth:1);
  if(!amount)return;
  const next=clamp(viewport.scrollLeft+amount);
  if(Math.abs(next-viewport.scrollLeft)>.5){e.preventDefault();moveTo(next);}
 },{passive:false});
 let drag=null,suppressClick=false;
 viewport.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;drag={id:e.pointerId,x:e.clientX,left:viewport.scrollLeft,moved:false};suppressClick=false;});
 viewport.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x;if(!drag.moved&&Math.abs(dx)>5){drag.moved=true;suppressClick=true;viewport.setPointerCapture(e.pointerId);viewport.classList.add('is-dragging');}if(drag.moved){e.preventDefault();moveTo(drag.left-dx);}});
 const endDrag=e=>{if(!drag||drag.id!==e.pointerId)return;if(viewport.hasPointerCapture(e.pointerId))viewport.releasePointerCapture(e.pointerId);drag=null;viewport.classList.remove('is-dragging');setTimeout(()=>{suppressClick=false;},0);};
 viewport.addEventListener('pointerup',endDrag);viewport.addEventListener('pointercancel',endDrag);viewport.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopPropagation();}},{capture:true});viewport.addEventListener('dragstart',e=>e.preventDefault());
 viewport.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const target=e.key==='Home'?0:e.key==='End'?distance():viewport.scrollLeft+(e.key==='ArrowRight'?1:-1)*(row.children[0].clientWidth+20);if(driven)moveTo(target);else viewport.scrollTo({left:clamp(target),behavior:reduce.matches?'instant':'smooth'});});
 viewport.addEventListener('focusin',e=>{const card=e.target.closest('.m6-case');if(driven&&card)moveTo(card.offsetLeft-innerWidth*.06);});
 const observer=new ResizeObserver(size);observer.observe(row);observer.observe(stage);
 size();document.fonts.ready.then(size);
})();
})();
/* js/hero-merged.js */
(function(){
if (!document.querySelector('.hero')) return;
(()=>{
 const hero=document.querySelector('.hero'), first=hero.querySelector('video');
 const second=first.cloneNode(true);second.removeAttribute('poster');second.removeAttribute('autoplay');
 const surface=document.createElement('canvas');surface.className='hero-video brain-loop-surface';surface.width=surface.height=768;
 surface.style.display='none';first.after(second,surface);
 const ctx=surface.getContext('2d',{alpha:false}),videos=[first,second];
 videos.forEach(video=>{video.loop=false;video.muted=true;video.preload='auto';video.style.display='none';});
 // The original video remains visible until the first decoded frame is ready.
 first.style.display='';
 let active=0,blending=false,running=false,raf=0,overlap=1;
 function paint(video,alpha){if(video.readyState<2)return;const w=video.videoWidth,h=video.videoHeight,edge=Math.min(w,h);ctx.globalAlpha=alpha;ctx.drawImage(video,(w-edge)/2,(h-edge)/2,edge,edge,0,0,768,768);}
 function reset(video){video.pause();video.currentTime=0;}
 function frame(){raf=0;if(!running)return;const outgoing=videos[active],incoming=videos[1-active];
  if(outgoing.readyState>=2){
   surface.style.display='';first.style.display='none';
   if(Number.isFinite(outgoing.duration)&&outgoing.duration>0){overlap=Math.min(1.25,outgoing.duration/4);
    if(!blending&&outgoing.currentTime>=outgoing.duration-overlap){blending=true;incoming.play().catch(()=>{blending=false;});}
   }
   ctx.globalAlpha=1;ctx.fillStyle='#000';ctx.fillRect(0,0,768,768);paint(outgoing,1);
   if(blending&&incoming.readyState>=2){const progress=Math.min(1,incoming.currentTime/overlap);paint(incoming,progress*progress*(3-2*progress));
    if(progress>=1){active=1-active;blending=false;reset(outgoing);surface.dataset.transitions=String(Number(surface.dataset.transitions||0)+1);}
   }
   ctx.globalAlpha=1;
  }
  raf=requestAnimationFrame(frame);
 }
 window.brainLoop={autoplay:true,play(){running=true;const pending=[videos[active].play()];if(blending)pending.push(videos[1-active].play());if(!raf)raf=requestAnimationFrame(frame);return Promise.all(pending);},pause(){running=false;cancelAnimationFrame(raf);raf=0;videos.forEach(video=>video.pause());}};
 videos.forEach(video=>video.addEventListener('error',()=>{surface.dataset.error=video.error?.message||'Video decode failed';}));
})();
(()=>{const h=document.querySelector('.hero'),c=h.querySelector('canvas'),ctx=c.getContext('2d'),a=h.querySelector('.hero-art'),v=window.brainLoop,reduce=matchMedia('(prefers-reduced-motion:reduce)'),fine=matchMedia('(pointer:fine)');let w=0,H=0,p=[],f=0,visible=true,t=0,last=0;const m={x:0,y:0,tx:0,ty:0,on:false},b={x:0,y:0};const size=()=>{const r=h.getBoundingClientRect();w=r.width;H=r.height;const d=Math.min(devicePixelRatio||1,2);c.width=w*d;c.height=H*d;ctx.setTransform(d,0,0,d,0,0);p=Array.from({length:Math.min(155,Math.round(w*H/8500))},()=>{const x=Math.random()*w,y=Math.random()*H;return{x,y,ox:x,oy:y,vx:0,vy:0,phase:Math.random()*6.28,r:.6+Math.random()}});};function draw(dt){t+=dt/1000;ctx.clearRect(0,0,w,H);const smooth=1-Math.pow(.88,dt/16.67||1);m.x+=(m.tx-m.x)*smooth;m.y+=(m.ty-m.y)*smooth;const ax=m.on?m.x:w*(.72+.1*Math.sin(t*.3)),ay=m.on?m.y:H*(.48+.13*Math.cos(t*.4)),R=m.on?250:200;for(const q of p){if(!reduce.matches){const dx=ax-q.x,dy=ay-q.y,d=Math.hypot(dx,dy)||1;if(d<R){const z=(1-d/R)*.7;q.vx+=dx/d*z;q.vy+=dy/d*z;if(d<38){q.vx-=dx/d*1.1;q.vy-=dy/d*1.1}}q.vx+=(q.ox+Math.sin(t+q.phase)*10-q.x)*.006;q.vy+=(q.oy+Math.cos(t*.8+q.phase)*10-q.y)*.006;q.vx*=.9;q.vy*=.9;q.x+=q.vx*Math.min(dt/16.67,2);q.y+=q.vy*Math.min(dt/16.67,2)}}ctx.lineWidth=.8;for(let i=0;i<p.length;i++){const q=p[i],d=Math.hypot(ax-q.x,ay-q.y),z=Math.max(0,1-d/(R*1.15));for(let j=i+1;j<p.length;j++){const u=p[j],gap=Math.hypot(q.x-u.x,q.y-u.y);if(gap<100){ctx.strokeStyle='rgba(182,160,237,'+((1-gap/100)*(.025+z*.42))+')';ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(u.x,u.y);ctx.stroke()}}if(m.on&&d<R*.6){ctx.strokeStyle='rgba(182,160,237,'+(z*.13)+')';ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(ax,ay);ctx.stroke()}ctx.fillStyle='rgba(200,183,240,'+(.13+z*.65)+')';ctx.beginPath();ctx.arc(q.x,q.y,q.r*(1+z*.6),0,Math.PI*2);ctx.fill()}const nx=m.on&&!reduce.matches?Math.max(-1,Math.min(1,(m.tx/w-.5)*2)):0,ny=m.on&&!reduce.matches?Math.max(-1,Math.min(1,(m.ty/H-.5)*2)):0;b.x+=(nx-b.x)*smooth*.65;b.y+=(ny-b.y)*smooth*.65;a.style.setProperty('--bx',b.x*23+'px');a.style.setProperty('--by',b.y*17+'px');a.style.setProperty('--rx',-b.y*5+'deg');a.style.setProperty('--ry',b.x*7+'deg');a.style.setProperty('--brain-light',1+Math.abs(b.x)*.08)}function stop(){cancelAnimationFrame(f);f=0;last=0}function frame(now){f=0;if(reduce.matches){v.autoplay=false;v.pause();draw(0);return}if(!visible||document.hidden)return;draw(last?Math.min(32,now-last):16.67);last=now;f=requestAnimationFrame(frame)}function start(){if(!f&&visible&&!document.hidden&&!reduce.matches){last=0;f=requestAnimationFrame(frame)}}h.addEventListener('pointermove',e=>{if(!fine.matches||reduce.matches||e.pointerType==='touch')return;const r=h.getBoundingClientRect();m.tx=e.clientX-r.left;m.ty=e.clientY-r.top;if(!m.on){m.x=m.tx;m.y=m.ty}m.on=true});h.addEventListener('pointerleave',()=>m.on=false);new ResizeObserver(()=>{size();if(reduce.matches)draw(0)}).observe(h);new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(visible){start();if(!reduce.matches)v.play().catch(()=>{})}else{stop();v.pause()}}).observe(h);document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();v.pause()}else{start();if(visible&&!reduce.matches)v.play().catch(()=>{})}});reduce.addEventListener('change',()=>{m.on=false;v.autoplay=!reduce.matches;if(reduce.matches){stop();v.pause();draw(0)}else{start();v.play().catch(()=>{})}});size();if(reduce.matches){v.autoplay=false;v.pause();draw(0)}else start()})();
})();
/* js/blog-mask.js */
(function(){
(()=>{
 const mask=document.querySelector('#wb-engineering-mask'),photo=document.querySelector('.wb-mask-photo');if(!mask||!photo)return;
 const shapes=[[[100,0],[235,250],[-35,250]],[[370,0],[505,250],[235,250]],[[370,0],[640,0],[505,250]],[[-35,250],[235,250],[100,500]],[[235,250],[505,250],[370,500]],[[235,250],[370,500],[100,500]],[[-170,0],[100,0],[-35,250]]],polygons=[...mask.querySelectorAll('polygon')];
 const inset=function inset(points,gap){const area=points.reduce((a,p,i)=>a+p[0]*points[(i+1)%3][1]-points[(i+1)%3][0]*p[1],0),sign=Math.sign(area);const lines=points.map((p,i)=>{const q=points[(i+1)%3],dx=q[0]-p[0],dy=q[1]-p[1],length=Math.hypot(dx,dy),nx=-dy/length*sign,ny=dx/length*sign;return {nx,ny,c:nx*p[0]+ny*p[1]+gap};});return lines.map((line,i)=>{const prev=lines[(i+2)%3],det=prev.nx*line.ny-line.nx*prev.ny;return [(prev.c*line.ny-line.c*prev.ny)/det,(prev.nx*line.c-line.nx*prev.c)/det];});};
 function size(){const {width,height}=photo.getBoundingClientRect();if(!width||!height)return;const gutter=Math.max(8,Math.min(14,width*.028));
  shapes.forEach((triangle,i)=>{const scaled=triangle.map(([x,y])=>[x/600*width,y/500*height]);polygons[i].setAttribute('points',inset(scaled,gutter/2).map(([x,y])=>(x/width).toFixed(8)+','+((y-gutter/2)/height).toFixed(8)).join(' '));});
  photo.dataset.maskGap=gutter.toFixed(3);
 }
 new ResizeObserver(size).observe(photo);size();
})();
})();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
})();

}
if(page==="bfsi"){
(function(){

(()=>{
const first=document.querySelector('video'),film=document.querySelector('.bh-film'),hero=document.querySelector('.bh-hero'),motion=matchMedia('(prefers-reduced-motion: reduce)');
const second=first.cloneNode(true);first.loop=false;second.loop=false;first.removeAttribute('autoplay');second.removeAttribute('autoplay');second.setAttribute('aria-hidden','true');film.insertBefore(second,film.querySelector('video').nextSibling);
const videos=[first,second];let active=first,incoming=null,visible=true,frame=null,timer=null;const blend=.85;
function finish(){if(!incoming)return;const old=active;active=incoming;incoming=null;active.style.opacity='1';active.style.zIndex='1';old.style.opacity='0';old.style.zIndex='0';old.pause();old.currentTime=0;hero.dataset.loopSwaps=String(Number(hero.dataset.loopSwaps||0)+1);clearTimeout(timer);timer=null;}
function crossfade(){if(incoming)return;const next=videos.find(v=>v!==active);if(next.readyState<2)return;incoming=next;next.currentTime=0;next.style.transition='none';next.style.opacity='0';next.style.zIndex='2';active.style.zIndex='1';void next.offsetWidth;
next.play().then(()=>{if(incoming!==next)return;next.style.transition='opacity '+blend+'s linear';requestAnimationFrame(()=>next.style.opacity='1');timer=setTimeout(finish,blend*1000+20);}).catch(()=>{incoming=null;next.style.opacity='0';});}
function tick(){frame=null;if(motion.matches||document.hidden||!visible){sync();return;}if(!incoming&&Number.isFinite(active.duration)&&active.duration>blend*2&&active.currentTime>=active.duration-blend)crossfade();frame=requestAnimationFrame(tick);}
function sync(){const paused=motion.matches||document.hidden||!visible;if(paused){finish();videos.forEach(v=>v.pause());if(frame!==null)cancelAnimationFrame(frame);frame=null;}else{active.play().catch(()=>{});if(incoming)incoming.play().catch(()=>{});if(frame===null)frame=requestAnimationFrame(tick);}}
videos.forEach(v=>{v.addEventListener('play',()=>{if(motion.matches||document.hidden||!visible)v.pause()});v.addEventListener('ended',()=>{if(v===active&&!incoming){v.currentTime=0;sync();}})});first.addEventListener('loadeddata',()=>{if(motion.matches)first.currentTime=Math.min(1,first.duration/2);sync()});motion.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);if('IntersectionObserver' in window)new IntersectionObserver(es=>{visible=es[0].isIntersecting;sync()},{threshold:.03}).observe(hero);sync();
})();


(()=>{
const section=document.querySelector('.bs-shift'),stage=section.querySelector('.bs-stage'),heading=section.querySelector('.bs-statement');
const motion=matchMedia('(prefers-reduced-motion: reduce)');
// Preserve a single accessible sentence while revealing its visual words.
const original=heading.textContent;heading.setAttribute('aria-label',original);
const nodes=[...heading.childNodes];
function split(node){if(node.nodeType===Node.TEXT_NODE){const fragment=document.createDocumentFragment();node.textContent.split(/(\s+)/).forEach(token=>{if(!token)return;if(/^\s+$/.test(token)){fragment.append(document.createTextNode(token));return}const word=document.createElement('span');word.className='bs-word';word.textContent=token;word.setAttribute('aria-hidden','true');fragment.append(word)});node.replaceWith(fragment)}else if(node.nodeType===Node.ELEMENT_NODE){[...node.childNodes].forEach(split);node.setAttribute('aria-hidden','true')}}
nodes.forEach(split);const words=[...heading.querySelectorAll('.bs-word')];
let distance=0,queued=false,sticky=true,stickyTop=74;
const clamp=(n,min=0,max=1)=>Math.min(max,Math.max(min,n));
function render(){queued=false;const rect=section.getBoundingClientRect();let progress;
if(motion.matches)progress=1;
else if(sticky)progress=clamp((stickyTop-rect.top)/distance);
else{const headingRect=heading.getBoundingClientRect();progress=clamp((innerHeight*.88-headingRect.top)/(Math.min(innerHeight*.65,headingRect.height+innerHeight*.3)));}
const cursor=progress*(words.length+1.5);words.forEach((word,i)=>word.style.setProperty('--bs-fill',clamp(cursor-i)*100+'%'));section.dataset.progress=progress.toFixed(3);}
function measure(){section.classList.add('bs-enhanced');section.style.height='auto';stage.style.position='relative';const height=stage.getBoundingClientRect().height;const navbar=document.querySelector('.nv-header').getBoundingClientRect().height;sticky=!motion.matches&&height<=innerHeight-navbar-32;
if(sticky){distance=innerHeight*1.4;stickyTop=Math.max(navbar+16,(innerHeight-height+navbar)/2);section.style.height=height+distance+'px';section.style.setProperty('--bs-sticky-top',stickyTop+'px');stage.style.position='sticky';}
else{distance=0;section.style.height='auto';stage.style.position='relative';section.style.setProperty('--bs-sticky-top','0px');}
render();}
const schedule=()=>{if(!queued){queued=true;requestAnimationFrame(render)}};
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',measure,{passive:true});motion.addEventListener('change',measure);measure();document.fonts.ready.then(measure);
})();


/* js/blog-mask.js */
(function(){
(()=>{
 const mask=document.querySelector('#wb-engineering-mask'),photo=document.querySelector('.wb-mask-photo');if(!mask||!photo)return;
 const shapes=[[[100,0],[235,250],[-35,250]],[[370,0],[505,250],[235,250]],[[370,0],[640,0],[505,250]],[[-35,250],[235,250],[100,500]],[[235,250],[505,250],[370,500]],[[235,250],[370,500],[100,500]],[[-170,0],[100,0],[-35,250]]],polygons=[...mask.querySelectorAll('polygon')];
 const inset=function inset(points,gap){const area=points.reduce((a,p,i)=>a+p[0]*points[(i+1)%3][1]-points[(i+1)%3][0]*p[1],0),sign=Math.sign(area);const lines=points.map((p,i)=>{const q=points[(i+1)%3],dx=q[0]-p[0],dy=q[1]-p[1],length=Math.hypot(dx,dy),nx=-dy/length*sign,ny=dx/length*sign;return {nx,ny,c:nx*p[0]+ny*p[1]+gap};});return lines.map((line,i)=>{const prev=lines[(i+2)%3],det=prev.nx*line.ny-line.nx*prev.ny;return [(prev.c*line.ny-line.c*prev.ny)/det,(prev.nx*line.c-line.nx*prev.c)/det];});};
 function size(){const {width,height}=photo.getBoundingClientRect();if(!width||!height)return;const gutter=Math.max(8,Math.min(14,width*.028));
  shapes.forEach((triangle,i)=>{const scaled=triangle.map(([x,y])=>[x/600*width,y/500*height]);polygons[i].setAttribute('points',inset(scaled,gutter/2).map(([x,y])=>(x/width).toFixed(8)+','+((y-gutter/2)/height).toFixed(8)).join(' '));});
  photo.dataset.maskGap=gutter.toFixed(3);
 }
 new ResizeObserver(size).observe(photo);size();
})();
})();

(()=>{
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 document.querySelector('#wf-year').textContent=new Date().getFullYear();
 if('IntersectionObserver' in window&&!motion.matches){
  const targets=[];
  const register=(selector,direction='bottom',stagger=0)=>document.querySelectorAll(selector).forEach((el,i)=>{
   el.classList.add('bf-enter');el.dataset.entrance=direction;
   el.style.setProperty('--bf-enter-x',direction==='left'?'-36px':direction==='right'?'36px':'0px');
   el.style.setProperty('--bf-enter-y',direction==='bottom'?'30px':'0px');
   el.style.setProperty('--bf-enter-delay',Math.min(i*stagger,240)+'ms');targets.push(el);
  });
  register('.bh-header','bottom');register('.bh-footer p','bottom',100);register('.bh-action','right');
  register('.bs-statement','bottom');register('.bs-metric--left','left');register('.bs-intro,.bs-metric--center','bottom',100);register('.bs-metric--right','right');
  register('.be-heading','bottom');register('.be-card','bottom',85);register('.be-image','right');
  register('.wb-heading>div:first-child','left');register('.wb-intro','right');register('.wb-card','bottom',100);
  register('.bf-cta h2,.bf-cta p,.bf-cta-actions','bottom',100);
  register('.wf-info','left');register('.wf-column','bottom',85);register('.wf-middle,.wf-bottom','bottom');
  const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('bf-in-view');observer.unobserve(e.target)}}),{threshold:.08,rootMargin:'0px 0px -24px 0px'});
  targets.forEach(el=>observer.observe(el));
  // Keyboard navigation and restored anchors should never land on hidden content.
  document.addEventListener('focusin',e=>{const el=e.target.closest('.bf-enter');if(el){el.classList.add('bf-in-view');observer.unobserve(el)}});
  motion.addEventListener('change',e=>{if(e.matches){observer.disconnect();targets.forEach(el=>el.classList.add('bf-in-view'))}});
 }
})();

})();
}
if(page==="ai"){
(function(){
/* exports/mark7/js/ai-ml-v2.js */

(()=>{
 const timeline=document.querySelector('.aj-timeline');
 const rows=[...timeline.querySelectorAll('.aj-row')];
 const dots=rows.map(row=>row.querySelector('.aj-dot'));
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 let positions=[],first=0,last=0,displayed=0,target=0,frame=0,previous=0;
 const clamp=x=>Math.max(0,Math.min(1,x));
 const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
 function measure(){
  const top=timeline.getBoundingClientRect().top+scrollY;
  positions=dots.map(dot=>{const rect=dot.getBoundingClientRect();return rect.top+scrollY+rect.height/2-top});
  first=positions[0];last=positions.at(-1);
  timeline.style.setProperty('--rail-top',first+'px');
  timeline.style.setProperty('--rail-height',(last-first)+'px');
  update();
 }
 function update(){
  target=Math.max(0,Math.min(last-first+128,innerHeight*.64-timeline.getBoundingClientRect().top-first));
  if(!frame){previous=performance.now();frame=requestAnimationFrame(paint)}
 }
 function paint(now){
  const dt=Math.min(64,now-previous);previous=now;
  displayed=motion.matches?target:displayed+(target-displayed)*(1-Math.exp(-dt/95));
  if(Math.abs(displayed-target)<.04)displayed=target;
  timeline.style.setProperty('--fill',Math.min(displayed,last-first)+'px');
  timeline.style.setProperty('--tip',displayed>0?1:0);
  const head=first+displayed;
  const started=target>0;
  rows.forEach((row,index)=>{
   const distance=head-positions[index];
   // The dot completes its fade before the panel begins to bloom.
   const dot=started?smooth((distance+24)/32):0;
   const wash=started?smooth((distance-10)/105):0;
   row.style.setProperty('--dot',dot.toFixed(4));
   row.style.setProperty('--wash',wash.toFixed(4));
   row.style.setProperty('--focus',(wash*(1-smooth((distance-180)/150))).toFixed(4));
  });
  frame=displayed===target?0:requestAnimationFrame(paint);
 }
 addEventListener('scroll',update,{passive:true});
 addEventListener('resize',measure,{passive:true});
 motion.addEventListener('change',update);
 new ResizeObserver(measure).observe(timeline);
 document.fonts.ready.then(measure);
 measure();
})();


(()=>{
 document.querySelectorAll('.as-section').forEach(section=>{
 const heading=section.querySelector('.as-heading'),stack=section.querySelector('.as-stack');
 let cards=[],frame=0;
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=x=>Math.max(0,Math.min(1,x));
 function measure(){
  cards=[...stack.querySelectorAll('.as-card')];
  section.style.setProperty('--heading-height',heading.getBoundingClientRect().height+'px');
  cards.forEach((card,index)=>{card.style.setProperty('--index',index);card.style.zIndex=index+1});
  const step=parseFloat(getComputedStyle(section).getPropertyValue('--stack-step'));
  const navbarSpace=parseFloat(getComputedStyle(section).getPropertyValue('--navbar-space'));
  const cardGap=parseFloat(getComputedStyle(section).getPropertyValue('--card-gap'));
  const available=innerHeight-navbarSpace-heading.getBoundingClientRect().height-cardGap-(cards.length-1)*step;
  section.classList.toggle('as-short',available<(cards[0]?.offsetHeight||0)+20);
  update();
 }
 function update(){if(!frame)frame=requestAnimationFrame(paint)}
 function paint(){
  frame=0;
  const last=cards.at(-1);
  // Release the pinned heading at the same point as the final card.
  // Their gap stays constant while the following section enters.
  const exit=last&&!section.classList.contains('as-short')?Math.min(0,last.getBoundingClientRect().top-parseFloat(getComputedStyle(last).top)):0;
  heading.style.setProperty('--heading-exit',exit+'px');
  cards.forEach((card,index)=>{
   card.style.setProperty('--card-exit',index<cards.length-1?exit+'px':'0px');
   const next=cards[index+1];
   const amount=next&&!section.classList.contains('as-short')&&!motion.matches?clamp((card.getBoundingClientRect().bottom-next.getBoundingClientRect().top)/card.offsetHeight):0;
   card.style.setProperty('--covered',amount.toFixed(4));
   // Covered links leave the tab order; visible cards retain full keyboard access.
   const hidden=next&&next.getBoundingClientRect().top<card.getBoundingClientRect().top+65;
   card.querySelectorAll('a').forEach(link=>{if(hidden)link.tabIndex=-1;else link.removeAttribute('tabindex')});
  });
 }
 new ResizeObserver(measure).observe(heading);
 new MutationObserver(measure).observe(stack,{childList:true});
 addEventListener('resize',measure,{passive:true});addEventListener('scroll',update,{passive:true});motion.addEventListener('change',update);
 document.fonts.ready.then(measure);measure();
 });
})();

})();
(function(){
/* exports/mark7/js/ai-ml-v2-hero.js */

(()=>{
 const videos=[...document.querySelectorAll('.ah-video')],hero=document.querySelector('.ah-hero'),motion=matchMedia('(prefers-reduced-motion: reduce)');
 let active=0,visible=true,fading=false,frame=0,swaps=0;
 const fade=.75;
 videos.forEach((v,i)=>{v.muted=true;v.loop=false;v.style.zIndex=i===0?'1':'0';v.style.opacity=i===0?'1':'0';});
 function running(){return visible&&!document.hidden&&!motion.matches}
 function tick(){
  frame=0;if(!running()){videos.forEach(v=>v.pause());return;}
  const current=videos[active],next=videos[1-active];
  if(!fading&&Number.isFinite(current.duration)&&current.currentTime>=current.duration-fade&&next.readyState>=2){
   fading=true;next.style.zIndex='2';next.style.opacity='0';next.play().catch(()=>{fading=false;});
  }
  if(fading){
   const progress=Math.min(1,next.currentTime/fade);
   next.style.opacity=progress.toFixed(4);
   if(progress>=1){
    current.pause();current.style.opacity='0';current.style.zIndex='0';current.currentTime=0;
    active=1-active;next.style.zIndex='1';next.style.opacity='1';fading=false;
    hero.dataset.loopTransitions=String(++swaps);
   }
  }
  frame=requestAnimationFrame(tick);
 }
 function sync(){
  if(!running()){videos.forEach(v=>v.pause());cancelAnimationFrame(frame);frame=0;return;}
  videos[active].play().catch(()=>{});if(fading)videos[1-active].play().catch(()=>{});
  if(!frame)frame=requestAnimationFrame(tick);
 }
 videos.forEach((v,i)=>v.addEventListener('loadeddata',()=>{if(motion.matches&&i===active)v.currentTime=Math.min(1.5,v.duration/2);sync();}));
 motion.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.05}).observe(hero);sync();
})();

})();
}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",startPage,{once:true});else startPage();
})();

/* Fill gaps in scroll motion without registering existing animated sections twice. */
(() => {
  function initializeEntrances() {
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    if(motion.matches || document.body.classList.contains('motion-paused') || !('IntersectionObserver' in window))return;
    const protectedSections='.hero,.bh-hero,.ah-hero,.wd-difference,.aj-section,.as-section,.m6-cases,.bs-shift,.wp';
    const existingMotion='.reveal,.ws-reveal,.m3-reveal,.bf-enter,.be-reveal,.ip-reveal,[data-wp-reveal]';
    const targets=[];
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      observer.unobserve(entry.target);
      entry.target.dataset.enterState='entering';
    }),{threshold:.06,rootMargin:'0px 0px -24px 0px'});
    function register(element,index=0,direction='bottom') {
      if(!element || element.matches(existingMotion) || element.querySelector(existingMotion) || element.closest(protectedSections) || element.classList.contains('site-enter'))return;
      element.classList.add('site-enter');
      element.dataset.enterState='pending';
      element.dataset.enterDirection=direction;
      element.style.setProperty('--enter-delay',Math.min(index*75,225)+'ms');
      element.style.setProperty('--enter-x',direction==='left'?'-20px':direction==='right'?'20px':'0px');
      element.style.setProperty('--enter-y',direction==='bottom'?'24px':'0px');
      element.addEventListener('animationend',event=>{
        if(event.target===element && event.animationName==='site-section-enter')element.dataset.enterState='done';
      });
      targets.push(element);observer.observe(element);
    }
    document.querySelectorAll('main > section').forEach(section=>{
      if(section.matches(protectedSections) || section.querySelector(existingMotion))return;
      if(section.matches('.rai')) {
        section.querySelectorAll('.rai-eyebrow,.rai-heading,.rai-diagram').forEach((el,i)=>register(el,i));
      } else if(section.matches('.m6-cta')) {
        section.querySelectorAll('h2,.m6-cta-description,.m6-cta-actions').forEach((el,i)=>register(el,i));
      } else if(section.matches('.wg')) {
        register(section.querySelector('.wg-heading'));
        // Fade the map only: its positioning and hover calculations stay unchanged.
        register(section.querySelector('.wg-panel'),1,'fade');
        register(section.querySelector('.wg-detail'),2);
      } else {
        register(section);
      }
    });
    const footer=document.querySelector('footer.wf');
    if(footer && !footer.querySelector(existingMotion)) {
      footer.querySelectorAll('.wf-info,.wf-column,.wf-middle,.wf-bottom').forEach((el,i)=>register(el,i,i===0?'left':'bottom'));
    }
    const finish=element=>{observer.unobserve(element);element.dataset.enterState='done';};
    document.addEventListener('focusin',event=>{
      const element=event.target.closest('.site-enter');if(element)finish(element);
    });
    motion.addEventListener('change',event=>{
      if(event.matches){observer.disconnect();targets.forEach(finish);}
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initializeEntrances,{once:true});
  else initializeEntrances();
})();
