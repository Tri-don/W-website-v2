# Wissen Technology — Dark website

Static website with 18 active HTML pages, shared CSS/JavaScript and Sanity blog integration. Open `index.html` for a local layout preview; use an HTTP server for CMS-powered features.

## Project structure

| Location | Purpose |
| --- | --- |
| `index.html` | Homepage |
| `services/` | Application Development, AI/ML, Agentic Data Platforms, Intelligent Automation, Cloud and Experience Design |
| `industries/bfsi/` | BFSI overview and its four subpages |
| `accelerators/` | Autonomous Operations |
| `company/` | About Us, Careers and Contact |
| `insights/` | Insights landing page and live blog template |
| `docs/` | Setup guides, design history and page migration notes |
| `assets/images/home/` | Homepage-specific images |
| `assets/images/services/` | Broad service illustrations |
| `assets/images/service-application-development/` | Application Development page |
| `assets/images/service-ai-ml/` | AI/ML page |
| `assets/images/industries/` | Industry imagery shared across pages |
| `assets/images/insights/` | Editorial imagery and publication logos |
| `assets/images/success-stories/` | Success story images |
| `assets/images/about-us/` | Leadership, events, culture and certifications |
| `assets/images/careers/` | Career page imagery and icons |
| `assets/images/shared/` | Brand, partner logos and reusable shapes |
| `assets/videos/home/` | Homepage video loops |
| `assets/videos/industry-bfsi/` | BFSI hero video |
| `assets/videos/service-ai-ml/` | AI/ML hero video |
| `assets/fonts/` | Local fonts |
| `src/styles/`, `src/scripts/` | Editable CSS and JavaScript modules |
| `src/partials/` | Shared HTML, including footer |
| `src/site-manifest.json` | Active pages and their module selection |
| `src/page-routes.json` | Old root filenames mapped to their current paths |
| `css/site.css`, `js/site.js` | Generated global bundles loaded by pages |
| `sanity/`, `src/blog/` | CMS schemas, configuration and article templates |
| `scripts/`, `tests/` | Production build and checks |
| `Bin/cleanup-2026-11-05/` | Recoverable local archive; excluded from Git and deployment |

Shared assets live in one broad-use folder rather than being duplicated for every page. Create a new page-specific media folder when adding assets unique to that page.

## Editing

Edit the source modules, then run `npm run build:assets` (or `python build_site.py`) to regenerate the global bundles and shared footers. Do not edit generated bundles directly.

- Shared typography, spacing and background: `src/styles/global-system.css`.
- Shared footer: `src/partials/footer.html` and `src/styles/footer.css`.
- Component behavior and appearance: the relevant module in `src/scripts/` or `src/styles/`.
- Preserve HTML `data-wissen-type` roles and `data-wissen-root` metadata used by the build and CMS renderer. The root value is empty on the homepage, `../` one folder down, and `../../` two folders down.
- Register new pages and modules in `src/site-manifest.json`.

The existing shared bundle structure is retained. Page guards preserve component styling and script timing across different templates.

## Validation and production build

- `npm run check`: local references, Linux filename casing, JavaScript syntax, CMS card behavior, redirects and a complete static export with local fixture content. The fixture export runs in a temporary folder without contacting Sanity.
- `npm run build:assets`: rebuild shared local assets without fetching CMS content.
- `npm run build`: fetch published Sanity posts and build portable output in `dist/`; requires CMS network access and Python 3.

Hosting can serve the generated `dist/` folder. See [BLOG-SETUP.md](docs/BLOG-SETUP.md), [SANITY-PUBLISHING.md](docs/SANITY-PUBLISHING.md) and [VERCEL-SETUP.md](docs/VERCEL-SETUP.md) for CMS and deployment configuration. The contact form retains its placeholder submission behavior.

See [PAGE-STRUCTURE.md](docs/PAGE-STRUCTURE.md) for all moved pages and old-URL redirects.

See [SECURITY-REVIEW.md](docs/SECURITY-REVIEW.md) for security changes, the deployment header policy, automated coverage and checks that still require live access. The export rejects unexpected media files and symlinks; generated bundles are copied explicitly.

The contact form is deliberately disabled until a protected backend is configured. See [FORM-INTEGRATION.md](docs/FORM-INTEGRATION.md) for the required server-to-server delivery boundary and release checks. Public browser CMS requests use credential-free CDN reads. The generated public configuration lists exported article slugs so live cards preserve their stable static article URLs.

## Git and archive policy

Commit the active HTML, source modules, generated shared bundles, active assets, configuration and lockfile together. Keep `Bin/`, `dist/`, dependencies, caches, logs and environment secrets out of Git. `.gitignore`, `.vercelignore` and `.gitattributes` define these policies and text line endings.

The archive contains preview/comparison pages, superseded modules, unused media and prior generated output. `asset-moves.json` inside the archive records original paths, destinations and SHA-256 hashes. Archived pages are historical references and may need their module entries and relative paths restored before running them.

No commit or push is performed by the cleanup. Review with `git status --short` and `git diff` before committing.
