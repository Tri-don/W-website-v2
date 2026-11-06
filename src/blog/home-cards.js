/* Shared blog section: the same selection and cards in the browser and static build. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./content.js'));
  else root.WissenHomeBlog=factory(root.WissenBlog);
})(typeof globalThis!=='undefined'?globalThis:this,function(B){
  'use strict';
  const usable=p=>p&&p.title&&B.validSlug(B.slug(p));
  const arrow='<span class="wb-arrow" aria-hidden="true"><svg class="ui-arrow-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M7 7h10v10"/></svg></span>';
  const polygons='0.1666667,0.0176737 0.3693135,0.4680000 -0.0359802,0.4680000|0.6166667,0.0176737 0.8193135,0.4680000 0.4140198,0.4680000|0.6390198,0.0000000 1.0443135,0.0000000 0.8416667,0.4503263|-0.0359802,0.5000000 0.3693135,0.5000000 0.1666667,0.9503263|0.4140198,0.5000000 0.8193135,0.5000000 0.6166667,0.9503263|0.3916667,0.5176737 0.5943135,0.9680000 0.1890198,0.9680000|-0.2609802,0.0000000 0.1443135,0.0000000 -0.0583333,0.4503263';
  function matches(post,filters={}){
    return (!filters.industry||(Array.isArray(post.industries)&&post.industries.includes(filters.industry)))&&
      (!filters.service||(Array.isArray(post.services)&&post.services.includes(filters.service)));
  }
  function emptyMessage(filters={}){
    return filters.industry||filters.service?'Articles for this area are on their way. Explore all blogs in Insights.':'New perspectives are on their way. Check back soon.';
  }
  function select(data,filters={}){
    const seen=new Set(),latest=(data.latest||[]).filter(p=>{
      if(!usable(p)||!matches(p,filters)||seen.has(B.slug(p)))return false;
      seen.add(B.slug(p));return true;
    });
    const featured=usable(data.featured)&&matches(data.featured,filters)?data.featured:latest[0];
    if(!featured)return [];
    const sides=latest.filter(p=>B.slug(p)!==B.slug(featured)).slice(0,2);
    return [...sides.slice(0,1).map(post=>({post,featured:false})),{post:featured,featured:true},...sides.slice(1).map(post=>({post,featured:false}))];
  }
  function fromPosts(posts,filters={}){
    const latest=posts.filter(p=>usable(p)&&matches(p,filters)).slice().sort((a,b)=>(b.publishedAt||'').localeCompare(a.publishedAt||'')||String(a._id).localeCompare(String(b._id)));
    return {featured:latest.find(p=>p.featured)||null,latest:latest.slice(0,3)};
  }
  function photo(post){
    const url=B.imageUrl(post.mainImage,1000);
    return url?`<img loading="lazy" decoding="async" src="${B.esc(url)}" alt="${B.esc(post.mainImage?.alt||'')}">`:'<span class="wb-home-art" aria-hidden="true"></span>';
  }
  function published(post){
    const date=new Date(post.publishedAt);
    return Number.isNaN(date.getTime())?'':`<time class="wb-home-date" datetime="${B.esc(post.publishedAt)}">${B.esc(date.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}))}</time>`;
  }
  function render(data,options={}){
    return select(data,options).map(({post,featured})=>{
      const slug=B.slug(post),href=B.articleHref(post,options);
      const category=`<span class="wb-category">${B.esc(post.categories?.[0]?.title||'Blog')}</span>`;
      const title=`<h3 id="home-blog-${slug}" data-wissen-type="card-title">${B.esc(post.title)}</h3>`;
      return `<a class="wb-card ${featured?'wb-feature':'wb-standard'}" data-home-blog-card data-blog-slug="${B.esc(slug)}" href="${B.esc(href)}" aria-labelledby="home-blog-${slug}">${featured?`<div class="wb-feature-photo"><svg class="wb-mask-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs><clipPath id="wb-home-cms-mask" clipPathUnits="objectBoundingBox">${polygons.split('|').map(points=>`<polygon points="${points}"/>`).join('')}</clipPath></defs></svg><div class="wb-mask-photo">${photo(post)}</div></div><div class="wb-feature-copy">${category}${title}${published(post)}${arrow}</div>`:`<div class="wb-card-top">${category}${arrow}</div>${title}${published(post)}<div class="wb-photo-frame">${photo(post)}</div>`}</a>`;
    }).join('\n');
  }
  function query(config,filters={}){
    const projection='{_id,title,slug,featured,industries,services,"publishedAt":coalesce(publishedAt,_createdAt),mainImage{alt,crop,hotspot,asset->{url}},categories[]->{title}}';
    const filter=`${B.filter} && defined(title) && count(body) > 0${filters.industry?' && $industry in industries':''}${filters.service?' && $service in services':''}`;
    const order=' | order(coalesce(publishedAt,_createdAt) desc, _id asc)';
    return {url:B.endpoint(config,true),params:{
      query:`{"featured":*[${filter} && featured == true]${order}[0]${projection},"latest":*[${filter}]${order}[0...3]${projection}}`,
      perspective:'published','$type':JSON.stringify(config.documentType),
      ...(filters.industry?{'$industry':JSON.stringify(filters.industry)}:{}),
      ...(filters.service?{'$service':JSON.stringify(filters.service)}:{})
    }};
  }
  return {select,fromPosts,matches,emptyMessage,render:(...args)=>B.localHtml(render(...args)),query};
});
