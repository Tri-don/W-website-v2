/* Local Studio adapter. The active hosted Studio is MCP-managed. */
import {defineType, defineField, defineArrayMember} from 'sanity';
import {DocumentTextIcon} from '@sanity/icons/DocumentText';
import {UserIcon} from '@sanity/icons/User';
import {TagIcon} from '@sanity/icons/Tag';
import model from './blog-model.json';

const icons={blogPost:DocumentTextIcon,blogAuthor:UserIcon,blogCategory:TagIcon};
const requiredTitles=new Set(['blogPost.title','blogAuthor.name','blogCategory.title']);
function prepare(field,path){
  const out={...field};
  if(field.fields)out.fields=field.fields.map(f=>defineField(prepare(f,path+'.'+f.name)));
  if(field.of)out.of=field.of.map(f=>defineArrayMember(prepare(f,path+'.'+(f.name||f.type))));
  if(field.marks?.annotations)out.marks={...field.marks,annotations:field.marks.annotations.map(f=>defineArrayMember(prepare(f,path+'.'+f.name)))};
  if(requiredTitles.has(path))out.validation=r=>r.required().max(150);
  if(path.endsWith('.alt'))out.validation=r=>r.required();
  if(path==='blogPost.slug')out.validation=r=>r.required().custom(s=>!s?.current||/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s.current)||'Use lowercase words separated by hyphens.');
  if(path==='blogPost.publishedAt')out.validation=r=>r.required();
  if(path==='blogPost.excerpt')out.validation=r=>r.required().max(300);
  if(path==='blogPost.body')out.validation=r=>r.required().min(1);
  if(path==='blogPost.categories'||path==='blogPost.tags'||path==='blogPost.industries'||path==='blogPost.services')out.validation=r=>r.unique();
  if(path==='blogPost.relatedArticles')out.validation=r=>r.unique().max(3);
  if(path==='blogPost.seo.title')out.validation=r=>r.max(70).warning();
  if(path==='blogPost.seo.description')out.validation=r=>r.max(160).warning();
  if(field.name==='href')out.validation=r=>r.required().uri({scheme:['http','https','mailto'],allowRelative:true});
  return out;
}
export const blogSchemaTypes=model.map(type=>defineType({...type,icon:icons[type.name],fields:type.fields.map(f=>defineField(prepare(f,type.name+'.'+f.name))),preview:{select:{title:type.name==='blogAuthor'?'name':'title',...(type.name==='blogPost'?{subtitle:'author.name',media:'mainImage'}:{})}}}));
export const blogPost=blogSchemaTypes.find(t=>t.name==='blogPost');
export const blogAuthor=blogSchemaTypes.find(t=>t.name==='blogAuthor');
export const blogCategory=blogSchemaTypes.find(t=>t.name==='blogCategory');
