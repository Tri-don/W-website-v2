'use strict';

const collection = 'WissenBlogs';
const queryUrl = 'https://www.wixapis.com/wix-data/v2/items/query';
const {validSlug} = require('./content.js');

function text(value) {
  return typeof value === 'string' ? value : '';
}

function strings(values) {
  return Array.isArray(values) ? values.filter(value => typeof value === 'string' && value.trim()) : [];
}

function wixImage(value, alt, caption, credit) {
  const input = text(value);
  if (!input) return undefined;
  const id = /^wix:image:\/\/v1\/([\w.~%-]+)(?:\/|$)/.exec(input)?.[1];
  const url = id ? `https://static.wixstatic.com/media/${id}` : input;
  return {url, alt: text(alt), caption: text(caption), credit: text(credit)};
}

function richBlocks(document) {
  const blocks = [];
  const marks = {BOLD:'strong', ITALIC:'em', UNDERLINE:'underline', STRIKETHROUGH:'strike-through', CODE:'code'};
  function block(nodes, style, listItem, level) {
    const markDefs = [];
    const children = nodes.map(node => {
      if (node.type !== 'TEXT') throw new Error(`Unsupported Wix inline node ${node.type}`);
      const decorations = [];
      for (const decoration of node.textData?.decorations || []) {
        const link = decoration.linkData?.link;
        if (decoration.type === 'LINK' && link?.url) {
          const key = `link-${markDefs.length}`;
          markDefs.push({_key:key, _type:'link', href:link.url, openInNewTab:link.target === 'BLANK'});
          decorations.push(key);
        } else if (Object.hasOwn(marks, decoration.type)) decorations.push(marks[decoration.type]);
      }
      return {_type:'span', text:text(node.textData?.text), marks:decorations};
    });
    blocks.push({_type:'block', style, children, markDefs, ...(listItem ? {listItem, level} : {})});
  }
  function visit(node, listItem, level = 0) {
    const children = node.nodes || [];
    switch (node.type) {
      case 'PARAGRAPH': return block(children, 'normal', listItem, level);
      case 'HEADING': return block(children, `h${Math.max(2, Math.min(4, Number(node.headingData?.level) || 2))}`, listItem, level);
      case 'BLOCKQUOTE':
        if (children.every(child => child.type === 'TEXT')) return block(children, 'blockquote');
        for (const child of children) block(child.nodes || [], 'blockquote');
        return;
      case 'BULLETED_LIST':
      case 'ORDERED_LIST':
        for (const child of children) visit(child, node.type === 'ORDERED_LIST' ? 'number' : 'bullet', level + 1);
        return;
      case 'LIST_ITEM':
        for (const child of children) visit(child, listItem, level);
        return;
      case 'CODE_BLOCK':
        blocks.push({_type:'codeBlock', code:children.map(child => text(child.textData?.text)).join('')});
        return;
      case 'IMAGE': {
        const image = node.imageData;
        const id = text(image?.image?.src?.id);
        const source = image?.image?.src?.url || (id ? `wix:image://v1/${id}` : '');
        const value = wixImage(source, image?.altText, image?.caption);
        if (value) blocks.push({_type:'image', ...value});
        return;
      }
      default: throw new Error(`Unsupported Wix article node ${node.type}`);
    }
  }
  for (const node of document?.nodes || []) visit(node);
  return blocks;
}

function date(value) {
  const raw = typeof value === 'string' ? value : text(value?.$date);
  const time = Date.parse(raw);
  return Number.isFinite(time) ? new Date(time).toISOString() : '';
}

function normalizePosts(items, authors, now = Date.now()) {
  const authorsById = new Map(authors.map(item => [item.id, item.data]));
  const posts = [];
  for (const {id, data} of items) {
    const publishedAt = date(data.publishedAt);
    if (Date.parse(publishedAt) > now) continue;
    const slug = text(data.slug).trim();
    if (!id || !validSlug(slug) || !text(data.title).trim() || !publishedAt) {
      throw new Error(`Set title, a lowercase URL slug and publication date on Wix item ${id}.`);
    }
    let body;
    try { body = richBlocks(data.body); }
    catch (error) { throw new Error(`Wix article ${slug}: ${error.message}`); }
    if (!body.some(block => block.children?.some(child => child.text.trim()) || block.code?.trim() || block.url)) {
      throw new Error(`Add article content before publishing Wix item ${slug}.`);
    }
    const author = authorsById.get(data.author);
    const categoryNames = strings(data.categoryIds?.map(category => category.title));
    posts.push({
      _id:id, _updatedAt:date(data._updatedDate), title:text(data.title), slug:{current:slug}, publishedAt,
      excerpt:text(data.excerpt), featured:data.featured === true, tags:strings(data.tags),
      industries:strings(data.industries), services:strings(data.services), body,
      categories:(categoryNames.length ? categoryNames : strings(data.categories)).map(title => ({title})),
      mainImage:wixImage(data.coverImage, data.coverAlt, data.coverCaption, data.coverCredit),
      author:author ? {name:text(author.title), role:text(author.role), bio:text(author.bio), image:wixImage(author.photo, author.photoAlt, author.photoCaption, author.photoCredit)} : undefined,
      seo:{title:text(data.seoTitle), description:text(data.seoDescription), noIndex:data.seoNoIndex === true, image:wixImage(data.seoImage)},
      relatedSlugs:strings(data.relatedSlugs)
    });
  }
  const bySlug = new Map(posts.map(post => [post.slug.current, post]));
  for (const post of posts) {
    post.relatedArticles = post.relatedSlugs.map(slug => bySlug.get(slug)).filter(Boolean);
  }
  return posts.sort((a,b) => b.publishedAt.localeCompare(a.publishedAt) || a._id.localeCompare(b._id));
}

async function fetchPublished() {
  const key = process.env.WIX_API_KEY?.trim();
  const siteId = process.env.WIX_SITE_ID?.trim();
  if (!key || !siteId) throw new Error('Set the build environment variables WIX_API_KEY and WIX_SITE_ID to read Wix CMS.');

  async function queryItems(dataCollectionId, includeReferencedItems) {
    const all = [];
    const limit = 50;
    for (let offset = 0;; offset += limit) {
      const query = {paging:{limit,offset}, sort:[{fieldName:'_id',order:'ASC'}]};
      const res = await fetch(queryUrl, {
        method:'POST', redirect:'error', signal:AbortSignal.timeout(30000),
        headers:{Authorization:key, 'wix-site-id':siteId, 'Content-Type':'application/json'},
        body:JSON.stringify({dataCollectionId, query, consistentRead:true, includeReferencedItems})
      });
      if (!res.ok) throw new Error(`Wix CMS query for ${dataCollectionId} failed (HTTP ${res.status}).`);
      const {dataItems = []} = await res.json();
      if (!Array.isArray(dataItems) || dataItems.some(item => !item.id || !item.data)) {
        throw new Error(`Invalid Wix CMS response for ${dataCollectionId}.`);
      }
      all.push(...dataItems);
      if (dataItems.length < limit) return all;
    }
  }

  const data = await Promise.all([
    // Wix stores pending edits separately. Read the published collection only.
    queryItems(collection, ['categoryIds']),
    queryItems('WissenBlogAuthors')
  ]);
  return normalizePosts(...data);
}

module.exports = {fetchPublished, normalizePosts};
