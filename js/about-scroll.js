/* About page scroll entrances and content-sized event stack. */
document.addEventListener('DOMContentLoaded',()=>{
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const section=document.querySelector('#events.as-section');
 if(section){
  const heading=section.querySelector('.as-heading'),cards=[...section.querySelectorAll('.as-card')];
  let frame=0,measuring=false;
  const clamp=n=>Math.max(0,Math.min(1,n));
  function paint(){
   frame=0;
   if(!cards.length)return;
   const last=cards.at(-1),stacking=!section.classList.contains('ab-stack-static');
   const release=stacking?Math.min(0,last.getBoundingClientRect().top-parseFloat(getComputedStyle(last).top)):0;
   heading.style.setProperty('--heading-exit',release+'px');
   cards.forEach((card,i)=>{
    card.style.setProperty('--card-exit',i<cards.length-1?release+'px':'0px');
    const next=cards[i+1];
    const covered=stacking&&next&&!motion.matches?clamp((card.getBoundingClientRect().bottom-next.getBoundingClientRect().top)/card.offsetHeight):0;
    card.style.setProperty('--covered',covered.toFixed(4));
   });
  }
  function update(){if(!frame)frame=requestAnimationFrame(paint)}
  function measure(){
   if(measuring)return;measuring=true;
   const nav=innerWidth<=700?76:90,step=12,gap=18;
   section.classList.remove('as-short','ab-stack-static','ab-heading-flow');
   section.style.setProperty('--navbar-space',nav+'px');section.style.setProperty('--stack-step',step+'px');section.style.setProperty('--card-gap',gap+'px');
   let natural=320;
   cards.forEach((card,i)=>{
    card.style.setProperty('--index',i);card.style.zIndex=i+1;
    card.style.height='auto';card.style.minHeight='0';
    natural=Math.max(natural,Math.ceil(card.querySelector('.as-copy').getBoundingClientRect().height));
    card.style.removeProperty('height');card.style.removeProperty('min-height');
   });
   let headingHeight=heading.offsetHeight;
   const room=innerHeight-nav-headingHeight-gap-(cards.length-1)*step-24;
   if(room<natural){section.classList.add('ab-heading-flow');headingHeight=0}
   const available=innerHeight-nav-headingHeight-gap-(cards.length-1)*step-24;
   const staticMode=innerWidth<700||available<natural||motion.matches;
   section.classList.toggle('ab-stack-static',staticMode);
   section.style.setProperty('--heading-height',headingHeight+'px');
   section.style.setProperty('--event-card-height',Math.max(natural,Math.min(440,available))+'px');
   measuring=false;update();
  }
  let resizeFrame=0;
  function resize(){cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(measure)}
  new ResizeObserver(resize).observe(heading);
  addEventListener('resize',resize,{passive:true});addEventListener('scroll',update,{passive:true});
  motion.addEventListener('change',measure);document.fonts.ready.then(measure);measure();
 }
 const targets=new Set();
 const register=(selector,direction='up',stagger=0)=>document.querySelectorAll(selector).forEach((el,i)=>{
  el.dataset.abDirection=direction;el.style.setProperty('--ab-delay',Math.min(i%4*stagger,240)+'ms');targets.add(el);
 });
 register('.ab-slider-content h1,.ab-slider-content p','up',100);
 register('.ab-heading h2,.ab-why-sticky h2','left');
 register('.ab-heading>p,.ab-why-copy p','right',80);
 register('.ab-stats>div,.ab-person,.ab-values article','up',70);
 register('.ab-tabs','up');
 register('#events .as-heading h2,#events .as-heading p','up',80);
 register('#events .as-copy>*','left',70);register('#events .as-art img','right');
 register('.wb-heading>div:first-child','left');register('.wb-intro','right');register('.wb-card','up',90);
 register('.wf-info,.wf-column,.wf-middle,.wf-bottom','up',70);
 let observer;
 function show(el){el.classList.add('ab-in-view')}
 function animate(){
  observer?.disconnect();
  if(motion.matches||!('IntersectionObserver' in window)){targets.forEach(show);return}
  observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){show(entry.target);observer.unobserve(entry.target)}}),{threshold:.08,rootMargin:'0px 0px -24px 0px'});
  targets.forEach(el=>{if(!el.classList.contains('ab-in-view')){el.classList.add('ab-enter');observer.observe(el)}});
 }
 document.addEventListener('focusin',e=>{const el=e.target.closest('.ab-enter');if(el)show(el)});
 motion.addEventListener('change',animate);animate();
});
