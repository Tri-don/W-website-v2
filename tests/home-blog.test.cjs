'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const H=require('../src/blog/home-cards.js');
const B=require('../src/blog/content.js');
const post=(slug,extra={})=>({_id:slug,title:slug,slug:{current:slug},publishedAt:'2026-11-03T00:00:00Z',...extra});

test('page filters apply before featured selection and slicing without unrelated fallbacks',()=>{
  const posts=[post('unrelated',{featured:true}),post('cloud',{services:['cloud']}),post('both',{industries:['telecom','retail'],services:['cloud','ai-ml']}),post('telecom',{industries:['telecom']})];
  assert.deepEqual(H.select(H.fromPosts(posts,{industry:'telecom'})).map(c=>c.post._id).sort(),['both','telecom']);
  assert.deepEqual(H.select(H.fromPosts(posts,{service:'cloud'})).map(c=>c.post._id).sort(),['both','cloud']);
  assert.deepEqual(H.select(H.fromPosts(posts,{industry:'telecom',service:'cloud'})).map(c=>c.post._id),['both']);
  assert.deepEqual(H.select(H.fromPosts(posts,{service:'experience-design'})),[]);
  assert.equal(H.render({featured:posts[0],latest:posts},{service:'experience-design'}),'');
  const config={projectId:'example',dataset:'production',apiVersion:'2026-11-03',documentType:'blogPost'};
  const q=H.query(config,{industry:'telecom',service:'cloud'});
  assert.equal(q.params.$industry,'"telecom"');assert.equal(q.params.$service,'"cloud"');
  assert.equal(q.params.query.split('$industry in industries').length-1,2);
  assert.equal(q.params.query.split('$service in services').length-1,2);
  assert.ok(!H.query(config).params.query.includes('$industry'));
});

test('centre card uses Featured and sides use newest other posts without duplicates',()=>{
  const old=post('featured',{featured:true,publishedAt:'2026-10-01T00:00:00Z'});
  const latest=post('newest',{publishedAt:'2026-11-03T08:00:00Z'}),second=post('second'),third=post('third',{publishedAt:'2026-11-02T00:00:00Z'});
  const cards=H.select(H.fromPosts([old,third,second,latest]));
  assert.deepEqual(cards.map(c=>c.post._id),['newest','featured','second']);
  assert.equal(cards[1].featured,true);
  assert.deepEqual(H.select({latest:[]}),[]);
  assert.equal(H.select({latest:[latest]}).length,1);
  assert.equal(H.select({latest:[latest,second]}).length,2);
  const unfeatured=H.select({latest:[latest,latest,second,third]});
  assert.equal(unfeatured[1].post._id,'newest');
  assert.equal(new Set(unfeatured.map(c=>c.post._id)).size,3);
});

test('cards preserve homepage layout, safe CMS content, and article routes',()=>{
  const data={featured:post('featured',{title:'<script>unsafe</script>',categories:[{title:'Data & AI'}]}),latest:[post('latest'),post('second')]};
  const html=H.render(data),snapshot=H.render(data,{static:true});
  assert.equal((html.match(/data-home-blog-card/g)||[]).length,3);
  assert.equal((html.match(/class="wb-card wb-standard"/g)||[]).length,2);
  assert.equal((html.match(/class="wb-card wb-feature"/g)||[]).length,1);
  assert.ok(html.includes('id="wb-home-cms-mask"'));
  assert.ok(html.includes('&lt;script&gt;unsafe&lt;/script&gt;'));
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('Data &amp; AI'));
  assert.ok(html.includes('insights/Blog.html?slug=featured'));
  assert.ok(snapshot.includes('href="blogs/featured/"'));
  assert.ok(html.includes('wb-home-art'));
  assert.ok(!html.includes('<img'));
  assert.equal(H.render({latest:[post('../invalid')]}),'');
});

test('browser refresh updates cards, keeps snapshot on failure, and retries safely',async()=>{
  const config={projectId:'example',dataset:'production',apiVersion:'2026-11-03',documentType:'blogPost',articleSlugs:['newest','second','third']};
  let now=100000,payload={featured:null,latest:['newest','second','third'].map(slug=>post(slug,{services:['cloud']}))},fail=false;
  const listeners={},requests=[];
  const grid={innerHTML:'<a data-home-blog-card>Previous snapshot</a>',dataset:{},setAttribute(){},querySelector(){return this.innerHTML.includes('data-home-blog-card')?{}:null;}};
  const status={textContent:''},retry={hidden:true,addEventListener:(type,fn)=>listeners.retry=fn};
  const section={dataset:{blogService:'cloud'},querySelector:selector=>({'[data-home-blog-grid]':grid,'[data-home-blog-status]':status,'[data-home-blog-retry]':retry}[selector])};
  const document={readyState:'complete',hidden:false,querySelector:()=>section,addEventListener:(type,fn)=>listeners[type]=fn};
  const context={document,window:{WissenBlog:B,WissenHomeBlog:H,addEventListener:(type,fn)=>listeners[type]=fn},URL,AbortSignal,
    Date:class extends Date{static now(){return now;}},fetch:async(url,options)=>{
      requests.push({url:String(url),options});
      if(fail)throw Error('offline');
      return{ok:true,json:async()=>String(url).includes('config.json')?config:{result:payload}};
    }};
  const settle=async()=>{await new Promise(setImmediate);await new Promise(setImmediate);};
  vm.runInNewContext(fs.readFileSync(require.resolve('../src/scripts/home-blog-cms.js'),'utf8'),context);
  await settle();
  assert.equal(grid.dataset.cardCount,'3');
  assert.equal(requests[0].options.credentials,'same-origin');
  assert.equal(requests[1].options.credentials,'omit');
  assert.equal(new URL(requests[1].url).hostname,'example.apicdn.sanity.io');
  assert.equal(new URL(requests[1].url).searchParams.get('$service'),'"cloud"');
  assert.equal(requests[1].options.method,'GET');
  assert.equal(requests[1].options.redirect,'error');
  assert.ok(grid.innerHTML.includes('href="blogs/newest/"'));
  assert.equal(retry.hidden,true);
  assert.equal(status.textContent,'');
  payload={featured:post('unrelated-featured',{featured:true}),latest:[post('just-published',{services:['cloud']}),post('unrelated')]};now+=61000;listeners.focus();await settle();
  assert.equal(grid.dataset.cardCount,'1');
  assert.ok(grid.innerHTML.includes('just-published'));
  assert.ok(!grid.innerHTML.includes('unrelated'));
  assert.ok(!grid.innerHTML.includes('slug=second'));
  const previous=grid.innerHTML;
  fail=true;now+=61000;listeners.focus();await settle();
  assert.equal(grid.innerHTML,previous);
  assert.equal(retry.hidden,false);
  fail=false;payload={featured:null,latest:[]};listeners.retry();await settle();
  assert.equal(grid.innerHTML,'');
  assert.equal(grid.dataset.cardCount,'0');
  assert.equal(retry.hidden,true);
  assert.match(status.textContent,/Explore all blogs/);
});
