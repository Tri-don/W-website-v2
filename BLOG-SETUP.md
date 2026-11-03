# Wissen Dark blog

The existing HTML, CSS and JavaScript website stays in place. The article layout uses the same `css/site.css` and `js/site.js` bundles as the rest of Wissen Dark, including its current navigation, footer, local fonts and shared typography.

## Review the template

- V3 now ends with a Related articles section directly before the footer: up to three image cards and an Explore all insights link. The review preview uses non-clickable, labelled sample cards from `src/blog/related-preview.json`; the live template uses other published Sanity articles and links to their v3 article pages. When no other published articles are available, the live section is omitted. Editors can select related posts in Sanity; published, dated selections appear first, followed by recent articles to fill up to three cards. The current fallback is recency, not category similarity.
- Open `Blog-v3-preview.html` for the third header design: the title sits over a wide, shaded cover image, with the excerpt and optional author details beneath it. The main content remains left and the contents menu right. V1 and v2 remain available for comparison.
- `Blog-v3.html` is the live Sanity entry point for v3 and accepts the same slug parameter. V3 includes LinkedIn, X, WhatsApp, email and copy-link controls at both ends of the article, native device sharing where available, print styling and a back-to-top link. Social controls in a local or illustrative preview explain that sharing needs a published article URL; copying the preview link and printing remain available. Copying has a selectable-link fallback when clipboard access is unavailable. Sharing opens a composer or mail application for the reader to complete.
- Open `Blog-v2-preview.html` to compare the second design: title and introduction beside the cover image, author/sharing row below, article on the left and sticky contents menu on the right. On small screens the image moves below the title and the contents menu above the article.
- `Blog-v2.html` is the live Sanity entry point for this alternative. It accepts the same `?slug=your-article-slug` parameter. V1 remains the default template for production article exports.
- Open `Blog-preview.html` for an immediately available layout preview. It contains clearly labelled illustrative copy and an existing Wissen Dark image. It never fetches from or publishes to Sanity.
- Serve this folder over HTTP and open `Blog.html` for the live Sanity template. Without a slug it displays the latest published article. `Blog.html?slug=your-article-slug` displays a specific article.
- The Insights hero links to the live template. Existing editorial cards and external articles have been retained.

The article layout includes a cover image, categories, publish date, estimated reading time, optional author details, a contents menu, reading progress, share/copy actions and up to three further articles. Rich text supports paragraphs, headings, quotations, nested lists, links, images and code blocks. CMS text is escaped and link protocols are filtered before rendering.

No browser or visual review was performed for this continuation, as requested.

## Connect the editorial workspace

The template is configured for project `zu6gxemo`, public dataset `production`, and document type `blogPost` in `src/blog/config.json`. On 3 November 2026 the blog schema was deployed to the default workspace, and an editing Studio was created at https://wissen-blogs-zu6gxemo.sanity.studio/. The deployed types are Blog post, Blog author and Blog category. No articles or authors were created or published as part of schema setup.

The current declarative model is saved in `sanity/schemaTypes/blog-model.json`, with the deployed declaration in `sanity/schema.mcp.txt` and deployment address in `sanity/deployment.json`. `sanity/schemaTypes/blog.js` is a local Studio adapter for a future migration; the active Studio is MCP-managed. Do not create a competing CLI deployment for the same workspace. See `sanity/README.md` for editing instructions.

Drafts are excluded. A post needs a title, lowercase hyphenated slug, excerpt, publication date and body. Dates in the future are excluded until that date passes; generated pages require another build afterward. Authors, categories and cover images are optional. Provide image alternative text when an image is supplied. The managed schema contains declarative field definitions and built-in type validation; the stronger function-based validations in the future local Studio adapter are not applied to the active managed Studio. The website filters missing publication dates and the static generator rejects missing titles, invalid or duplicate slugs and empty bodies.

For the live browser template, allow the actual development/production origin in Sanity's CORS settings if needed. Use exact origins and leave credential access disabled for this public, read-only integration. Do not put a write token in public website files. If the dataset becomes private, use an authenticated server/build integration instead of the browser fetch.

## Generate individual article pages

Use Node.js 20 or newer. No npm installation is needed for the website's blog renderer or generator.

Run these commands from the Wissen Dark directory:

```powershell
python build_site.py
node build_blogs.cjs --preview-only
```

The first command rebuilds the shared website assets. The second regenerates only the illustrative review page and makes no Sanity request.

To regenerate the second design's preview:

```powershell
node build_blogs.cjs --preview-only --v2
```

V2 uses `src/styles/blog-page-v2.css` and the renderer's `v2` variant. Its styles and live entry point are separate from v1, while the content model, queries and reading controls are shared. Both preview pages use the same illustrative article for comparison.

To regenerate v3:

```powershell
node build_blogs.cjs --preview-only --v3
```

V3 inherits v2's reading arrangement and adds `src/styles/blog-page-v3.css`. Its image/header and expanded sharing controls are selected by the renderer's `v3` variant. The production article generator still defaults to v1 until a final design is selected. The preview uses the same existing website image and illustrative article as the earlier versions.

After articles are published, set `siteUrl` in `src/blog/config.json` to the final public site root, including any hosting subdirectory, then run:

```powershell
node build_blogs.cjs
```

That command queries published articles and generates complete pages at `blogs/<slug>/index.html`, with per-article titles, descriptions, Open Graph metadata and BlogPosting structured data. Canonical URLs are included once `siteUrl` is configured. Navigation and asset paths are rebased for the nested folders. Generated article text remains available with JavaScript disabled. The browser template and illustrative preview stay excluded from search indexing.

The generator records the pages it owns in `src/blog/generated-pages.json`. Later builds remove previously generated article files for deleted, unpublished or changed slugs. Keep this manifest between builds. A slug change creates a new URL; redirects for existing links require separate hosting configuration. Publishing a future date is not an automatic scheduled build.

## Publishing status

The schema and editing Studio are deployed in Sanity; the website template and generator are implemented locally. Automatic publication to Hostinger or another host is not configured. That later step must connect a secured Sanity webhook to a build/deployment workflow that runs the generator and publishes its output. Until that exists, generating article files and uploading a complete release are manual steps. The live `Blog.html` view reads published content directly and does not generate hosted files.

The existing Insights cards have not been converted into a Sanity-managed archive, and the website sitemap has not been changed. Those are separate from the article template delivered here.

## New editorial fields

Tags appear as topic chips below the article. Image captions and credits appear with their images. Hand-picked related posts take priority over the recent-article fallback; drafts, future-dated posts, the current article and duplicates are excluded. Reading time, heading-based navigation and the updated timestamp are derived automatically.

The static generator uses the optional social sharing image, SEO title/description and no-index flag. Defaults are the cover image, article title and introduction. No-index does not make an article private. The featured flag is saved for future listing integration; it does not currently reorder the existing Insights page.

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
