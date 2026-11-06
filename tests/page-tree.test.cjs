'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const ROOT=path.resolve(__dirname,'..');
const routes=require('../src/page-routes.json');
const {BLOG,rebaseHtml,normalize}=require('../scripts/site-paths.cjs');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');

test('manifest page paths match Git filename casing on Linux hosts',()=>{
  const result=spawnSync('git',['ls-files'],{cwd:ROOT,encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  const tracked=new Set(result.stdout.split(/\r?\n/));
  const trackedLower=new Set([...tracked].map(file=>file.toLowerCase()));
  const manifest=JSON.parse(read('src/site-manifest.json'));
  for(const page of Object.values(manifest.pages))if(trackedLower.has(page.file.toLowerCase()))assert.ok(tracked.has(page.file),`Filename casing differs from Git: ${page.file}`);
});

test('shared page script is deferred so navigation HTML can render during download',()=>{
  const manifest=JSON.parse(read('src/site-manifest.json'));
  for(const page of Object.values(manifest.pages)){
    const tag=read(page.file).match(/<script\b[^>]*src="[^"]*js\/site\.js"[^>]*>/)?.[0];
    assert.ok(tag&&/\bdefer\b/.test(tag),page.file);
  }
});

test('moved pages have matching permanent redirects and no root duplicates',()=>{
  const redirects=JSON.parse(read('vercel.json')).redirects;
  for(const [old,file] of Object.entries(routes)){
    assert.ok(fs.existsSync(path.join(ROOT,file)),file);
    assert.ok(!fs.existsSync(path.join(ROOT,old)),old);
    assert.ok(redirects.some(r=>r.source==='/'+old&&r.destination==='/'+file&&r.permanent===true),old);
  }
});

test('article rebasing preserves queries, fragments, external links and nested page depth',()=>{
  const input='<html data-wissen-root="../"><a href="../company/Contact-Us.html?topic=ai#form">Contact</a><img src="../assets/images/home/brain-poster.jpg"><a href="#title">Top</a><a href="https://example.com/a">External</a>';
  const html=rebaseHtml(input,BLOG,'blogs/example/index.html');
  assert.ok(html.includes('data-wissen-root="../../"'));
  assert.ok(html.includes('href="../../company/Contact-Us.html?topic=ai#form"'));
  assert.ok(html.includes('src="../../assets/images/home/brain-poster.jpg"'));
  assert.ok(html.includes('href="#title"'));
  assert.ok(html.includes('href="https://example.com/a"'));
  assert.equal(normalize('<a href="Blog.html">All</a><a href="Blog.html?slug=test">One</a>',BLOG),'<a href="../blogs/">All</a><a href="Blog.html?slug=test">One</a>');
});

test('browser CMS renderers resolve configuration and card links from every page depth',()=>{
  for(const prefix of ['', '../', '../../']){
    const context={document:{documentElement:{dataset:{wissenRoot:prefix}}},URL};
    vm.runInNewContext(read('src/blog/content.js'),context);
    vm.runInNewContext(read('src/blog/home-cards.js'),context);
    const B=context.WissenBlog,H=context.WissenHomeBlog;
    const post={_id:'example',title:'Example',slug:{current:'example'},publishedAt:'2020-01-01',mainImage:{url:'assets/images/home/brain-poster.jpg'},body:[]};
    assert.equal(B.sitePath('src/blog/config.json'),prefix+'src/blog/config.json');
    for(const html of [B.insightCards([post]),B.featuredInsights([post]),H.render({latest:[post]})]){
      assert.ok(html.includes(`href="${prefix}insights/Blog.html?slug=example"`),html);
      assert.ok(html.includes(`src="${prefix}assets/images/home/brain-poster.jpg"`));
    }
    assert.ok(B.render(post,[],{variant:'v3'}).includes(`href="${prefix}company/Contact-Us.html"`));
    assert.ok(B.state('Unavailable','Try again').includes(`href="${prefix}insights/Insights.html"`));
  }
});

test('exported articles retain stable links when live cards refresh',()=>{
  const post={_id:'built',title:'Built article',slug:{current:'built'},publishedAt:'2020-01-01'};
  const options={articleSlugs:['built']};
  for(const html of [BCard('insightCards'),BCard('featuredInsights'),HCard()]){
    assert.ok(html.includes('href="blogs/built/"'));
    assert.ok(!html.includes('Blog.html?slug=built'));
  }
  function BCard(method){return require('../src/blog/content.js')[method]([post],options);}
  function HCard(){return require('../src/blog/home-cards.js').render({latest:[post]},options);}
  const B=require('../src/blog/content.js');
  assert.equal(B.articleHref({slug:{current:'not-exported'}},options),'insights/Blog.html?slug=not-exported');
  assert.equal(B.articleHref({slug:{current:'../bad'}},options),'#');
});

test('complete static export works offline with nested pages, archive and article links',()=>{
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'wissen-page-tree-'));
  const run=(command,args)=>{
    const result=spawnSync(command,args,{cwd:temp,encoding:'utf8',env:{...process.env,SITE_URL:'https://example.test/site/'}});
    assert.equal(result.status,0,result.stdout+'\n'+result.stderr);
    return result;
  };
  try{
    for(const dir of ['src','scripts','assets','css','js'])fs.cpSync(path.join(ROOT,dir),path.join(temp,dir),{recursive:true});
    for(const file of ['build_site.py','build_blogs.cjs',...Object.values(JSON.parse(read('src/site-manifest.json')).pages).map(p=>p.file)]){
      const target=path.join(temp,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(ROOT,file),target);
    }
    // Supply deterministic local content through the existing fetch boundary; no network or live CMS changes.
    fs.writeFileSync(path.join(temp,'js/private.json'),'synthetic-private-marker');
    fs.writeFileSync(path.join(temp,'css/.env'),'synthetic-private-marker');
    run(process.execPath,['-e',`const Blog=require('./build_blogs.cjs');
      const sample=require('./src/blog/layout-preview.json');
      Blog.config.privateToken='synthetic-private-marker';
      Blog.fetchPublished=async()=>['first','second'].map(slug=>({...sample,_id:slug,title:'Offline '+slug,slug:{current:slug},publishedAt:'2020-01-01T00:00:00Z'}));
      require('./scripts/build-static.cjs');`]);
    run(process.env.PYTHON||(process.platform==='win32'?'python':'python3'),['scripts/check-site.py','--dist']);
    const output=file=>fs.readFileSync(path.join(temp,'dist',file),'utf8');
    assert.ok(output(routes['Insights.html']).includes('href="../blogs/first/"'));
    assert.ok(output('blogs/index.html').includes('href="first/"'));
    assert.ok(output('blogs/first/index.html').includes('href="../../company/Contact-Us.html"'));
    assert.ok(output('blogs/first/index.html').includes('href="../second/"'));
    assert.ok(output('sitemap.xml').includes('https://example.test/site/services/Application-Development.html'));
    assert.ok(!fs.existsSync(path.join(temp,'dist/docs')));
    assert.ok(!fs.existsSync(path.join(temp,'dist/Bin')));
    assert.ok(!fs.existsSync(path.join(temp,'dist/Blog.html')));
    assert.ok(!fs.existsSync(path.join(temp,'dist/js/private.json')));
    assert.ok(!fs.existsSync(path.join(temp,'dist/css/.env')));
    assert.ok(!output('src/blog/config.json').includes('synthetic-private-marker'));
    assert.deepEqual(JSON.parse(output('src/blog/config.json')).articleSlugs,['first','second']);
  }finally{
    assert.ok(path.resolve(temp).startsWith(path.resolve(os.tmpdir())+path.sep));
    assert.ok(path.basename(temp).startsWith('wissen-page-tree-'));
    fs.rmSync(temp,{recursive:true,force:true});
  }
});
