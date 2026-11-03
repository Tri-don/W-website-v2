/* Portable static output: Vercel today, ordinary file hosting later. */
'use strict';
const fs=require('node:fs'), path=require('node:path'), {spawnSync}=require('node:child_process');
const ROOT=path.resolve(__dirname,'..'), OUT=path.resolve(ROOT,'dist');
const B=require('../src/blog/content.js'), Blog=require('../build_blogs.cjs');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
function write(p,text){const target=path.resolve(OUT,p);if(!target.startsWith(OUT+path.sep))throw new Error('Output path escaped dist');fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,text);}
function normalize(html){return html.replace(/href="((?:\.\.\/)*)Blog(?:-v[23])?\.html"/g,(_,prefix)=>`href="${prefix}blogs/"`);}
function card(post, insights=false){
  const src=B.imageUrl(post.mainImage,800), title=B.esc(post.title), href=`blogs/${B.slug(post)}/`;
  const picture=src?`<img src="${B.esc(src)}" alt="${B.esc(post.mainImage?.alt)}" loading="lazy" decoding="async">`:'';
  const category=B.esc(post.categories?.[0]?.title||'Blog'), description=B.esc(post.excerpt||'');
  return insights?
    `<a class="ins-card ins-reveal" href="${href}">${picture?`<div class="ins-card-media">${picture}</div>`:''}<div class="ins-card-body"><span class="ins-card-meta">${category}</span><h3 data-wissen-type="card-title">${title}</h3><p data-wissen-type="card-body">${description}</p><div class="ins-card-bottom"><span class="ins-card-read">Read article</span><span aria-hidden="true">&rarr;</span></div></div></a>`:
    `<a class="wb-article-card" href="../${href}">${picture?`<figure class="wb-article-card-media">${picture}</figure>`:''}<div><span>${category}</span><h2 data-wissen-type="card-title">${title}</h2><p data-wissen-type="card-body">${description}</p><span class="wb-article-card-read">Read article <span aria-hidden="true">&rarr;</span></span></div></a>`;
}
function archive(posts){
  let html=read('Blog.html');
  const main=`<main id="main"><section class="wb-hero" data-wissen-hero="true"><div class="wrap"><nav class="wb-breadcrumb" aria-label="Breadcrumb"><a href="Insights.html">Insights</a><span aria-hidden="true">/</span><span>Blogs</span></nav><h1 data-wissen-type="hero-title">Ideas for what <em>comes next.</em></h1><p class="wb-deck" data-wissen-type="hero-body">Perspectives on engineering, data and the technology shaping enterprise.</p></div></section><section class="wb-related"><div class="wrap">${posts.length?`<div class="wb-related-grid" aria-label="Blog articles">${posts.map(p=>card(p)).join('')}</div>`:'<p>New perspectives are on their way. Visit our insights for more.</p>'}</div></section></main>`;
  html=html.replace(/<main id="main"[^>]*>[\s\S]*?<\/main>/,()=>main);
  html=html.replace(/<title>[\s\S]*?<\/title>/,'<title>Blogs | Wissen Technology</title>');
  html=html.replace(/<meta name="robots"[^>]*>/,'<meta name="robots" content="index,follow">');
  if(Blog.config.siteUrl)html=html.replace('</head>',`<link rel="canonical" href="${B.esc(new URL('blogs/',Blog.config.siteUrl).href)}"></head>`);
  // The archive is one folder below the site root; its card links were already rebased.
  html=html.replace(/\b(href|src|poster)="([^"#][^"]*)"/g,(m,attr,value)=>/^(?:[a-z][a-z0-9+.-]*:|\/|\.\.\/)/i.test(value)?m:`${attr}="../${value}"`);
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
    seen.add(slug);return {file:`blogs/${slug}/index.html`,html:normalize(Blog.page(post,posts.filter(p=>p._id!==post._id)))};
  });
  const archiveHtml=archive(posts);
  // Only this fixed, generated directory may be replaced; never follow a symlink.
  if(path.dirname(OUT)!==ROOT||path.basename(OUT)!=='dist')throw new Error('Unexpected output directory');
  if(fs.existsSync(OUT)&&fs.lstatSync(OUT).isSymbolicLink())throw new Error('dist must not be a symlink');
  fs.rmSync(OUT,{recursive:true,force:true});fs.mkdirSync(OUT,{recursive:true});
  for(const directory of ['assets','css','js'])fs.cpSync(path.join(ROOT,directory),path.join(OUT,directory),{recursive:true});
  const manifest=JSON.parse(read('src/site-manifest.json'));
  const files=[...new Set(Object.values(manifest.pages).map(p=>p.file))].filter(f=>!/-v\d+\.html$/i.test(f)&&f!=='Blog.html');
  for(const file of files){
    let html=normalize(read(file));
    if(file==='Insights.html'&&posts.length){
      const marker=/(<div class="ins-panel" id="panel-blogs"[^>]*>[\s\S]*?<div class="ins-grid">)/;
      if(!marker.test(html))throw new Error('Insights blog panel not found');
      html=html.replace(marker,(_,open)=>open+'\n'+posts.map(p=>card(p,true)).join('\n'));
    }
    write(file,html);
  }
  // Keep the accepted v3 shell for parameter-based links and manual CMS checks.
  write('Blog.html',normalize(read('Blog.html')));
  write('blogs/index.html',archiveHtml);
  for(const page of pages)write(page.file,page.html);
  // This is a strict allowlist. Tokens, schema sources and environment files are never copied.
  const cfg=Blog.config;
  write('src/blog/config.json',JSON.stringify({projectId:cfg.projectId,dataset:cfg.dataset,apiVersion:cfg.apiVersion,documentType:cfg.documentType,templateVariant:cfg.templateVariant,siteUrl:cfg.siteUrl||''},null,2));
  const base=cfg.siteUrl;
  if(base){
    const paths=[...files.filter(f=>f!=='index.html'),'','blogs/',...posts.filter(p=>!p.seo?.noIndex).map(p=>'blogs/'+B.slug(p)+'/')];
    write('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+paths.map(p=>`<url><loc>${B.esc(new URL(p,base).href)}</loc></url>`).join('')+'</urlset>');
  }
  write('robots.txt','User-agent: *\nAllow: /\n'+(base?'Sitemap: '+new URL('sitemap.xml',base).href+'\n':''));
  console.log(`Built dist: ${files.length} website pages, a blog archive and ${pages.length} Sanity articles using ${cfg.templateVariant||'v3'}.`);
  if(!base)console.log('Set SITE_URL when deploying to generate canonical URLs and the sitemap.');
}
build().catch(error=>{console.error(error.message);process.exitCode=1;});
