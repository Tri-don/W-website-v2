/* Shared renderer for the browser and static export. CMS strings are always escaped. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.WissenBlog = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function safeUrl(v) {
    if (typeof v !== 'string' || /[\u0000-\u0020\\]/.test(v)) return '';
    if (/^(https?:\/\/|mailto:)/i.test(v) || /^(#|\/(?!\/)|assets\/)/.test(v)) return v;
    return '';
  }
  function imageUrl(image, width = 1600) {
    const raw = image?.asset?.url || image?.url || '';
    if (!safeUrl(raw) || /^mailto:|^#/i.test(raw)) return '';
    if (!raw.startsWith('https://cdn.sanity.io/images/')) return raw;
    const url = new URL(raw);
    url.searchParams.set('w', String(width)); url.searchParams.set('auto', 'format');
    url.searchParams.set('fit', 'max');
    const c = image.crop;
    const dims = /-(\d+)x(\d+)\.[a-z]+$/i.exec(url.pathname);
    if (c && dims) {
      const w = Number(dims[1]), h = Number(dims[2]);
      url.searchParams.set('rect', [Math.round(w*(c.left||0)), Math.round(h*(c.top||0)), Math.max(1,Math.round(w*(1-(c.left||0)-(c.right||0)))), Math.max(1,Math.round(h*(1-(c.top||0)-(c.bottom||0))))].join(','));
    }
    return url.href;
  }
  const plain = blocks => (blocks || []).filter(b=>b._type==='block').map(b=>(b.children||[]).map(s=>s.text||'').join('')).join(' ');
  const slug = p => p?.slug?.current || '';
  const validSlug = s => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);
  function date(v) {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric', timeZone:'UTC'});
  }
  function captionHtml(value) {
    return [value?.caption,value?.credit&&'Image: '+value.credit].filter(Boolean).map(esc).join(' &middot; ');
  }
  function selectRelated(post, fallback=[], preview=false) {
    const seen=new Set([slug(post)]), ids=new Set([post._id]), selected=[];
    for(const p of [...(post.relatedArticles||[]),...fallback]){
      if(!p||!p.title||!validSlug(slug(p))||seen.has(slug(p))||ids.has(p._id))continue;
      if(!preview&&(!p._id||/^(drafts|versions)\./.test(p._id)||!p.publishedAt||!(new Date(p.publishedAt).getTime()<=Date.now())))continue;
      seen.add(slug(p));ids.add(p._id);selected.push(p);
      if(selected.length===3)break;
    }
    return selected;
  }
  function bodyHtml(blocks) {
    const headings = [], used = new Set();
    function spans(block) {
      return (block.children || []).map(s => {
        if (s._type !== 'span') throw new Error('Unsupported inline content: '+s._type);
        let out = esc(s.text).replace(/\n/g, '<br>');
        for (const m of s.marks || []) {
          const tags = {strong:'strong',em:'em',code:'code',underline:'u','strike-through':'s'};
          if (tags[m]) out = `<${tags[m]}>${out}</${tags[m]}>`;
          else {
            const def = (block.markDefs||[]).find(d=>d._key===m);
            const href = def?._type==='link' && safeUrl(def.href);
            if (href) out = `<a href="${esc(href)}"${def.openInNewTab?' target="_blank" rel="noopener noreferrer"':''}>${out}</a>`;
          }
        }
        return out;
      }).join('');
    }
    function renderBlock(b) {
      if (b._type === 'image') {
        const src = imageUrl(b);
        return src ? `<figure><img src="${esc(src)}" alt="${esc(b.alt)}" loading="lazy" decoding="async">${captionHtml(b)?`<figcaption>${captionHtml(b)}</figcaption>`:''}</figure>` : '';
      }
      if (b._type === 'codeBlock') return `<pre><code>${esc(b.code)}</code></pre>`;
      if (b._type !== 'block') throw new Error('Unsupported article block: '+b._type);
      const style = b.style || 'normal', allowed = {normal:'p',h2:'h2',h3:'h3',h4:'h4',blockquote:'blockquote'};
      const tag = allowed[style] || 'p';
      let id = '';
      if (/^h[234]$/.test(tag)) {
        let base = (b.children||[]).map(s=>s.text||'').join('').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'section';
        let key = base, n=2; while (used.has(key)) key=base+'-'+n++;
        used.add(key); id=` id="${key}"`;
        headings.push({id:key,text:(b.children||[]).map(s=>s.text||'').join(''),level:tag});
      }
      return `<${tag}${id}>${spans(b)}</${tag}>`;
    }
    // Stack lists by level; every nested list stays inside its parent list item.
    const stack = []; let out='';
    function close() { const l=stack.pop(); out+=`</li></${l.tag}>`; }
    for (const b of blocks || []) {
      if (b.listItem && b._type==='block') {
        const level = Math.max(1,Math.min(10,Number(b.level)||1)), tag=b.listItem==='number'?'ol':'ul';
        while (stack.length && stack[stack.length-1].level>level) close();
        if (stack.length && stack[stack.length-1].level===level && stack[stack.length-1].tag!==tag) close();
        if (!stack.length || stack[stack.length-1].level<level) { out+=`<${tag}><li>`; stack.push({level,tag}); }
        else out+='</li><li>';
        out+=spans(b);
      } else { while(stack.length) close(); out+=renderBlock(b); }
    }
    while(stack.length) close();
    return {html:out,headings};
  }
  function image(image, cls, eager=false) {
    const src=imageUrl(image); if (!src) return '';
    return `<figure class="${cls}"><img src="${esc(src)}" alt="${esc(image.alt)}" ${eager?'fetchpriority="high"':'loading="lazy"'} decoding="async">${captionHtml(image)?`<figcaption>${captionHtml(image)}</figcaption>`:''}</figure>`;
  }
  function shareLinks(title, url) {
    const u=encodeURIComponent(url), t=encodeURIComponent(title);
    return {
      linkedin:`https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
      x:`https://x.com/intent/tweet?text=${t}&url=${u}`,
      whatsapp:`https://wa.me/?text=${encodeURIComponent(title+'\n'+url)}`,
      email:`mailto:?subject=${t}&body=${encodeURIComponent(title+'\n\n'+url)}`
    };
  }
  function shareToolbar(post, options={}) {
    const icons={
      linkedin:'<path d="M6 9v10M6 5v.01M10 19V9h4v1.5c1.8-2.7 6-1.7 6 2V19M14 19v-6"/>',
      x:'<path d="m5 4 14 16M19 4 5 20M5 4h4l10 16h-4Z"/>',
      whatsapp:'<path d="M20 11.5a8 8 0 0 1-12 7L3 20l1.5-5A8 8 0 1 1 20 11.5Z"/><path d="m8 7 2 2-1 2c1 2 2 3 4 4l2-1 2 2c-1 3-5 2-8-1S5 8 8 7Z"/>',
      email:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
      copy:'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M15 8V3H3v13h5"/>',
      share:'<path d="M12 16V3m-4 4 4-4 4 4M5 12v8h14v-8"/>',
      print:'<path d="M7 8V3h10v5M7 17H3V8h18v9h-4M7 14h10v7H7Z"/><path d="M17 11h.01"/>'
    };
    const icon=name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
    const links=shareLinks(post.title,options.url||'');
    const labels={linkedin:'LinkedIn',x:'X',whatsapp:'WhatsApp',email:'Email'};
    return `<div class="wb-sharing" data-blog-share-toolbar${options.preview?' data-share-preview="true"':''}>
      <span class="wb-sharing-label">Share this article</span><div class="wb-sharing-actions" role="group" aria-label="Share this article">
      ${Object.entries(labels).map(([key,label])=>`<a href="${options.url?esc(links[key]):'#'}" data-blog-platform="${key}"${key!=='email'?' target="_blank" rel="noopener noreferrer"':''} title="Share via ${label}" aria-label="Share article via ${label}">${icon(key)}<span>${label}</span></a>`).join('')}
      <button type="button" data-blog-copy title="Copy article link" aria-label="Copy article link">${icon('copy')}<span>Copy link</span></button>
      <button type="button" data-blog-native-share hidden title="More sharing options" aria-label="More sharing options">${icon('share')}<span>Share</span></button>
      <button type="button" data-blog-print title="Print article" aria-label="Print article">${icon('print')}<span>Print</span></button>
      </div><span class="wb-sharing-status" data-copy-status role="status" aria-live="polite"></span><input class="wb-sharing-fallback" data-blog-copy-fallback hidden readonly aria-label="Article link to copy"></div>`;
  }
  function render(post, related=[], options={}) {
    const body=bodyHtml(post.body), author=post.author, minutes=Math.max(1,Math.ceil(plain(post.body).split(/\s+/).filter(Boolean).length/220));
    const v2=options.variant==='v2', v3=options.variant==='v3', entry='Blog.html';
    const link = p => options.static ? `blogs/${slug(p)}/` : `${entry}?slug=${encodeURIComponent(slug(p))}`;
    const authorImg=imageUrl(author?.image,160), published=date(post.publishedAt);
    const toc=body.headings.filter(h=>h.level!=='h4');
    const relatedCards=selectRelated(post,related,options.preview);
    const cover=imageUrl(post.mainImage);
    const v3Header=v3?`<section class="wb-hero wb-v3-hero" data-wissen-hero="true"><div class="wrap">
      <div class="wb-v3-topline"><nav class="wb-breadcrumb" aria-label="Breadcrumb"><a href="Insights.html">Insights</a><span aria-hidden="true">/</span><a href="${entry}">Blogs</a></nav>${options.preview?'<p class="wb-preview-note">Layout preview &middot; Illustrative content</p>':''}</div>
      <header class="wb-v3-stage${cover?'':' wb-v3-no-cover'}">
        ${cover?`<img class="wb-v3-image" src="${esc(cover)}" alt="${esc(post.mainImage.alt)}" fetchpriority="high" decoding="async">`:''}
        <div class="wb-v3-title-block"><div class="wb-meta">${(post.categories||[]).map(c=>`<span>${esc(c.title)}</span>`).join('')}${published?`<time datetime="${esc(post.publishedAt)}">${published}</time>`:''}<span>${minutes} min read</span></div>
          <h1 id="blog-title" data-wissen-type="hero-title">${esc(post.title)}</h1>
        </div>
      </header>
      ${captionHtml(post.mainImage)?`<p class="wb-v3-caption">${captionHtml(post.mainImage)}</p>`:''}
      <div class="wb-v3-summary">${post.excerpt?`<p class="wb-deck" data-wissen-type="hero-body">${esc(post.excerpt)}</p>`:''}${author?`<div class="wb-byline wb-v3-author">${authorImg?`<img src="${esc(authorImg)}" alt="" width="42" height="42">`:''}<div><strong>${esc(author.name)}</strong>${author.role?`<span>${esc(author.role)}</span>`:''}${post._updatedAt&&published&&date(post._updatedAt)!==published?`<span>Updated ${date(post._updatedAt)}</span>`:''}</div></div>`:''}</div>
      ${shareToolbar(post,options)}
    </div></section>`:'';
    const v2Header=v2?`<section class="wb-hero wb-v2-hero" data-wissen-hero="true"><div class="wrap">
      <div class="wb-v2-topline"><nav class="wb-breadcrumb" aria-label="Breadcrumb"><a href="Insights.html">Insights</a><span aria-hidden="true">/</span><a href="${entry}">Blogs</a></nav>${options.preview?'<p class="wb-preview-note">Layout preview &middot; Illustrative content</p>':''}</div>
      <div class="wb-v2-lead${imageUrl(post.mainImage)?'':' wb-v2-no-cover'}">
        <div class="wb-v2-intro">
          <div class="wb-meta">${(post.categories||[]).map(c=>`<span>${esc(c.title)}</span>`).join('')}${published?`<time datetime="${esc(post.publishedAt)}">${published}</time>`:''}<span>${minutes} min read</span></div>
          <h1 id="blog-title" data-wissen-type="hero-title">${esc(post.title)}</h1>
          ${post.excerpt?`<p class="wb-deck" data-wissen-type="hero-body">${esc(post.excerpt)}</p>`:''}
          <a class="wb-v2-read" href="#blog-content">Read the article <span aria-hidden="true">&darr;</span></a>
        </div>
        ${image(post.mainImage,'wb-cover wb-v2-cover',true)}
      </div>
      <div class="wb-byline wb-v2-byline">${authorImg?`<img src="${esc(authorImg)}" alt="" width="42" height="42">`:''}${author?`<div><strong>${esc(author.name)}</strong>${author.role?`<span>${esc(author.role)}</span>`:''}</div>`:''}<a class="wb-v2-all" href="Insights.html">&larr; All insights</a><div class="wb-share"><a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(options.url||'')}" data-blog-share target="_blank" rel="noopener noreferrer" aria-label="Share article on LinkedIn">in</a><button type="button" data-blog-copy>Copy link</button><span class="wb-sr" data-copy-status role="status"></span></div></div>
    </div></section>`:'';
    return (v3?v3Header:v2?v2Header:`<section class="wb-hero" data-wissen-hero="true"><div class="wrap">
      <nav class="wb-breadcrumb" aria-label="Breadcrumb"><a href="Insights.html">Insights</a><span aria-hidden="true">/</span><a href="Blog.html">Blogs</a></nav>
      ${options.preview?'<p class="wb-preview-note">Layout preview &middot; Illustrative content, not a published article</p>':''}
      <div class="wb-meta">${(post.categories||[]).map(c=>`<span>${esc(c.title)}</span>`).join('')}${published?`<time datetime="${esc(post.publishedAt)}">${published}</time>`:''}<span>${minutes} min read</span></div>
      <h1 id="blog-title" data-wissen-type="hero-title">${esc(post.title)}</h1>
      ${post.excerpt?`<p class="wb-deck" data-wissen-type="hero-body">${esc(post.excerpt)}</p>`:''}
      <div class="wb-byline">${authorImg?`<img src="${esc(authorImg)}" alt="" width="42" height="42">`:''}${author?`<div><strong>${esc(author.name)}</strong>${author.role?`<span>${esc(author.role)}</span>`:''}</div>`:''}<div class="wb-share"><a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(options.url||'')}" data-blog-share target="_blank" rel="noopener noreferrer" aria-label="Share article on LinkedIn">in</a><button type="button" data-blog-copy>Copy link</button><span class="wb-sr" data-copy-status role="status"></span></div></div>
      ${image(post.mainImage,'wb-cover',true)}
    </div></section>`)+`
    <section class="wb-reading"${v2||v3?' id="blog-content" tabindex="-1"':''}><div class="wrap wb-reading-grid">
      <aside class="wb-aside">${toc.length?`<nav aria-label="In this article"><p>In this article</p><ol>${toc.map(h=>`<li><a href="#${h.id}" data-blog-toc>${esc(h.text)}</a></li>`).join('')}</ol></nav>`:''}<a class="wb-back" href="Insights.html">&larr; All insights</a></aside>
      <article class="wb-prose" aria-labelledby="blog-title">${body.html}
      ${post.tags?.length?`<ul class="wb-tags" aria-label="Article tags">${[...new Set(post.tags.filter(t=>typeof t==='string'&&t.trim()))].map(t=>`<li>${esc(t)}</li>`).join('')}</ul>`:''}
      ${author?.bio?`<div class="wb-author"><p>About the author</p><h2>${esc(author.name)}</h2><p>${esc(author.bio)}</p></div>`:''}
      ${v3?`<div class="wb-v3-article-end">${shareToolbar(post,options)}<a class="wb-v3-back-top" href="#blog-title">Back to top <span aria-hidden="true">&uarr;</span></a></div>`:''}
      <div class="wb-end"><p>Have a challenge in mind?</p><a class="ui-text" href="Contact-Us.html">Let’s talk <span aria-hidden="true">↗</span></a></div></article>
    </div></section>
    ${relatedCards.length?`<section class="wb-related" aria-labelledby="blog-related-title"><div class="wrap"><div class="wb-related-heading"><h2 id="blog-related-title" data-wissen-type="section-title">${v3?'Related <em>articles.</em>':'Keep <em>exploring.</em>'}</h2>${v3?`<a class="wb-related-all" href="Insights.html">Explore all insights <span aria-hidden="true">&rarr;</span></a>`:''}</div><div class="wb-related-grid">${relatedCards.map(p=>`<${options.preview?'article':'a'} class="wb-article-card"${options.preview?'':` href="${esc(link(p))}"`}>${image(p.mainImage,'wb-article-card-media')}<div><span>${esc(p.categories?.[0]?.title||'Blog')}</span><h3 data-wissen-type="card-title">${esc(p.title)}</h3>${p.excerpt?`<p data-wissen-type="card-body">${esc(p.excerpt)}</p>`:''}<span class="wb-article-card-read">${options.preview?'Sample article':'Read article <span aria-hidden="true">&rarr;</span>'}</span></div></${options.preview?'article':'a'}>`).join('')}</div></div></section>`:''}`;
  }
  function state(title, message, retry=false) {
    return `<section class="wb-hero wb-state" data-wissen-hero="true"><div class="wrap"><a class="wb-back" href="Insights.html">&larr; All insights</a><h1 data-wissen-type="hero-title">${esc(title)}</h1><p>${esc(message)}</p>${retry?'<button type="button" class="button primary" data-blog-retry>Try again</button>':''}</div></section>`;
  }
  const imageProjection=`{alt,caption,credit,crop,hotspot,asset->{url}}`;
  const cardProjection=`{_id,title,slug,publishedAt,excerpt,mainImage${imageProjection},categories[]->{_id,title}}`;
  const projection=`{_id,_updatedAt,title,slug,publishedAt,excerpt,tags,featured,seo{title,description,noIndex,image${imageProjection}},mainImage${imageProjection},author->{name,role,bio,image${imageProjection}},categories[]->{_id,title,slug},relatedArticles[]->${cardProjection},body[]{..., _type == "image" => {asset->{url},alt,caption,credit,crop,hotspot}}}`;
  const filter=`_type == $type && defined(slug.current) && defined(publishedAt) && dateTime(publishedAt) <= dateTime(now())`;
  function insightCards(posts, options={}) {
    return posts.filter(p=>p.title&&validSlug(slug(p))).map(p=>{
      const cover=imageUrl(p.mainImage,800), published=date(p.publishedAt);
      const href=options.static?`blogs/${slug(p)}/`:`Blog.html?slug=${encodeURIComponent(slug(p))}`;
      return `<a class="ins-card ins-reveal" data-insights-blog-card data-blog-slug="${esc(slug(p))}" href="${esc(href)}">${cover?`<div class="ins-card-media"><img src="${esc(cover)}" alt="${esc(p.mainImage?.alt||'')}" loading="lazy" decoding="async"></div>`:''}<div class="ins-card-body"><span class="ins-card-meta">${esc(p.categories?.[0]?.title||'Blog')}</span><h3 data-wissen-type="card-title">${esc(p.title)}</h3>${p.excerpt?`<p data-wissen-type="card-body">${esc(p.excerpt)}</p>`:''}${published?`<time class="ins-card-date" datetime="${esc(p.publishedAt)}">${published}</time>`:''}<div class="ins-card-bottom"><span class="ins-card-read">Read article</span><span class="ins-card-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10"/></svg></span></div></div></a>`;
    }).join('\n');
  }
  function insightsQuery(config, page=0) {
    const start=Math.max(0,Math.floor(Number(page)||0))*12;
    return {url:`https://${config.projectId}.api.sanity.io/v${config.apiVersion}/data/query/${config.dataset}`,params:{
      query:`*[${filter} && defined(title) && count(body) > 0] | order(publishedAt desc, _id asc)[${start}...${start+13}]${cardProjection}`,
      perspective:'published','$type':JSON.stringify(config.documentType)
    }};
  }
  function query(config, params={}, cdn=true) {
    return { url:`https://${config.projectId}.${cdn?'apicdn':'api'}.sanity.io/v${config.apiVersion}/data/query/${config.dataset}`, params: {query:`*[${filter} ${params.slug?'&& slug.current == $slug':''} ${params.excludeSlug?'&& slug.current != $excludeSlug':''}] | order(publishedAt desc, _id asc)[0...${params.slug?1:params.excludeSlug?3:4}]${projection}`,perspective:'published','$type':JSON.stringify(config.documentType),...(params.slug?{'$slug':JSON.stringify(params.slug)}:{}),...(params.excludeSlug?{'$excludeSlug':JSON.stringify(params.excludeSlug)}:{})} };
  }
  return {esc,safeUrl,imageUrl,plain,slug,validSlug,bodyHtml,render,state,query,projection,filter,shareLinks,selectRelated,insightCards,insightsQuery};
});
