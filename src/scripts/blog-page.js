/* Article interactions and compatibility for old query-string links. */
(async () => {
  const root=document.querySelector('[data-blog-root]'); if(!root)return;
  const B=window.WissenBlog;
  function enhance() {
    const hero=root.querySelector('[data-wissen-hero]');
    if(hero){
      const measure=()=>document.body.style.setProperty('--wissen-hero-height',Math.max(0,hero.getBoundingClientRect().bottom-document.body.getBoundingClientRect().top)+'px');
      measure();
      if('ResizeObserver' in window)new ResizeObserver(measure).observe(hero);
    }
    const canonical=document.querySelector('link[rel="canonical"]');
    const shareLocation=new URL(canonical?.href||location.href);shareLocation.hash='';
    const shareUrl=shareLocation.href, title=root.querySelector('#blog-title')?.textContent||document.title;
    const linksForSharing=B.shareLinks(title,shareUrl);
    const localLink=!/^https?:$/.test(shareLocation.protocol)||(!canonical&&['localhost','127.0.0.1','[::1]'].includes(shareLocation.hostname));
    const statusFor=control=>control.closest('[data-blog-share-toolbar]')?.querySelector('[data-copy-status]')||root.querySelector('[data-copy-status]');
    const previewFor=control=>localLink||Boolean(control.closest('[data-share-preview="true"]'));
    const share=root.querySelector('[data-blog-share]');
    if(share)share.href=linksForSharing.linkedin;
    root.querySelectorAll('[data-blog-platform]').forEach(link=>{
      link.href=linksForSharing[link.dataset.blogPlatform];
      link.addEventListener('click',event=>{
        if(previewFor(link)){
          event.preventDefault();
          statusFor(link).textContent='Sharing is available for the published article. This is a local preview.';
        }
      });
    });
    root.querySelectorAll('[data-blog-copy]').forEach(button=>button.addEventListener('click',async()=>{
      const status=statusFor(button);
      try {
        await navigator.clipboard.writeText(shareUrl);
        if(status)status.textContent=previewFor(button)?'Preview link copied. It is not a public article URL.':'Article link copied';
      } catch {
        const input=button.closest('[data-blog-share-toolbar]')?.querySelector('[data-blog-copy-fallback]');
        if(input){input.value=shareUrl;input.hidden=false;input.focus();input.select();}
        if(status)status.textContent=input?'Select and copy the link below.':'Copy the article URL from your address bar.';
      }
    }));
    root.querySelectorAll('[data-blog-native-share]').forEach(button=>{
      button.hidden=typeof navigator.share!=='function'||previewFor(button);
      button.addEventListener('click',async()=>{
        if(previewFor(button)){statusFor(button).textContent='Sharing is available for the published article.';return;}
        try { await navigator.share({title,url:shareUrl}); }
        catch(error){if(error.name!=='AbortError')statusFor(button).textContent='Use one of the sharing links or copy the article URL.';}
      });
    });
    root.querySelectorAll('[data-blog-print]').forEach(button=>button.addEventListener('click',()=>window.print()));
    const links=[...root.querySelectorAll('[data-blog-toc]')];
    const sections=links.map(a=>document.getElementById(a.hash.slice(1))).filter(Boolean);
    if(sections.length && 'IntersectionObserver' in window) {
      const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)links.forEach(a=>a.toggleAttribute('aria-current',a.hash==='#'+e.target.id));}),{rootMargin:'-15% 0px -65% 0px'});
      sections.forEach(s=>observer.observe(s));
    }
    const progress=document.querySelector('[data-blog-progress]');
    const update=()=>{
      document.querySelector('.nv-header')?.classList.toggle('nv-scrolled',scrollY>50);
      const article=root.querySelector('.wb-prose'); if(!article||!progress)return;
      const top=article.getBoundingClientRect().top+scrollY-130;
      progress.style.transform='scaleX('+Math.min(1,Math.max(0,(scrollY-top)/Math.max(1,article.offsetHeight-innerHeight*.4)))+')';
    };
    addEventListener('scroll',update,{passive:true}); addEventListener('resize',update); update();
  }
  if(root.dataset.blogStatic==='true'){enhance();return;}
  const params=new URLSearchParams(location.search), slug=params.get('slug');
  if(slug && !B.validSlug(slug)){root.innerHTML=B.state('Article not found.','Explore our insights for more perspectives.');root.setAttribute('aria-busy','false');return;}
  async function load() {
    root.setAttribute('aria-busy','true');
    try {
      const response=await fetch(B.sitePath('src/blog/config.json'),{
        method:'GET',credentials:'same-origin',redirect:'error',signal:AbortSignal.timeout(15000)
      });
      if(!response.ok)throw new Error('Blog configuration unavailable');
      const {articleSlugs}=await response.json();
      if(!Array.isArray(articleSlugs))throw new Error('Invalid blog configuration');
      if(!slug){location.replace(B.sitePath('blogs/'));return;}
      if(articleSlugs.includes(slug)){location.replace(B.sitePath('blogs/'+slug+'/')+location.hash);return;}
      root.innerHTML=B.state('Article not found.','This article may have moved or is no longer published.');
    } catch(error) {
      console.error('Blog loading failed:',error);
      root.innerHTML=B.state("This article couldn't load.",'Please try again in a moment.',true);
      root.querySelector('[data-blog-retry]').addEventListener('click',load,{once:true});
    } finally { root.setAttribute('aria-busy','false'); }
  }
  await load();
})();
