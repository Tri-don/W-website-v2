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
  for(const value of ['https://tracker.example.test/photo.jpg','http://cdn.sanity.io/images/x','https://cdn.sanity.io.evil.test/images/x','assets/images/../../private.json','assets/images/%2e%2e/private.json','assets/images/%5csecret.jpg'])assert.equal(B.imageUrl({url:value}),'',value);
  assert.equal(B.imageUrl({url:'assets/images/home/brain-poster.jpg'}),'assets/images/home/brain-poster.jpg');
  assert.ok(B.imageUrl({url:'https://cdn.sanity.io/images/example/production/image-20x20.jpg'}).startsWith('https://cdn.sanity.io/images/'));
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
  const evil='x"] | *[_type == "secret"';
  const q=B.query(Blog.config,{slug:evil});
  assert.ok(!q.params.query.includes(evil));
  assert.equal(q.params.$slug,JSON.stringify(evil));
  assert.throws(()=>B.endpoint({...Blog.config,projectId:'evil.test/?'}),/Invalid Sanity configuration/);
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
  assert.ok(!policy.includes(new URL(B.endpoint(Blog.config)).origin));
  assert.ok(policy.includes(new URL(B.endpoint(Blog.config,true)).origin));
  const form=fs.readFileSync(path.join(__dirname,'../company/Contact-Us.html'),'utf8').match(/<form\b[^>]*>/)[0];
  assert.ok(form.includes('method="post"'));
});

test('public browser queries use credential-free CDN reads and never mutation endpoints',()=>{
  for(const q of [B.query(Blog.config),B.insightsQuery(Blog.config),H.query(Blog.config)]){
    const url=new URL(q.url);
    assert.equal(url.hostname,Blog.config.projectId+'.apicdn.sanity.io');
    assert.ok(url.pathname.includes('/data/query/'));
    assert.equal(q.params.perspective,'published');
  }
  assert.equal(new URL(B.endpoint(Blog.config)).hostname,Blog.config.projectId+'.api.sanity.io');
  for(const name of ['home-blog-cms.js','insights-cms.js','blog-page.js']){
    const source=fs.readFileSync(path.join(__dirname,'../src/scripts',name),'utf8');
    assert.ok(source.includes("method:'GET'"));
    assert.ok(source.includes("credentials:'omit'"));
    assert.ok(source.includes("redirect:'error'"));
    assert.ok(!/Authorization|Bearer\s|\/data\/mutate\/|method\s*:\s*['"](?:POST|PUT|PATCH|DELETE)/i.test(source));
  }
});

test('inactive form is disabled in HTML and cannot send, store or read entered values',()=>{
  const html=fs.readFileSync(path.join(__dirname,'../company/Contact-Us.html'),'utf8');
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
