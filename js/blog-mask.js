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