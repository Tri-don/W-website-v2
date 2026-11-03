document.addEventListener('DOMContentLoaded',()=>{
 const tabs=[...document.querySelectorAll('.ao-tabs [role=tab]')];
 function select(tab,focus=false){tabs.forEach(t=>{const selected=t===tab;t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!selected});if(focus)tab.focus()}
 tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>select(tab));tab.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(i+1)%tabs.length;else if(e.key==='ArrowLeft')next=(i-1+tabs.length)%tabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;else return;e.preventDefault();select(tabs[next],true)})});
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const targets=[...document.querySelectorAll('.ao-hero-copy>*,.ao-orbit,.ao-intro>*,.ao-heading>*,.ao-tabs,.ao-panel-top>*,.ao-workflow,.ao-metrics>div,.wf-info,.wf-column,.wf-middle,.wf-bottom')];
 let observer;
 function reveal(){observer?.disconnect();if(motion.matches||!('IntersectionObserver' in window)){targets.forEach(el=>el.classList.add('ao-visible'));return}observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('ao-visible');observer.unobserve(entry.target)}}),{threshold:.08,rootMargin:'0px 0px -20px 0px'});targets.forEach((el,i)=>{el.style.setProperty('--ao-delay',(i%3*70)+'ms');el.classList.add('ao-enter');if(!el.classList.contains('ao-visible'))observer.observe(el)})}
 document.addEventListener('focusin',e=>e.target.closest('.ao-enter')?.classList.add('ao-visible'));motion.addEventListener('change',reveal);reveal();
});
