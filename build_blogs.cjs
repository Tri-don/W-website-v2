/* Generate complete HTML from Wix CMS, without changing the existing framework. */
'use strict';
const fs=require('node:fs'), path=require('node:path');
const B=require('./src/blog/content.js');
const {BLOG,rebaseHtml}=require('./scripts/site-paths.cjs');
const root=__dirname, config=JSON.parse(fs.readFileSync(path.join(root,'src/blog/config.json'),'utf8'));
const hostingDomain=process.env.VERCEL_PROJECT_PRODUCTION_URL||process.env.VERCEL_URL;
const siteUrl=process.env.SITE_URL||config.siteUrl||(hostingDomain?'https://'+hostingDomain:'');
if(siteUrl){
  const parsed=new URL(siteUrl);
  if(!['https:','http:'].includes(parsed.protocol)||parsed.username||parsed.password||parsed.search||parsed.hash)throw new Error('SITE_URL must be an HTTP(S) site root without credentials, query or fragment.');
  config.siteUrl=parsed.href.replace(/\/?$/,'/');
}
if(!['v1','v2','v3'].includes(config.templateVariant||'v3'))throw new Error('Unknown blog template variant');
function read(p){return fs.readFileSync(path.join(root,p),'utf8');}
function write(p,s){fs.mkdirSync(path.dirname(path.join(root,p)),{recursive:true});fs.writeFileSync(path.join(root,p),s);}
function page(post,related,preview=false,variant=config.templateVariant||'v3'){
  const slug=B.slug(post), url=config.siteUrl?new URL('blogs/'+slug+'/',config.siteUrl.replace(/\/?$/,'/')).href:'';
  const destination=preview?'insights/Blog-preview.html':`blogs/${slug}/index.html`;
  let html=rebaseHtml(read(BLOG),BLOG,destination);
  const article=rebaseHtml(B.render(post,related,{preview,static:true,url,variant}),'index.html',destination);
  html=html.replace(/<main id="main"[^>]*>[\s\S]*?<\/main>/,()=>`<main id="main" data-blog-root data-blog-static="true">${article}</main>`);
  html=html.replace(/<title>[\s\S]*?<\/title>/,()=>`<title>${B.esc(post.seo?.title||post.title)} | Wissen Technology</title>`);
  html=html.replace(/<meta name="description"[^>]*>/,()=>`<meta name="description" content="${B.esc(post.seo?.description||post.excerpt||'')}">`);
  html=html.replace(/<meta name="robots"[^>]*>/,`<meta name="robots" content="${preview?'noindex,nofollow':post.seo?.noIndex?'noindex,follow':'index,follow'}">`);
  if(!preview){
    const socialImage=B.imageUrl(post.seo?.image)||B.imageUrl(post.mainImage);
    const seoTitle=post.seo?.title||post.title, seoDescription=post.seo?.description||post.excerpt||'';
    const data={'@context':'https://schema.org','@type':'BlogPosting',headline:post.title,description:post.excerpt,datePublished:post.publishedAt,dateModified:post._updatedAt||post.publishedAt,...(url?{url,mainEntityOfPage:url}:{}),...(post.author?{author:{'@type':'Person',name:post.author.name}}:{}),publisher:{'@type':'Organization',name:'Wissen Technology'},...(B.imageUrl(post.mainImage)?{image:B.imageUrl(post.mainImage)}:{})};
    const meta=[
      url?`<link rel="canonical" href="${B.esc(url)}"><meta property="og:url" content="${B.esc(url)}">`:'',
      `<meta property="og:type" content="article"><meta property="og:title" content="${B.esc(seoTitle)}"><meta property="og:description" content="${B.esc(seoDescription)}">`,
      socialImage?`<meta property="og:image" content="${B.esc(socialImage)}">`:'',
      `<meta name="twitter:card" content="${socialImage?'summary_large_image':'summary'}"><meta name="twitter:title" content="${B.esc(seoTitle)}"><meta name="twitter:description" content="${B.esc(seoDescription)}">`,
      socialImage?`<meta name="twitter:image" content="${B.esc(socialImage)}">`:'',
      `<script type="application/ld+json">${JSON.stringify(data).replace(/</g,'\\u003c')}</script>`
    ];
    html=html.replace('</head>',()=>meta.join('')+'</head>');
  }
  return html;
}
const {fetchPublished}=require('./src/blog/wix.cjs');
async function run(){
  if(process.argv.includes('--preview-only')){
    const sample=JSON.parse(read('src/blog/layout-preview.json'));
    const variant=config.templateVariant||'v3', file='insights/Blog-preview.html';
    const related=variant==='v3'?JSON.parse(read('src/blog/related-preview.json')):[];
    write(file,page(sample,related,true,variant));console.log(`Created ${file} (illustrative, local only).`);return;
  }
  const posts=await fetchPublished(), slugs=new Set();
  // Validate and render everything before changing any published output.
  const output=posts.map(post=>{
    const s=B.slug(post);if(!B.validSlug(s)||slugs.has(s))throw new Error('Invalid or duplicate blog slug: '+s);
    if(!post.title||!Array.isArray(post.body)||!post.body.length)throw new Error('Incomplete article: '+s);
    slugs.add(s);return {file:`blogs/${s}/index.html`,html:page(post,posts.filter(p=>p._id!==post._id).slice(0,3))};
  });
  const old=fs.existsSync(path.join(root,'src/blog/generated-pages.json'))?JSON.parse(read('src/blog/generated-pages.json')):[];
  for(const entry of output)write(entry.file,entry.html);
  for(const file of old){
    if(/^blogs\/[a-z0-9]+(?:-[a-z0-9]+)*\/index\.html$/.test(file)&&!output.some(p=>p.file===file)&&fs.existsSync(path.join(root,file)))fs.unlinkSync(path.join(root,file));
  }
  write('src/blog/generated-pages.json',JSON.stringify(output.map(p=>p.file),null,2)+'\n');
  console.log(`Built ${output.length} published article(s) from Wix CMS. No draft or future-dated content exported.`);
}
if(require.main===module)run().catch(e=>{console.error(e.message);process.exitCode=1;});
module.exports={page,fetchPublished,config};
