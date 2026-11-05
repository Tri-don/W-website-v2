# Wissen Technology — Dark website

Static website with shared HTML, CSS and JavaScript, two comparison pages (`About-Us-v2.html` and `index-v2.html`), and a Sanity-ready blog template. Open `index.html` locally or serve the folder with any static web server. The generated assets are included, so viewing and hosting the existing site require no build step or npm installation. The live blog template needs HTTP serving; see `BLOG-SETUP.md` for its content model, preview and article generation steps.

## Shared website files

`SANITY-PUBLISHING.md` describes the Sanity-to-GitHub publishing automation. The GitHub Actions workflow builds a downloadable website artifact; live deployment and its Sanity trigger remain inactive until hosting is configured.

For GitHub-to-Vercel deployment and later Hostinger migration, see `VERCEL-SETUP.md`. `npm run build` rebuilds the shared assets, fetches published Sanity posts and creates the portable `dist` directory. The active article design is v3, now saved as `Blog.html`.

- `css/site.css` — the one stylesheet loaded by every page.
- `js/site.js` — the one script loaded by every page.
- `assets/` — local fonts, images, video and other media.

Keep these paths and filename capitalization intact when copying the site. The holiday graphic/exporter is excluded from this website update; deleted pages have not been restored.

## Editing and rebuilding

- Edit `src/styles/global-system.css` for shared typography, section spacing and backgrounds.
- Edit `src/partials/footer.html` for shared footer content and `src/styles/footer.css` for its appearance.
- Edit the relevant source module in `src/styles/` or `src/scripts/` for other component changes.
- Run `python build_site.py` from this folder to refresh the footer on every page and regenerate both served assets. The build uses Python's standard library.
- `src/site-manifest.json` preserves per-page module selection and script timing. CSS module guards and namespaced animations prevent styles from leaking across templates.
- HTML files contain explicit `data-wissen-type` roles. Keep those roles when editing content. New pages need the manifest/root metadata and the two shared asset links.

Read `DESIGN-CHANGES.md` for the complete design change list and page inventory. The latest rollout includes browser checks; earlier notes saying browser checks were skipped are superseded by this review.

All 15 pages now use compact section spacing (48px desktop / 40px tablet / 32px mobile) and the continuous irregular dark-charcoal gradient formerly previewed on About Us v2. Section boundary dividers are removed; card/control borders and the approved footer policy divider remain. `src/styles/global-system.css` owns the shared appearance. `src/styles/about-spacing-trial.css` now retains only About Us hero, Events and certification refinements.

`src/scripts/site-appearance.js` measures each page's hero edge so the continuous background meets it seamlessly as the viewport or content changes. It is included in the same `js/site.js` bundle. Both About Us files now use the shared gradient.

## Review coverage

The review covers desktop, tablet and mobile layouts, mapped typography, section backgrounds, text enlargement/spacing stress cases and navigation. Copy, anchor destinations, images and form fields are preserved. This is not a full WCAG audit.

The contact form retains its existing client-side validation and placeholder submission behavior; connecting a submission endpoint is a separate integration task.

All 15 pages use the same footer: Industries, Services, Accelerators and Company, a full-width black background, dim policy divider, copyright beside the policy links, and the smaller marquee ending flush at the page bottom. The old footers have been replaced. Footer padding is consistent across pages (96px desktop / 80px tablet / 64px mobile inside the black panel) independently of section spacing.

The shared template is rendered into each static HTML page by the build, including page-specific current-link states. All pages still load only `css/site.css` and `js/site.js`. The earlier About Us footer trial has been consolidated into `src/styles/footer.css`; its old trial file and flags are removed.

`index-v2.html` saves the full-viewport hero with the stats anchored at its bottom. The main `index.html` restores the original separate hero/scale arrangement from before that preview. Their shared section spacing, gradient and footer remain current. The versioned layout is isolated in the home-scale-preview style/script modules.

The Difference section on both homepage versions is an exception to standard vertical padding: its complete composition centers within the viewport below the measured navbar. Chapter pinning falls back to natural flow on short windows or when enlarged text cannot fit. The shared navbar measurement is in `src/scripts/home-difference-centering.js`.

The AI/ML and four BFSI subpage challenge timelines share `src/styles/journey-timeline.css`. BFSI subpage service-card alignment fixes are in `src/styles/bfsi-subpages.css`. Their Application Development submenu links now target existing service anchors.
