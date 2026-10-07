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
  return {base,next,words:[...panel.querySelectorAll('.wd-word')],ticks:[...ticks.querySelectorAll('b')]};
 });
 let active=-1,pending=false,enhanced=false;
 function show(index){
  if(index===active)return;active=index;
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
  show(index);const visual=visuals[index],on=Math.ceil(Math.min(1,local*2.2)*visual.words.length);
  visual.words.forEach((word,i)=>word.classList.toggle('wd-on',i<on||(index===3&&progress>=.999)));
  const k=index<3?clamp((local-.55)/.45):0;
  visual.next.style.setProperty('--wd-radius',(k*150).toFixed(2)+'%');visual.next.style.setProperty('--wd-zoom',(1.25-k*.25).toFixed(4));
  number.style.transform='translateY('+((.5-local)*60).toFixed(1)+'px) scale('+(1+local*.06).toFixed(4)+')';
  visual.ticks.forEach((tick,i)=>tick.style.transform='scaleX('+clamp(f-i).toFixed(4)+')');
  buttons.forEach((button,i)=>button.style.setProperty('--wd-progress',clamp(f-i).toFixed(4)));
 }
 function scroll(){if(!pending){pending=true;requestAnimationFrame(frame);}}
 function configure(){enhanced=desktop.matches&&!reduced.matches;section.classList.toggle('wd-enhanced',enhanced);active=-1;show(0);if(enhanced)frame();}
 buttons.forEach((button,i)=>button.addEventListener('click',()=>{if(!enhanced)return;const top=track.getBoundingClientRect().top+window.scrollY,distance=track.offsetHeight-stage.offsetHeight;window.scrollTo({top:top+distance*((i+.28)/4),behavior:'smooth'});}));
 window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',configure);desktop.addEventListener('change',configure);reduced.addEventListener('change',configure);configure();
})();
