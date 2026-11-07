'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const vm=require('node:vm');
const B=require('../src/blog/content.js'),H=require('../src/blog/home-cards.js');
const Blog=require('../build_blogs.cjs');
const {publicAssets}=require('../scripts/public-assets.cjs');
const payload='"><img src=x onerror="alert(1)"><script>alert(2)</script>&';
const sample={_id:'security-test',title:payload,slug:{current:'security-test'},publishedAt:'2020-01-01',excerpt:payload,
  categories:[{title:payload}],author:{name:payload,role:payload,bio:payload},tags:[payload],
  mainImage:{url:'assets/images/home/brain-poster.jpg',alt:payload,caption:payload,credit:payload},
  body:[{_type:'block',children:[{_type:'span',text:payload}]}]};

test('CMS text, attributes, captions and code are escaped in all renderers',()=>{
  for(const html of [B.render(sample,[],{variant:'v3'}),B.insightCards([sample]),B.featuredInsights([sample]),H.render({latest:[sample]})]){
    assert.ok(html.includes('&lt;script&gt;alert(2)&lt;/script&gt;'));
    assert.ok(!html.includes('<script>alert(2)</script>'));
    assert.ok(!html.includes('<img src=x'));
    assert.ok(!html.includes('alt="'+payload+'"'));
  }
  assert.equal(B.bodyHtml([{_type:'codeBlock',code:payload}]).html,`<pre><code>${B.esc(payload)}</code></pre>`);
});

test('unsafe links, invalid URLs and unapproved image origins are rejected',()=>{
  for(const value of ['javascript:alert(1)','JaVaScRiPt:alert(1)','java\nscript:alert(1)','data:text/html,<script>alert(1)</script>','//evil.test/path','https://trusted.test@evil.test/','https://','mailto:test@example.test?body=%0d%0aBcc:evil@example.test'])assert.equal(B.safeUrl(value),'',value);
  for(const value of ['https://example.test/path?topic=ai#part','mailto:hello@example.test','#part','/assets/images/photo.jpg'])assert.equal(B.safeUrl(value),value);
  for(const value of ['https://tracker.example.test/photo.jpg','http://cdn.sanity.io/images/x','https://static.wixstatic.com.evil.test/media/x.jpg','https://cdn.sanity.io/images/old.jpg','assets/images/../../private.json','assets/images/%2e%2e/private.json','assets/images/%5csecret.jpg'])assert.equal(B.imageUrl({url:value}),'',value);
  assert.equal(B.imageUrl({url:'assets/images/home/brain-poster.jpg'}),'assets/images/home/brain-poster.jpg');
  assert.equal(B.imageUrl({url:'https://static.wixstatic.com/media/test~mv2.jpg'}),'https://static.wixstatic.com/media/test~mv2.jpg');
  const block={_type:'block',markDefs:[{_key:'link',_type:'link',href:'javascript:alert(1)'}],children:[{_type:'span',text:'Article',marks:['link']}]};
  assert.equal(B.bodyHtml([block]).html,'<p>Article</p>');
  block.markDefs[0].href='https://example.test/';block.markDefs[0].openInNewTab=true;
  assert.ok(B.bodyHtml([block]).html.includes('rel="noopener noreferrer"'));
});

test('rich-text tag allowlists ignore inherited object keys',()=>{
  for(const key of ['constructor','__proto__','toString']){
    assert.equal(B.bodyHtml([{_type:'block',style:key,children:[{_type:'span',text:'Text',marks:[key]}]}]).html,'<p>Text</p>');
  }
});

test('article query parameters cannot change the query or escape the generated path',()=>{
  for(const value of ['../private','%2e%2e/private','article/../../private',['article'],null])assert.equal(B.validSlug(value),false);
  assert.equal(B.articleHref({slug:{current:'x\"] | *[_type == \"secret\"'}}),'#');
});

test('static metadata preserves literal dollar replacement text and contains inert JSON-LD',()=>{
  const post={...sample,title:'Literal $& $` $\' title',seo:{description:payload}};
  const html=Blog.page(post,[]);
  assert.ok(html.includes('<title>'+B.esc(post.title)+' | Wissen Technology</title>'));
  assert.equal((html.match(/<main\b/g)||[]).length,1);
  const json=html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
  assert.ok(!json.includes('</script>'));
  assert.equal(JSON.parse(json).headline,post.title);
});

