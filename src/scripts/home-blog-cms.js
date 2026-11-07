/* Shared blog sections, optionally restricted to the page's industry or service. */
(() => {
  function init(){
    const section=document.querySelector('[data-home-blog]'),H=window.WissenHomeBlog;
    if(!section||!H)return;
    const filters={industry:section.dataset?.blogIndustry||'',service:section.dataset?.blogService||''};
    const grid=section.querySelector('[data-home-blog-grid]'),status=section.querySelector('[data-home-blog-status]'),retry=section.querySelector('[data-home-blog-retry]');
    const B=window.WissenBlog;
    let busy=false,refreshedAt=0,signature='';
    async function load(){
      if(busy)return;
      busy=true;retry.hidden=true;grid.setAttribute('aria-busy','true');
      const hasCards=()=>Boolean(grid.querySelector('[data-home-blog-card]'));
      status.textContent=hasCards()?'':'Loading articles...';
      try {
        const result=H.fromPosts(await B.fetchIndex(),filters);
        const next=JSON.stringify(result);
        if(next!==signature){
          grid.innerHTML=H.render(result,{...filters,static:true});
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
    if(grid.getAttribute('aria-busy')!=='false')load();
    else refreshedAt=Date.now();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
