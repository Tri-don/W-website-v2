(() => {
 const root=document.documentElement;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 if(reduce.matches || location.hash) return;
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
