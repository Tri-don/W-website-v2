(() => {
 const marquee=document.querySelector('.m3-marquee');
 const button=document.querySelector('.m3-marquee-pause');
 button?.addEventListener('click',()=>{const pause=button.getAttribute('aria-pressed')!=='true';button.setAttribute('aria-pressed',String(pause));button.textContent=pause?'Resume logos':'Pause logos';marquee.dataset.paused=String(pause);});
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const targets=[...document.querySelectorAll('.wi-heading,.wi-accordion,.wb-heading,.wb-grid')];
 document.querySelectorAll('.reveal').forEach(el=>{const siblings=[...el.parentElement.children].filter(e=>e.classList.contains('reveal'));el.style.setProperty('--m3-delay',Math.min(siblings.indexOf(el)*55,165)+'ms');});
 if(reduced.matches || !('IntersectionObserver' in window))return;
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('m3-visible');observer.unobserve(entry.target);}}),{threshold:.07,rootMargin:'0px 0px -20px 0px'});
 targets.forEach(el=>{el.classList.add('m3-reveal');observer.observe(el);});
 reduced.addEventListener('change',e=>{if(e.matches){observer.disconnect();targets.forEach(el=>el.classList.add('m3-visible'));}});
})();
