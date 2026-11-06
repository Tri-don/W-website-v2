# Website page structure

The homepage remains `index.html`. All other active HTML pages are grouped by purpose. Filenames and capitalization are retained inside their new folders.

All paths below are relative to the website root.

| Former root path | Current path |
| --- | --- |
| `About-Us.html` | `company/About-Us.html` |
| `Application-Development.html` | `services/Application-Development.html` |
| `Autonomous-Operations.html` | `accelerators/Autonomous-Operations.html` |
| `Blog.html` | `insights/Blog.html` |
| `Capital-Markets-Technology.html` | `industries/bfsi/Capital-Markets-Technology.html` |
| `Career.html` | `company/Career.html` |
| `Contact-Us.html` | `company/Contact-Us.html` |
| `Industries-BFSI.html` | `industries/bfsi/Industries-BFSI.html` |
| `Insights.html` | `insights/Insights.html` |
| `Responsible-Privacy-Preserving-Financial-AI.html` | `industries/bfsi/Responsible-Privacy-Preserving-Financial-AI.html` |
| `Risk-Regulatory-Compliance-Engineering.html` | `industries/bfsi/Risk-Regulatory-Compliance-Engineering.html` |
| `Services-Ai-ML.html` | `services/Services-Ai-ML.html` |
| `Wealth-Asset-Management-Data-Infrastructure.html` | `industries/bfsi/Wealth-Asset-Management-Data-Infrastructure.html` |

## Documentation and configuration

The root README stays at the root. Supporting guides live in `docs/`; `sanity/README.md` stays with its CMS sources. Required JSON configuration and preview data remain in their existing functional locations. Generated pages and preview files are excluded from Git.

## Links and local previews

Page navigation, media URLs and shared assets use page-relative paths, so source pages can still be opened locally or served from a hosting subdirectory. CMS content requires an HTTP server and access to Sanity.

Each page declares `data-wissen-root` on its HTML element. This tells the live CMS scripts where to load the public configuration and how to resolve dynamically rendered links and local images. The global stylesheet continues to resolve its own media URLs relative to `css/`.

The shared footer source stores paths relative to the site root. `build_site.py` converts these to the correct relative paths for each destination page. `src/site-manifest.json` selects the active pages and their modules. `scripts/site-paths.cjs` rebases blog templates, archive cards and article pages for the production export.

## Old URL redirects

`src/page-routes.json` records the old-to-new mapping. Matching permanent redirects are configured in root `vercel.json`; the checks ensure they stay consistent with the actual files. Redirects take effect only after deployment. No root HTML compatibility copies are kept.

When moving to another host, recreate those redirects in that host's server configuration. Uploading only `dist/` will serve the new paths but does not install Vercel redirects on another server. Keep the generated article URLs at `blogs/<slug>/` unchanged.

## Checks

Run `npm run build:assets` after source changes, then `npm run check`. The checks cover source references and filename casing, live-renderer paths at different page depths, old-URL redirect mappings and a complete offline fixture export with nested article links and a sitemap. Fixture output is isolated in a temporary folder and is not deployable release output.

`npm run build` still fetches actual published Sanity posts. It requires network access and stops if the query fails. Run `python scripts/check-site.py --dist` after a successful production build to inspect its HTML and CSS references.

## Recovery

`Bin/cleanup-2026-11-05/before-page-tree/` contains the pre-move pages and affected build sources for local recovery. It is excluded from Git and deployment.
