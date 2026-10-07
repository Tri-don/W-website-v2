/* Scoped word reveal: preserve the quote's text and emphasis; update at most once per animation frame. */
(()=>{
 const quotes=[...document.querySelectorAll('.wp-quote')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 quotes.forEach(quote=>{
  if(quote.hasAttribute('data-wp-reveal'))return;
  const walker=document.createTreeWalker(quote,NodeFilter.SHOW_TEXT);const nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(node=>{const fragment=document.createDocumentFragment();node.textContent.split(/(\s+)/).forEach(part=>{if(!part)return;if(/^\s+$/.test(part))fragment.append(document.createTextNode(part));else{const word=document.createElement('span');word.className='wp-word';word.textContent=part;fragment.append(word);}});node.replaceWith(fragment);});
  quote.setAttribute('data-wp-reveal','');
 });
 const items=quotes.map(quote=>({quote,words:[...quote.querySelectorAll('.wp-word')]}));let frame=0;
 const clamp=value=>Math.max(0,Math.min(1,value));
 const update=()=>{frame=0;const height=innerHeight;const maxScroll=Math.max(0,document.documentElement.scrollHeight-height);items.forEach(({quote,words})=>{const top=quote.getBoundingClientRect().top+scrollY;const start=Math.max(0,top-height*.9);const end=Math.max(start+1,Math.min(top-height*.45,maxScroll));const progress=reduced.matches||maxScroll===0?1:clamp((scrollY-start)/(end-start));words.forEach((word,index)=>{const brightness=clamp(progress*(words.length+3)-index);word.style.setProperty('--wp-word-opacity',String(.2+.8*brightness));});});};
 const request=()=>{if(!frame)frame=requestAnimationFrame(update);};
 addEventListener('scroll',request,{passive:true});addEventListener('resize',request);reduced.addEventListener('change',request);document.fonts.ready.then(request);update();
})();
