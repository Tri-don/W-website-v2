document.addEventListener('DOMContentLoaded',()=>{
 const root=document.querySelector('.ab-slider');
 if(root){
  const slides=[...root.querySelectorAll('.ab-slide')],dots=[...root.querySelectorAll('[data-slide]')],status=root.querySelector('[data-slider-status]');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');let active=0,timer=0,touchStart=null;
  function schedule(){clearTimeout(timer);if(!document.hidden&&!reduce.matches)timer=setTimeout(()=>show(active+1,false),7000)}
  function show(i,announce=true){active=(i+slides.length)%slides.length;slides.forEach((el,j)=>{el.classList.toggle('is-active',j===active);el.setAttribute('aria-hidden',String(j!==active))});dots.forEach((el,j)=>el.setAttribute('aria-current',String(j===active)));if(announce)status.textContent=`Slide ${active+1} of ${slides.length}`;schedule()}
  dots.forEach((b,i)=>b.addEventListener('click',()=>show(i)));
  root.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();show(active+(e.key==='ArrowRight'?1:-1))}});
  root.addEventListener('touchstart',e=>{touchStart=e.changedTouches[0].clientX},{passive:true});root.addEventListener('touchend',e=>{if(touchStart===null)return;const distance=e.changedTouches[0].clientX-touchStart;if(Math.abs(distance)>50)show(active+(distance<0?1:-1));touchStart=null},{passive:true});
  document.addEventListener('visibilitychange',schedule);reduce.addEventListener('change',schedule);schedule();
 }
 const tabs=[...document.querySelectorAll('.ab-tabs [role=tab]')];
 function selectTab(tab,focus=false){tabs.forEach(t=>{const selected=t===tab;t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!selected});if(focus)tab.focus()}
 tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>selectTab(tab));tab.addEventListener('keydown',e=>{let index;if(e.key==='ArrowRight')index=(i+1)%tabs.length;else if(e.key==='ArrowLeft')index=(i-1+tabs.length)%tabs.length;else if(e.key==='Home')index=0;else if(e.key==='End')index=tabs.length-1;else return;e.preventDefault();selectTab(tabs[index],true)})});
});
