# Wissen Dark blog template

## Review

- `Blog-preview.html`: complete design preview with explicitly labelled illustrative copy. It never creates Sanity content and carries `noindex,nofollow`.
- `Blog.html`: live, public read-only Sanity template. With no slug it loads the latest published article and up to three further articles. `Blog.html?slug=your-article` loads a specific article. Empty, missing, failed and timeout states are handled separately. This browser preview is noindex; publish the generated HTML routes for search indexing.
- Shared nav/footer, local fonts, charcoal background, lavender accents and typography come from this website's existing theme. Blog-specific CSS and browser behavior live in `src/styles/blog-page.css` and `src/scripts/blog-page.js`, included by the existing build manifest. `src/blog/content.js` is the shared safe renderer for both browser and static builds.

## Sanity

Public project: `zu6gxemo`; dataset: `production`; type: `blogPost`. Config lives in `src/blog/config.json`. The project and dataset identifiers are public, not credentials. No write token is used by this website. At implementation time the dataset was empty and no schema or Studio was deployed. The content model is in `sanity/schemaTypes/blog.js`; see `sanity/README.md`. It has not been deployed remotely.

## Commands (from Wissen Dark)

```powershell
python build_site.py
node build_blogs.cjs --preview-only
node build_blogs.cjs
python -m http.server 4173 --bind 127.0.0.1
```

Open `http://127.0.0.1:4173/Blog-preview.html` to review the design or `Blog.html` to read published Sanity content. Serve through HTTP rather than file:// for live fetching. The static exporter requires Node 22 or newer; the public website remains plain HTML/CSS/JavaScript.

The exporter reads the uncached Sanity API with the published perspective, paginates, excludes future dates and drafts, rejects duplicate/unsafe slugs and incomplete posts, and validates all HTML before writing pages. It generates `blogs/<slug>/index.html` with complete article HTML, Open Graph tags and BlogPosting structured data. Set `siteUrl` to the final site root, including any hosting subdirectory, in the config for canonical URLs. Shared local paths are rebased for nested routes. Existing pages are retained on fetch/render failure. Pages removed from Sanity are removed only if listed in `src/blog/generated-pages.json`.

Run the shared theme build before exporting blogs after a navigation/footer/theme change. Preview content is intentionally local only; exclude `Blog-preview.html` and `src/blog/layout-preview.json` from a production upload.

## Hosting connection still required

Automatic publishing is not configured by this template. For Hostinger, connect a Sanity published-content webhook to CI, run the shared build and blog exporter, then deploy the static output over an authenticated hosting connection. Keep deployment secrets in CI. Upload the complete website paths required by `Blog.html`, including `src/blog/config.json` and `src/blog/content.js`; exclude Studio source and handoff files if desired. For Vercel, set the same build commands and connect a deploy hook.

Changes to referenced authors/categories also need to trigger the publishing build. Future-dated posts require a later scheduled build or an editor-triggered publish/build; a date field alone does not schedule hosting deployment. Draft preview with authenticated content is a separate feature and must not expose a read token in public JavaScript.
