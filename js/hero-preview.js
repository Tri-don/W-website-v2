(()=>{
 const hero=document.querySelector('.hero-concept .hero'),canvas=hero.querySelector('.hero-field'),ctx=canvas.getContext('2d'),art=hero.querySelector('.hero-art'),video=hero.querySelector('video'),glow=hero.querySelector('.hero-pointer-glow');
 if(!ctx)return;
 const reduce=matchMedia('(prefers-reduced-motion:reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
 let width=0,height=0,points=[],raf=0,visible=true,last=0,time=0;
 const mouse={x:0,y:0,tx:0,ty:0,on:false},brain={x:0,y:0};
 const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
 const size=()=>{const r=hero.getBoundingClientRect();width=r.width;height=r.height;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);points=Array.from({length:Math.min(155,Math.round(width*height/8500))},()=>{const x=Math.random()*width,y=Math.random()*height;return {x,y,ox:x,oy:y,vx:0,vy:0,phase:Math.random()*Math.PI*2,r:.6+Math.random()};});if(reduce.matches)draw(0);};
 const draw=dt=>{
  time+=dt/1000;ctx.clearRect(0,0,width,height);
  const smooth=1-Math.pow(.88,dt/16.67||1);
  mouse.x+=(mouse.tx-mouse.x)*smooth;mouse.y+=(mouse.ty-mouse.y)*smooth;
  const ax=mouse.on?mouse.x:width*(.72+.1*Math.sin(time*.3)),ay=mouse.on?mouse.y:height*(.48+.13*Math.cos(time*.4)),radius=mouse.on?250:200;
  if(!reduce.matches)for(const p of points){const dx=ax-p.x,dy=ay-p.y,d=Math.hypot(dx,dy)||1;if(d<radius){const f=(1-d/radius)*.7;p.vx+=dx/d*f;p.vy+=dy/d*f;if(d<38){p.vx-=dx/d*1.1;p.vy-=dy/d*1.1;}}p.vx+=(p.ox+Math.sin(time+p.phase)*10-p.x)*.006;p.vy+=(p.oy+Math.cos(time*.8+p.phase)*10-p.y)*.006;p.vx*=.9;p.vy*=.9;const step=Math.min(dt/16.67,2);p.x+=p.vx*step;p.y+=p.vy*step;}
  ctx.lineWidth=.8;
  for(let i=0;i<points.length;i++){const p=points[i],d=Math.hypot(ax-p.x,ay-p.y),strength=Math.max(0,1-d/(radius*1.15));
   for(let j=i+1;j<points.length;j++){const q=points[j],gap=Math.hypot(p.x-q.x,p.y-q.y);if(gap<100){const alpha=(1-gap/100)*(.025+strength*.42);ctx.strokeStyle='rgba(182,160,237,'+alpha+')';ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();}}
   if(mouse.on&&d<radius*.6){ctx.strokeStyle='rgba(182,160,237,'+(strength*.13)+')';ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(ax,ay);ctx.stroke();}
   ctx.fillStyle='rgba(200,183,240,'+(.13+strength*.65)+')';ctx.beginPath();ctx.arc(p.x,p.y,p.r*(1+strength*.6),0,Math.PI*2);ctx.fill();
  }
  const nx=mouse.on&&!reduce.matches?clamp((mouse.tx/width-.5)*2,-1,1):0,ny=mouse.on&&!reduce.matches?clamp((mouse.ty/height-.5)*2,-1,1):0;
  brain.x+=(nx-brain.x)*smooth*.65;brain.y+=(ny-brain.y)*smooth*.65;
  art.style.setProperty('--brain-x',(brain.x*23).toFixed(2)+'px');art.style.setProperty('--brain-y',(brain.y*17).toFixed(2)+'px');art.style.setProperty('--brain-rx',(-brain.y*5).toFixed(2)+'deg');art.style.setProperty('--brain-ry',(brain.x*7).toFixed(2)+'deg');art.style.setProperty('--brain-light',(1+Math.abs(brain.x)*.08).toFixed(3));
  glow.style.transform='translate('+mouse.x+'px,'+mouse.y+'px)';
 };
 const frame=now=>{raf=0;if(reduce.matches){video.autoplay=false;video.pause();draw(0);return;}if(!visible||document.hidden)return;draw(last?Math.min(now-last,32):16.67);last=now;raf=requestAnimationFrame(frame);};
 const start=()=>{if(!raf&&visible&&!document.hidden&&!reduce.matches){last=0;raf=requestAnimationFrame(frame);}};
 const stop=()=>{cancelAnimationFrame(raf);raf=0;last=0;};
 hero.addEventListener('pointermove',e=>{if(!fine.matches||reduce.matches||e.pointerType==='touch')return;const r=hero.getBoundingClientRect();mouse.tx=e.clientX-r.left;mouse.ty=e.clientY-r.top;if(!mouse.on){mouse.x=mouse.tx;mouse.y=mouse.ty;}mouse.on=true;hero.classList.add('is-pointer-active');});
 hero.addEventListener('pointerleave',()=>{mouse.on=false;hero.classList.remove('is-pointer-active');});
 new ResizeObserver(size).observe(hero);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){start();if(!reduce.matches)video.play().catch(()=>{});}else{stop();video.pause();}}).observe(hero);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();video.pause();}else{start();if(visible&&!reduce.matches)video.play().catch(()=>{});}});
 reduce.addEventListener('change',()=>{video.autoplay=!reduce.matches;mouse.on=false;if(reduce.matches){stop();video.pause();draw(0);}else{start();if(visible)video.play().catch(()=>{});}});
 size();if(reduce.matches){video.autoplay=false;video.pause();}else start();
})();