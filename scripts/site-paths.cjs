/* Resolve local HTML references when a page is rendered at a different depth. */
'use strict';
const path=require('node:path').posix;
const routes=require('../src/page-routes.json');
const BLOG=routes['Blog.html'], INSIGHTS=routes['Insights.html'];
function rebaseUrl(value,fromFile,toFile){
  if(!value||/^(?:[a-z][a-z0-9+.-]*:|\/|#|\?)/i.test(value))return value;
  const [,pathname,suffix]=/^([^?#]*)(.*)$/s.exec(value);
  const absolute=path.normalize(path.join(path.dirname(fromFile),pathname));
  let relative=path.relative(path.dirname(toFile),absolute);
  if(pathname.endsWith('/')&&relative&&!relative.endsWith('/'))relative+='/';
  return (relative||'./')+suffix;
}
function rebaseHtml(html,fromFile,toFile){
  const prefix=path.relative(path.dirname(toFile),'.');
  html=html.replace(/data-wissen-root="[^"]*"/,`data-wissen-root="${prefix?prefix+'/':''}"`);
  html=html.replace(/\b(href|src|poster|action)=(['"])(.*?)\2/g,
    (_,attr,quote,value)=>`${attr}=${quote}${rebaseUrl(value,fromFile,toFile)}${quote}`);
  return html.replace(/url\(\s*(['"]?)([^)'"]+)\1\s*\)/g,
    (_,quote,value)=>`url(${quote}${rebaseUrl(value,fromFile,toFile)}${quote})`);
}
function normalize(html,file){
  return html.replace(/\bhref="([^"?#]+)"/g,(match,value)=>{
    if(/^(?:[a-z][a-z0-9+.-]*:|\/|#)/i.test(value))return match;
    const target=path.normalize(path.join(path.dirname(file),value));
    return target===BLOG?`href="${rebaseUrl('blogs/','index.html',file)}"`:match;
  });
}
module.exports={BLOG,INSIGHTS,rebaseUrl,rebaseHtml,normalize};
