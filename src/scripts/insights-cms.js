/* Public published content only; no browser tokens or credentials. */
(() => {
  function init() {
    const panel=document.getElementById('panel-blogs'), B=window.WissenBlog;
    const grid=panel?.querySelector('[data-insights-blog-grid]');
    if(!grid||!B)return;
    const status=panel.querySelector('[data-insights-blog-status]');
    const more=panel.querySelector('[data-insights-blog-more]');
    const retry=panel.querySelector('[data-insights-blog-retry]');
    let config, page=0, busy=false, refreshedAt=0, failedPage=0;
    async function load(nextPage=0) {
      if(busy)return;
      busy=true;failedPage=nextPage;
      grid.setAttribute('aria-busy','true');more.disabled=true;retry.hidden=true;
      status.textContent=grid.querySelector('[data-insights-blog-card]')?'Updating articles…':'Loading articles…';
      try {
        if(!config){
          const response=await fetch('src/blog/config.json',{credentials:'omit',signal:AbortSignal.timeout(15000)});
          if(!response.ok)throw new Error('Configuration unavailable');
          config=await response.json();
        }
        const q=B.insightsQuery(config,nextPage), url=new URL(q.url);
        Object.entries(q.params).forEach(([key,value])=>url.searchParams.set(key,value));
        const response=await fetch(url,{credentials:'omit',cache:'no-store',signal:AbortSignal.timeout(15000)});
        if(!response.ok)throw new Error('Articles unavailable');
        const payload=await response.json();
        if(!Array.isArray(payload.result))throw new Error('Invalid articles');
        let posts=payload.result.slice(0,12);
        if(nextPage){
          const existing=new Set([...grid.querySelectorAll('[data-blog-slug]')].map(card=>card.dataset.blogSlug));
          posts=posts.filter(post=>!existing.has(B.slug(post)));
        }
        const html=B.insightCards(posts);
        if(nextPage)grid.insertAdjacentHTML('beforeend',html);
        else {
          grid.innerHTML=html;
          const featured=document.querySelector('[data-insights-featured]');
          if(featured){
            featured.innerHTML=B.featuredInsights(posts);
            document.dispatchEvent(new CustomEvent('insights:featured-updated'));
          }
        }
        page=nextPage;refreshedAt=Date.now();
        more.hidden=payload.result.length<=12;
        status.textContent=grid.querySelector('[data-insights-blog-card]')?'':'New perspectives are on their way. Check back soon.';
        document.dispatchEvent(new CustomEvent('insights:blogs-updated'));
      } catch {
        status.textContent=grid.querySelector('[data-insights-blog-card]')?'Showing available articles. Updates could not be loaded.':'We couldn’t load articles. Please try again.';
        retry.hidden=false;
      } finally {
        busy=false;more.disabled=false;grid.setAttribute('aria-busy','false');
      }
    }
    const refresh=()=>{if(!panel.hidden&&!document.hidden&&Date.now()-refreshedAt>60000)load();};
    more.addEventListener('click',()=>load(page+1));
    retry.addEventListener('click',()=>load(failedPage));
    document.addEventListener('insights:tabchange',refresh);
    document.addEventListener('visibilitychange',refresh);
    window.addEventListener('focus',refresh);
    load();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