test('public output only accepts recognized media and rejects unexpected files',()=>{
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'wissen-assets-security-'));
  try{
    fs.mkdirSync(path.join(temp,'assets/images'),{recursive:true});
    fs.writeFileSync(path.join(temp,'assets/images/photo.webp'),'fixture');
    assert.equal(publicAssets(temp).length,1);
    for(const name of ['.env','private.json','active.html']){
      const file=path.join(temp,'assets/images',name);fs.writeFileSync(file,'synthetic-private-marker');
      assert.throws(()=>publicAssets(temp),/Unexpected public asset file/);
      fs.unlinkSync(file);
    }
  }finally{
    assert.ok(path.resolve(temp).startsWith(path.resolve(os.tmpdir())+path.sep)&&path.basename(temp).startsWith('wissen-assets-security-'));
    fs.rmSync(temp,{recursive:true,force:true});
  }
});

test('deployment policy blocks scripts, frames and form posts outside the approved design',()=>{
  const config=require('../vercel.json');
  const headers=Object.fromEntries(config.headers.find(h=>h.source==='/(.*)').headers.map(h=>[h.key,h.value]));
  const policy=headers['Content-Security-Policy'];
  for(const rule of ["default-src 'none'","script-src 'self'","script-src-attr 'none'","base-uri 'none'","object-src 'none'","frame-ancestors 'none'","form-action 'none'"])assert.ok(policy.split('; ').includes(rule),rule);
  assert.ok(!policy.includes("'unsafe-eval'"));
  assert.ok(!policy.match(/script-src[^;]*unsafe-inline/));
  assert.equal(headers['X-Frame-Options'],'DENY');
  assert.ok(policy.split('; ').includes("connect-src 'self'"));
  assert.ok(policy.split('; ').includes("img-src 'self' data: https://static.wixstatic.com"));
  const form=fs.readFileSync(path.join(__dirname,'../Contact-Us.html'),'utf8').match(/<form\b[^>]*>/)[0];
  assert.ok(form.includes('method="post"'));
});

test('browser reads only the same-origin published index without sending Wix credentials',async()=>{
  const requests=[];
  const context={document:{documentElement:{dataset:{wissenRoot:'../../'}}},AbortSignal,fetch:async(url,options)=>{
    requests.push({url,options});
    return {ok:true,json:async()=>[]};
  }};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/blog/content.js'),'utf8'),context);
  await context.WissenBlog.fetchIndex();
  assert.equal(requests[0].url,'../../src/blog/index.json');
  assert.equal(requests[0].options.method,'GET');
  assert.equal(requests[0].options.credentials,'same-origin');
  assert.equal(requests[0].options.redirect,'error');
  assert.equal(requests[0].options.headers,undefined);
  for(const file of ['src/blog/content.js','src/scripts/home-blog-cms.js','src/scripts/insights-cms.js','src/scripts/blog-page.js']){
    assert.doesNotMatch(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),/WIX_API_KEY|wixapis\.com|sanity\.io/);
  }
});

test('inactive form is disabled in HTML and cannot send, store or read entered values',()=>{
  const html=fs.readFileSync(path.join(__dirname,'../Contact-Us.html'),'utf8');
  const markup=html.match(/<form\b[^>]*id="contact-form"[^>]*>[\s\S]*?<\/form>/)[0];
  assert.ok(markup.includes('data-form-mode="disabled"'));
  assert.ok(!/\baction\s*=/i.test(markup));
  const fields=markup.match(/<(?:input|textarea|select|button)\b[^>]*>/g);
  assert.ok(fields.length>0);
  for(const field of fields)assert.ok(/\bdisabled\b/.test(field),field);
  let initialize,submit,prevented=0;
  const controls=fields.map(()=>({disabled:false,get value(){throw Error('Form must not read personal data while disabled');}}));
  const status={textContent:''},form={querySelectorAll:()=>controls,addEventListener:(event,fn)=>{assert.equal(event,'submit');submit=fn;}};
  const forbidden=()=>{throw Error('Disabled form attempted an external side effect');};
  const context={document:{addEventListener:(event,fn)=>initialize=fn,querySelector:selector=>selector==='#contact-form'?form:status},fetch:forbidden,FormData:forbidden,localStorage:{setItem:forbidden},sessionStorage:{setItem:forbidden},navigator:{sendBeacon:forbidden},location:{assign:forbidden}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/scripts/contact-us.js'),'utf8'),context);
  initialize();
  assert.ok(controls.every(c=>c.disabled));
  // Re-enabling a control manually must not activate the transport.
  controls.forEach(c=>c.disabled=false);
  submit({preventDefault:()=>prevented++});
  assert.equal(prevented,1);
  assert.match(status.textContent,/unavailable/i);
  assert.ok(!/complete|sent|success/i.test(status.textContent));
});

test('public configuration has no credential fields',()=>{
  const config=require('../src/blog/config.json');
  assert.ok(!Object.keys(config).some(key=>/token|secret|password|api.?key/i.test(key)));
});
