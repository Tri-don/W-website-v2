document.documentElement.classList.add('js');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reduce.matches;
const header = document.querySelector('.nv-header');

const progress = document.querySelector('.scroll-progress');
const videos = [...document.querySelectorAll('video')];
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
document.querySelector('#year').textContent=new Date().getFullYear();
