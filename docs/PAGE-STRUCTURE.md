# Website page structure

The source folders follow the navbar hierarchy. Top-level navigation pages sit beside `index.html`. Service, industry and accelerator pages remain in their corresponding folders.

| Navbar item | Source page or folder |
| --- | --- |
| Home | `index.html` |
| About Us | `About-Us.html` |
| Insights | `Insights.html` |
| Careers | `Career.html` |
| Contact Us / Let's talk | `Contact-Us.html` |
| Services | `services/` |
| Industries | `industries/` |
| Accelerators | `accelerators/` |
| Blog article template | `insights/Blog.html` |
| Generated published articles | `blogs/<slug>/index.html` |

## Documentation and configuration

The root README stays at the root. Supporting guides live in `docs/`; `sanity/README.md` stays with its CMS sources. Required JSON configuration and preview data remain in their existing functional locations. Generated pages and preview files are excluded from Git.

## Links and local previews

Page navigation, media URLs and shared assets use page-relative paths, so source pages can still be opened locally or served from a hosting subdirectory. CMS content requires an HTTP server and access to Sanity.

Each page declares `data-wissen-root` on its HTML element. This tells the live CMS scripts where to load the public configuration and how to resolve dynamically rendered links and local images. The global stylesheet continues to resolve its own media URLs relative to `css/`.

The shared footer source stores paths relative to the site root. `build_site.py` converts these to the correct relative paths for each destination page. `src/site-manifest.json` selects the active pages and their modules. `scripts/site-paths.cjs` rebases blog templates, archive cards and article pages for the production export.

## Old URL compatibility

`src/page-routes.json` records canonical page locations. Entries whose source and destination are identical are directly served root pages; they must never redirect to themselves. Matching permanent redirects in `vercel.json` remain for earlier service, industry, accelerator and blog-template URLs.

The former `company/About-Us.html`, `company/Career.html`, `company/Contact-Us.html` and `insights/Insights.html` locations are recorded in `src/legacy-page-aliases.json`. The static build generates rebased compatibility pages for those paths. The root pages remain the editable source of truth, and compatibility pages are excluded from the sitemap and point their canonical URLs to the root pages.

Compatibility pages are served instead of reversing the previous permanent redirects: a browser may still have a cached root-to-folder redirect, and a reverse redirect would create a loop. Compatibility output keeps both older bookmarks and assets working across hosts while new navigation uses the root URLs.

When moving to another host, upload the complete `dist/` directory, including compatibility pages, and recreate the remaining server redirects in that host's configuration. Generated article URLs stay at `blogs/<slug>/`.

## Checks

Run `npm run build:assets` after source changes, then `npm run check`. The checks cover source references and filename casing, live-renderer paths at different page depths, old-URL redirect mappings and a complete offline fixture export with nested article links and a sitemap. Fixture output is isolated in a temporary folder and is not deployable release output.

`npm run build` still fetches actual published Sanity posts. It requires network access and stops if the query fails. Run `python scripts/check-site.py --dist` after a successful production build to inspect its HTML and CSS references.

## Recovery

`Bin/cleanup-2026-11-05/before-page-tree/` contains the pre-move pages and affected build sources for local recovery. It is excluded from Git and deployment.
