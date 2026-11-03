# Wissen Dark blog

The existing HTML, CSS and JavaScript website stays in place. The article layout uses the same `css/site.css` and `js/site.js` bundles as the rest of Wissen Dark, including its current navigation, footer, local fonts and shared typography.

## Review the template

`Blog.html` is the selected v3 article layout and live Sanity entry point. Open `Blog.html?slug=your-article-slug` over HTTP for a specific published article, or omit the slug for the latest post. `Blog-preview.html` is the illustrative review page. Generated article pages use the same v3 layout.

## Insights Blogs tab

The Blogs tab in `Insights.html` is sourced exclusively from published Sanity `blogPost` documents. It shows the cover image, category, title, excerpt and publication date, newest first. Drafts and future-dated articles are excluded. The hero slider also uses the newest three Sanity posts. Other Insights tabs remain separately managed.

`src/scripts/insights-cms.js` queries the public API without credentials when the Blogs tab opens, with 12 articles per page and a Load more button. Returning to the tab or browser window refreshes content after one minute. Live card links use `Blog.html?slug=...`, so newly published posts can open before a static deployment completes. A page already open is refreshed on return or reload; this is not a continuous subscription.

`npm run build` also renders the first 12 Sanity cards into the deployed HTML, replacing the snapshot on each build. The snapshot remains available if the live request fails or JavaScript is disabled. Static article pages, metadata and the sitemap still require a rebuild after editorial changes. Exact website origins must be allowed in Sanity CORS with credential access disabled. Never add a browser token.

The article layout includes a cover image, categories, publish date, estimated reading time, optional author details, a contents menu, reading progress, share/copy actions and up to three further articles. Rich text supports paragraphs, headings, quotations, nested lists, links, images and code blocks. CMS text is escaped and link protocols are filtered before rendering.

No browser or visual review was performed for this continuation, as requested.

## Connect the editorial workspace

The template is configured for project `zu6gxemo`, public dataset `production`, and document type `blogPost` in `src/blog/config.json`. On 3 November 2026 the blog schema was deployed to the default workspace, and an editing Studio was created at https://wissen-blogs-zu6gxemo.sanity.studio/. The deployed types are Blog post, Blog author and Blog category. Three labelled demo articles and their author/categories were subsequently published for integration.

The current declarative model is saved in `sanity/schemaTypes/blog-model.json`, with the deployed declaration in `sanity/schema.mcp.txt` and deployment address in `sanity/deployment.json`. `sanity/schemaTypes/blog.js` is a local Studio adapter for a future migration; the active Studio is MCP-managed. Do not create a competing CLI deployment for the same workspace. See `sanity/README.md` for editing instructions.

Drafts are excluded. A post needs a title, lowercase hyphenated slug, excerpt and body. When the publication date is blank, the website uses the document creation date. Explicit dates in the future are excluded until that date passes; generated pages require another build afterward. Authors, categories and cover images are optional. Provide image alternative text when an image is supplied. The managed schema contains declarative field definitions and built-in type validation; the stronger function-based validations in the future local Studio adapter are not applied to the active managed Studio. The static generator rejects missing titles, invalid or duplicate slugs and empty bodies.

For the live browser template, allow the actual development/production origin in Sanity's CORS settings if needed. Use exact origins and leave credential access disabled for this public, read-only integration. Do not put a write token in public website files. If the dataset becomes private, use an authenticated server/build integration instead of the browser fetch.

## Generate individual article pages

Use Node.js 20 or newer. No npm installation is needed for the website's blog renderer or generator.

Run these commands from the Wissen Dark directory:

```powershell
python build_site.py
node build_blogs.cjs --preview-only
```

The first command rebuilds the shared website assets. The second regenerates only the illustrative review page and makes no Sanity request.

After articles are published, set `siteUrl` in `src/blog/config.json` to the final public site root, including any hosting subdirectory, then run:

```powershell
node build_blogs.cjs
```

That command queries published articles and generates complete pages at `blogs/<slug>/index.html`, with per-article titles, descriptions, Open Graph metadata and BlogPosting structured data. Canonical URLs are included once `siteUrl` is configured. Navigation and asset paths are rebased for the nested folders. Generated article text remains available with JavaScript disabled. The browser template and illustrative preview stay excluded from search indexing.

The generator records the pages it owns in `src/blog/generated-pages.json`. Later builds remove previously generated article files for deleted, unpublished or changed slugs. Keep this manifest between builds. A slug change creates a new URL; redirects for existing links require separate hosting configuration. Publishing a future date is not an automatic scheduled build.

## Publishing status

The site has a portable static build configured for Vercel through GitHub. `npm run build` produces `dist/`, including the Insights snapshot, blog archive and article pages. A Sanity webhook connected to the host's deployment hook is needed to rebuild those static files on publication. The live Blogs tab and `Blog.html` query published content directly and do not depend on that hook. Hostinger deployment is a separate future hosting change.

## New editorial fields

Tags appear as topic chips below the article. Image captions and credits appear with their images. Hand-picked related posts take priority over the recent-article fallback; drafts, future-dated posts, the current article and duplicates are excluded. Reading time, heading-based navigation and the updated timestamp are derived automatically.

The static generator uses the optional social sharing image, SEO title/description and no-index flag. Defaults are the cover image, article title and introduction. No-index does not make an article private. The featured flag does not reorder the Blogs tab; that tab uses publication date.

## Source files

| File | Purpose |
| --- | --- |
| `Blog.html` | Shared page shell and live article entry point |
| `Blog-preview.html` | Generated, illustrative review page |
| `src/blog/content.js` | Shared Portable Text renderer and GROQ queries |
| `src/blog/config.json` | Public project, dataset and site URL settings |
| `src/blog/layout-preview.json` | Local illustrative content |
| `src/scripts/blog-page.js` | Fetching, contents navigation and reading controls |
| `src/styles/blog-page.css` | Blog-specific layout rules |
| `build_blogs.cjs` | Static article export and preview generation |
| `sanity/schemaTypes/blog.js` | Local Studio content model |

Edit source modules, rebuild the shared bundles and regenerate the preview when changing the template. Keep the source and generated website together in the existing Git repository.
