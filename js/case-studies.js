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