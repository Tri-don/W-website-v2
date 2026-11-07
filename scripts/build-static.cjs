/* Portable static output: Vercel today, ordinary file hosting later. */
'use strict';
const fs=require('node:fs'), path=require('node:path'), {spawnSync}=require('node:child_process');
const ROOT=path.resolve(__dirname,'..'), OUT=path.resolve(ROOT,'dist');
const B=require('../src/blog/content.js'), Blog=require('../build_blogs.cjs');
const HomeBlog=require('../src/blog/home-cards.js');
const {BLOG,INSIGHTS,rebaseHtml,normalize}=require('./site-paths.cjs');
const {publicAssets}=require('./public-assets.cjs');
const legacyPages=require('../src/legacy-page-aliases.json');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
function write(p,text){const target=path.resolve(OUT,p);if(!target.startsWith(OUT+path.sep))throw new Error('Output path escaped dist');fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,text);}
function card(post){
  const src=B.imageUrl(post.mainImage,800), title=B.esc(post.title), href=`blogs/${B.slug(post)}/`;
  const picture=src?`<img src="${B.esc(src)}" alt="${B.esc(post.mainImage?.alt)}" loading="lazy" decoding="async">`:'';
  const category=B.esc(post.categories?.[0]?.title||'Blog'), description=B.esc(post.excerpt||'');
  return `<a class="wb-article-card" href="${href}">${picture?`<figure class="wb-article-card-media">${picture}</figure>`:''}<div><span>${category}</span><h2 data-wissen-type="card-title">${title}</h2><p data-wissen-type="card-body">${description}</p><span class="wb-article-card-read">Read article <span aria-hidden="true">&rarr;</span></span></div></a>`;
}
function archive(posts){
  let html=rebaseHtml(read(BLOG),BLOG,'blogs/index.html');
  const main=`<main id="main"><section class="wb-hero" data-wissen-hero="true"><div class="wrap"><nav class="wb-breadcrumb" aria-label="Breadcrumb"><a href="${INSIGHTS}">Insights</a><span aria-hidden="true">/</span><span>Blogs</span></nav><h1 data-wissen-type="hero-title">Ideas for what <em>comes next.</em></h1><p class="wb-deck" data-wissen-type="hero-body">Perspectives on engineering, data and the technology shaping enterprise.</p></div></section><section class="wb-related"><div class="wrap">${posts.length?`<div class="wb-related-grid" aria-label="Blog articles">${posts.map(p=>card(p)).join('')}</div>`:'<p>New perspectives are on their way. Visit our insights for more.</p>'}</div></section></main>`;
  html=html.replace(/<main id="main"[^>]*>[\s\S]*?<\/main>/,()=>rebaseHtml(main,'index.html','blogs/index.html'));
  html=html.replace(/<title>[\s\S]*?<\/title>/,'<title>Blogs | Wissen Technology</title>');
  html=html.replace(/<meta name="robots"[^>]*>/,'<meta name="robots" content="index,follow">');
  if(Blog.config.siteUrl)html=html.replace('</head>',()=>`<link rel="canonical" href="${B.esc(new URL('blogs/',Blog.config.siteUrl).href)}"></head>`);
  return html;
}
async function build(){
  const python=process.env.PYTHON||(process.platform==='win32'?'python':'python3');
  const assets=spawnSync(python,['build_site.py'],{cwd:ROOT,stdio:'inherit',shell:false});
  if(assets.error||assets.status!==0)throw new Error('Asset build failed. Python 3 must be available; set PYTHON to its executable if necessary.');
  const posts=await Blog.fetchPublished(), seen=new Set();
  // Validate and render all CMS data before replacing the last generated output.
  const pages=posts.map(post=>{
    const slug=B.slug(post);
    if(!B.validSlug(slug)||seen.has(slug)||!post.title||!Array.isArray(post.body)||!post.body.length)throw new Error('Incomplete or duplicate blog article: '+slug);
    const file=`blogs/${slug}/index.html`;
    seen.add(slug);return {file,html:normalize(Blog.page(post,posts.filter(p=>p._id!==post._id)),file)};
  });
  const archiveHtml=archive(posts);
  // Validate media before replacing output; hidden secrets and active HTML are not media.
  const media=publicAssets(ROOT);
  // Only this fixed, generated directory may be replaced; never follow a symlink.
  if(path.dirname(OUT)!==ROOT||path.basename(OUT)!=='dist')throw new Error('Unexpected output directory');
  if(fs.existsSync(OUT)&&fs.lstatSync(OUT).isSymbolicLink())throw new Error('dist must not be a symlink');
  fs.rmSync(OUT,{recursive:true,force:true});fs.mkdirSync(OUT,{recursive:true});
  for(const file of [...media,'css/site.css','js/site.js']){
    const target=path.join(OUT,file);
    fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(ROOT,file),target);
  }
  const manifest=JSON.parse(read('src/site-manifest.json'));
  const files=[...new Set(Object.values(manifest.pages).map(p=>p.file))].filter(f=>!/-v\d+\.html$/i.test(f)&&f!==BLOG);
  for(const file of files){
    let html=normalize(read(file),file);
    const sectionConfig=Object.values(manifest.pages).find(page=>page.file===file)?.blogSection;
    if(sectionConfig){
      const marker=/<!-- CMS_HOME_BLOGS_START -->[\s\S]*?<!-- CMS_HOME_BLOGS_END -->/;
      if(!marker.test(html))throw new Error('CMS blog section not found: '+file);
      const data=HomeBlog.fromPosts(posts,sectionConfig),count=HomeBlog.select(data,sectionConfig).length;
      html=html.replace(marker,()=>`<!-- CMS_HOME_BLOGS_START -->
        <div class="wb-grid" data-home-blog-grid data-card-count="${count}" aria-busy="false">${rebaseHtml(HomeBlog.render(data,{...sectionConfig,static:true}),'index.html',file)}</div>
        <div class="wb-home-controls"><p class="wb-home-status" data-home-blog-status role="status">${count?'':HomeBlog.emptyMessage(sectionConfig)}</p><button class="wb-home-retry" type="button" data-home-blog-retry hidden>Try again</button></div>
        <!-- CMS_HOME_BLOGS_END -->`);
    }
    if(file===INSIGHTS){
      const featuredMarker=/<!-- CMS_FEATURED_START -->[\s\S]*?<!-- CMS_FEATURED_END -->/;
      if(!featuredMarker.test(html))throw new Error('Insights featured panel not found');
      html=html.replace(featuredMarker,()=>`<!-- CMS_FEATURED_START -->${rebaseHtml(B.featuredInsights(posts,{static:true}),'index.html',file)}<!-- CMS_FEATURED_END -->`);
      const marker=/<!-- CMS_BLOGS_START -->[\s\S]*?<!-- CMS_BLOGS_END -->/;
      if(!marker.test(html))throw new Error('Insights blog panel not found');
      html=html.replace(marker,()=>`<!-- CMS_BLOGS_START -->
          <div class="ins-grid" data-insights-blog-grid aria-busy="false">${rebaseHtml(B.insightCards(posts.slice(0,12),{static:true}),'index.html',file)}</div>
          <div class="ins-blog-controls"><p class="ins-blog-status" data-insights-blog-status role="status">${posts.length?'':'New perspectives are on their way. Check back soon.'}</p><button class="ins-blog-button" type="button" data-insights-blog-retry hidden>Try again</button><button class="ins-blog-button" type="button" data-insights-blog-more${posts.length>12?'':' hidden'}>Load more articles</button></div>
          <!-- CMS_BLOGS_END -->`);
    }
    write(file,html);
  }
  // Keep the accepted v3 shell for parameter-based links and manual CMS checks.
  write(BLOG,normalize(read(BLOG),BLOG));
  // Serve legacy nested URLs without redirecting them back into cached permanent redirects.
  // Rebase each compatibility page so relative assets and live CMS reads still work.
  for(const [legacy,canonical] of Object.entries(legacyPages)){
    let html=rebaseHtml(fs.readFileSync(path.join(OUT,canonical),'utf8'),canonical,legacy);
    const canonicalUrl=Blog.config.siteUrl?new URL(canonical,Blog.config.siteUrl).href:
      path.posix.relative(path.posix.dirname(legacy),canonical);
    html=html.replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi,'');
    html=html.replace('</head>',()=>`<link rel="canonical" href="${B.esc(canonicalUrl)}"></head>`);
    write(legacy,html);
  }
  write('blogs/index.html',archiveHtml);
  for(const page of pages)write(page.file,page.html);
  // This is a strict allowlist. Tokens, schema sources and environment files are never copied.
  const cfg=Blog.config;
  write('src/blog/config.json',JSON.stringify({templateVariant:cfg.templateVariant,siteUrl:cfg.siteUrl||'',articleSlugs:posts.map(B.slug)},null,2));
  write('src/blog/index.json',JSON.stringify(posts.map(({_id,title,slug,publishedAt,excerpt,featured,industries,services,mainImage,categories}) =>
    ({_id,title,slug,publishedAt,excerpt,featured,industries,services,mainImage,categories}))));
  const base=cfg.siteUrl;
  if(base){
    const paths=[...files.filter(f=>f!=='index.html'),'','blogs/',...posts.filter(p=>!p.seo?.noIndex).map(p=>'blogs/'+B.slug(p)+'/')];
    write('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+paths.map(p=>`<url><loc>${B.esc(new URL(p,base).href)}</loc></url>`).join('')+'</urlset>');
  }
  write('robots.txt','User-agent: *\nAllow: /\n'+(base?'Sitemap: '+new URL('sitemap.xml',base).href+'\n':''));
  console.log(`Built dist: ${files.length} website pages, a blog archive and ${pages.length} Wix CMS articles using ${cfg.templateVariant||'v3'}.`);
  if(!base)console.log('Set SITE_URL when deploying to generate canonical URLs and the sitemap.');
}
build().catch(error=>{console.error(error.message);process.exitCode=1;});
