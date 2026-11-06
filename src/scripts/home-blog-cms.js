/* Shared blog sections, optionally restricted to the page's industry or service. */
(() => {
  function init(){
    const section=document.querySelector('[data-home-blog]'),H=window.WissenHomeBlog;
    if(!section||!H)return;
    const filters={industry:section.dataset?.blogIndustry||'',service:section.dataset?.blogService||''};
    const grid=section.querySelector('[data-home-blog-grid]'),status=section.querySelector('[data-home-blog-status]'),retry=section.querySelector('[data-home-blog-retry]');
    let config,busy=false,refreshedAt=0,signature='';
    async function load(){
      if(busy)return;
      busy=true;retry.hidden=true;grid.setAttribute('aria-busy','true');
      const hasCards=()=>Boolean(grid.querySelector('[data-home-blog-card]'));
      status.textContent=hasCards()?'':'Loading articles...';
      try {
        if(!config){
          const res=await fetch(window.WissenBlog.sitePath('src/blog/config.json'),{credentials:'same-origin',signal:AbortSignal.timeout(15000)});
          if(!res.ok)throw new Error('Blog settings unavailable');
          config=await res.json();
        }
        const q=H.query(config,filters),url=new URL(q.url);
        Object.entries(q.params).forEach(([key,value])=>url.searchParams.set(key,value));
        const res=await fetch(url,{method:'GET',credentials:'omit',redirect:'error',signal:AbortSignal.timeout(15000)});
        if(!res.ok)throw new Error('Blog articles unavailable');
        const {result}=await res.json();
        if(!result||!Array.isArray(result.latest))throw new Error('Invalid blog response');
        const next=JSON.stringify(result);
        if(next!==signature){
          grid.innerHTML=H.render(result,{...filters,articleSlugs:config.articleSlugs});
          grid.dataset.cardCount=String(H.select(result,filters).length);
          signature=next;
        }
        status.textContent=hasCards()?'':H.emptyMessage(filters);
        refreshedAt=Date.now();
      } catch {
        status.textContent=hasCards()?'Showing available articles. Updates could not be loaded.':'Articles could not be loaded. Please try again.';
        retry.hidden=false;
      } finally {
        busy=false;grid.setAttribute('aria-busy','false');
      }
    }
    const refresh=()=>{if(!document.hidden&&Date.now()-refreshedAt>60000)load();};
    retry.addEventListener('click',load);
    document.addEventListener('visibilitychange',refresh);
    window.addEventListener('focus',refresh);
    load();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
