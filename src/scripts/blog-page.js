/* Public, read-only Sanity queries. Tokens are deliberately never sent by this page. */
(async () => {
  const root=document.querySelector('[data-blog-root]'); if(!root)return;
  const B=window.WissenBlog;
  const variant=document.documentElement.dataset.blogVariant||'v1';
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
  async function fetchPosts(config, options) {
    const q=B.query(config,options,false), url=new URL(q.url);
    Object.entries(q.params).forEach(([k,v])=>url.searchParams.set(k,v));
    const res=await fetch(url,{signal:AbortSignal.timeout(15000),credentials:'omit'});
    if(!res.ok)throw new Error('Sanity returned '+res.status);
    const payload=await res.json();
    if(!Array.isArray(payload.result))throw new Error('Invalid Sanity response');
    return payload.result;
  }
  async function load() {
    root.setAttribute('aria-busy','true');
    try {
      const cfgResponse=await fetch('src/blog/config.json'); if(!cfgResponse.ok)throw new Error('Blog configuration unavailable');
      const config=await cfgResponse.json();
      const posts=await fetchPosts(config,slug?{slug}:{});
      if(!posts.length) { root.innerHTML=B.state(slug?'Article not found.':'Our next perspective is on its way.',slug?'This article may have moved or is no longer published.':'New articles will appear here once published. Explore our insights in the meantime.'); return; }
      const post=posts[0]; root.innerHTML=B.render(post,posts.slice(1),{url:location.href,variant});
      document.title=(post.seo?.title||post.title)+' | Wissen Technology';
      document.querySelector('meta[name="description"]')?.setAttribute('content',post.seo?.description||post.excerpt||'');
      const robots=document.querySelector('meta[name="robots"]'); if(robots)robots.content='noindex,follow';
      enhance();
      if(slug){
        // A related-content failure should never hide a successfully loaded article.
        fetchPosts(config,{excludeSlug:slug}).then(related=>{
          const template=document.createElement('template');
          template.innerHTML=B.render(post,related,{url:location.href,variant});
          const section=template.content.querySelector('.wb-related');
          if(section){
            const current=root.querySelector('.wb-related');
            if(current)current.replaceWith(section);else root.append(section);
          }
        }).catch(error=>console.warn('Related articles unavailable:',error));
      }
    } catch(error) {
      console.error('Blog loading failed:',error);
      root.innerHTML=B.state("This article couldn't load.",'Please try again in a moment.',true);
      root.querySelector('[data-blog-retry]').addEventListener('click',load,{once:true});
    } finally { root.setAttribute('aria-busy','false'); }
  }
  await load();
})();
