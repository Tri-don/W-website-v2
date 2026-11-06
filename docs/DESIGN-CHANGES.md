> Historical change log: earlier preview/module descriptions may refer to files now in Bin. Current page paths are listed in PAGE-STRUCTURE.md.

> File paths in this guide are relative to the website root. Run commands from that root.

# Wissen Dark — shared design update

Applied to the 13 HTML pages remaining after the folder cleanup. The holiday graphic/exporter is excluded. Deleted pages have not been recreated.

## Typography

| Role | Desktop | Mobile | Line height |
| --- | ---: | ---: | ---: |
| Hero title | 72px | 40px | 1.1 |
| Section title | 48px | 30px | 1.18 |
| Feature-card title | 24px | 22px | 1.3 |
| Compact-card title | 22px | 20px | 1.3 |
| Hero introduction | 18px | 16px | 1.55 |
| General body text | 16px | 16px | 1.6 |
| Card descriptions | 14px | 14px | 1.55; 1.6 for longer copy |
| Metric captions | 14px | 14px | 1.5 |
| Metadata / existing labels | 12px | 12px | 1.3 |
| Content controls | 14px | 14px | 1.4 |

- Sizes use relative units and responsive clamps. Values above assume the browser's standard 16px root size; intermediate widths interpolate.
- Hero tracking is -0.04em, section tracking -0.03em, feature-card tracking -0.02em, and compact-card tracking -0.015em.
- Existing Manrope headings, DM Sans body text and Georgia italic emphasis are retained.
- Main content is explicitly mapped with `data-wissen-type`. Navigation, footer text, decorative phone interfaces, logos, diagrams and metric numerals retain their own component styling.
- General paragraphs and hero introductions have a 65ch maximum measure where the component allows it.
- Heading emphasis and closing CTA lines can wrap. Spaces after responsive line breaks prevent joined words.
- Metric columns can wrap when enlarged instead of splitting the figures across narrow columns.

## Section spacing and backgrounds

- Standard section padding is 96px above and below on desktop, 80px at widths up to 1100px, and 64px at widths up to 700px.
- Hero spacing preserves navigation clearance and existing imagery. Application Development keeps the phone artwork cropped at its section edge.
- The closing CTA retains an additional 32px below its content for optical balance.
- Scroll-driven sections keep their tracks and interactions. Sticky stages use suitable viewport-aware spacing rather than forcing overflowing fixed-height content.
- The body, section canvases and footer use the same #080809 dark background.
- Alternating charcoal section bands and the Application Development / Insights hero glow are removed. Card surfaces, photographs, video and other illustrations remain distinct.

## Application Development refinements retained

- The two “Applications need more than code” cards no longer contain an unused grid row.
- Their desktop minimum height is 220px instead of 360px. Narrow layouts use natural content height.
- Card padding is 26–32px. Titles and descriptions align across the desktop row.
- “Built around real business needs” uses the full heading width and fits on one line on a wide desktop. It can wrap on smaller screens.
- Both descriptions use a narrower 42ch measure and 14px text.
- The “Designed to evolve” description contains the requested explicit line break after “businesses”, before “adapt”.
- Circle and square artwork is retained and resized to match the shorter cards.
- Compact challenge/service grids use roomier tablet columns and one column on narrow screens.

## Shared assets and maintenance

- Every remaining page references only `css/site.css` and `js/site.js`.
- Original CSS and JavaScript sources are retained in `src/styles/` and `src/scripts/`. They are not loaded separately by the pages.
- `src/styles/global-system.css` is the final shared design layer. Edit it to change the global scale, spacing or backgrounds.
- `src/site-manifest.json` records each page's required modules and original script timing.
- Component CSS is scoped to pages that originally loaded it. Animation names are namespaced to prevent collisions in the merged stylesheet.
- The script bundle preserves head/deferred execution order and runs only the modules needed by the current page.
- Rebuild both assets from this folder with `python build_site.py`. No third-party build dependencies are required.
- A new page needs a manifest entry, matching root data attributes, the two shared asset references, and mapped text roles.

## Responsive and functional fixes

- Added the missing navigation backdrop on Careers and Insights, resolving their existing menu initialization errors.
- Contained the Autonomous Operations hero decoration so it does not widen the mobile page.
- Service mosaic rows and featured article cards can grow with enlarged text.
- Removed non-wrapping restrictions on Responsible AI and closing CTA headings.
- Existing copy, links, images and form fields are preserved. No publishing or remote repository changes are part of this update.

## Review scope

The rollout includes source/dependency checks, JavaScript syntax checks, rendered desktop/mobile review, navigation checks on every page, responsive width checks and typography stress checks. This is a typography and responsive-layout review, not a full WCAG conformance audit. WCAG does not prescribe a universal minimum font size; color contrast, reflow, resizing and user text-spacing support are separate requirements.

Final checks completed:

- All 13 pages at 1440, 768, 390 and 320px: 52 layout checks, with no detected page overflow or clipped visible content text.
- All 13 pages at desktop/mobile widths with mapped text enlarged to 200%, and separately with text-spacing overrides: 52 stress cases, with no detected overflow or clipping.
- Desktop/mobile navigation on every page: 26 checks.
- About/Careers slideshows, Accelerator/Insights tabs, success-story navigation, and normal-motion first-visit loader/scroll initialization.
- Text, image references, anchor destinations and form fields compared with the pre-rollout pages and preserved.
- Native browser CSS parsing confirms all 5,357 source/generated rules are retained; JavaScript syntax checks pass.
- Rebuilding produces identical CSS/JS bytes. Original source modules are retained byte for byte.

## About Us spacing review

The subsequent spacing trial applies to `company/About-Us.html` only. Standard section-edge padding is exactly half the shared values: 48px desktop, 40px tablet and 32px mobile. Hero-copy and outer footer padding are also halved. Borders are unchanged; About Us already has no dividers between its main sections. The other 12 pages retain the shared spacing above.

The trial lives in `src/styles/about-spacing-trial.css` and remains part of the one merged stylesheet. Its page guard confines it to About Us until the user approves a wider rollout. Computed padding was compared before/after at desktop, tablet and mobile widths; the other pages' padding and borders and all JavaScript remain unchanged.

The Events section now has bottom padding matching its top padding so its transition into Insights matches the other section gaps. The “Blog & Insights” eyebrow above “Ideas that move business forward” is removed on About Us only.

The About Us hero now fills the visible viewport using `100dvh` with a `100svh` fallback. Its content can still expand the section on short screens instead of being clipped.

The footer's top border below the Insights section is removed on About Us only, eliminating the divider below “Ideas that move business forward”.

## About Us gradient v2 comparison

- `About-Us-v2.html` is a separate comparison page based on the current compact About Us layout. V1 retains its solid background.
- A continuous, irregular dark–charcoal–dark gradient runs behind transparent sections. Its uneven stops provide variation without section-by-section color bands or new purple surfaces.
- The hero photograph fades into the gradient's starting tone. Sticky Events heading backgrounds are transparent so they do not create a dark strip across the canvas.
- The footer begins transparent and fades into #020203, providing a distinctive dark ending with a seamless entry.
- Footer-bottom padding is removed in both v1 and v2, retaining only a device safe-area inset where necessary.
- The v2 style is in `src/styles/about-gradient-v2.css`. Both versions still load only `css/site.css` and `js/site.js`.
- Desktop, tablet and mobile checks confirm the full-viewport hero, transparent v2 sections, zero default footer-bottom padding and no visible-text overflow. Existing pages' HTML remains unchanged.

## About Us footer navigation refinement

Both About Us versions now use the same footer navigation and slightly deeper top spacing: 56px desktop, 48px tablet and 40px mobile. Bottom padding remains zero apart from device safe-area accommodation. The other pages retain their current footers.

The footer now follows the main navigation with four groups: Services (six category links), Industries (six sectors), Accelerators (Autonomous Operations) and Company (About Us, Insights, Careers and Contact Us). It omits duplicate accelerator entries pointing to Contact Us and removes redundant general links such as Our solutions, Global presence and Our people. Existing social and policy links remain separate. About Us points to the canonical v1 page, leaving v2 as a comparison page.

Category headings have clearer contrast and footer links use 14px type, a 1.55 line-height, 44px minimum target height and visible keyboard focus. The layout uses four navigation columns on desktop/tablet and two on mobile, with the brand area moving above the links at tablet widths.

## Pages

- company/About-Us.html
- About-Us-v2.html — comparison version
- services/Application-Development.html
- accelerators/Autonomous-Operations.html
- industries/bfsi/Capital-Markets-Technology.html
- company/Career.html
- company/Contact-Us.html
- index.html
- industries/bfsi/Industries-BFSI.html
- insights/Insights.html
- industries/bfsi/Responsible-Privacy-Preserving-Financial-AI.html
- industries/bfsi/Risk-Regulatory-Compliance-Engineering.html
- services/Services-Ai-ML.html
- industries/bfsi/Wealth-Asset-Management-Data-Infrastructure.html

## About Us footer follow-up

- Restored all seven accelerator links from the navbar, retaining their existing destinations: Autonomous Operations has its own page; Delivery & Quality, Agentic Platform, Document Intelligence, Data & Knowledge, Cloud & Platform, and Industry Solutions lead to Contact Us. This supersedes the earlier omission of repeated contact destinations.
- Dimmed the four menu headings to #a6a2ad.
- Widened the desktop logo column and increased its separation from the menus to 64px, moving the menus about 49px right at 1440px. The existing stacked tablet and two-column mobile layout remains responsive.
- Set both the outer footer and copyright row to exactly zero bottom padding in both versions, removing the previous safe-area allowance.

The marquee follow-up removes the wordmark groups' .06em bottom spacer and the copyright row's 22px desktop / 20px mobile top padding in both About Us versions. The marquee remains clipped and its animation is unchanged.

## Reversible About Us footer panel

Both versions preview an inset #141416 rectangle enclosing the logo, menu groups and privacy/cookie-policy row. The marquee and copyright stay outside. The panel uses 32px inner padding on desktop and 24px/20px on mobile with subtle 8px corners. Its CSS is isolated in `src/styles/about-footer-panel-trial.css`, still built into the single stylesheet. Remove `data-wissen-footer-panel="trial"` from either page's `<html>` tag to instantly restore its previous panel-free layout; no rebuild is needed for that toggle.

Footer menu items now have no inter-item gap and a 36px minimum row height on desktop, down from 44px plus a 6px gap. Mobile retains 44px minimum tap targets without the extra gap. This compact spacing remains if the panel is switched off.

Footer navigation order is now Industries, Services, Accelerators, Company in both versions, including the mobile reading order.

The optional footer rectangle now uses #000000, the darkest black, in both About Us versions. Its toggle and layout remain unchanged.

The black footer panel now spans the full viewport width with square edges. Its content uses the same centered maximum width and responsive gutters as the page sections, restoring the pre-panel horizontal alignment. The panel toggle remains reversible.

The full-width footer rectangle now has internal top padding equal to twice the current section padding: 96px desktop, 80px tablet, and 64px mobile. Its bottom padding and horizontal content alignment remain unchanged.

The optional black footer panel now continues behind the marquee. Its former top margin is equivalent black-backed internal padding, avoiding a gap between the navigation rectangle and marquee. The clipped lettering, animation and zero space beneath the marquee are preserved.

The marquee is approximately 15% smaller in both About Us versions: desktop uses clamp(120px, 18.7vw, 306px), and mobile uses 28.9vw. Its upper padding is reduced from 42px to 28px on desktop and 36px to 24px on mobile, preserving the continuous black background, clipped lettering and zero bottom gap.

The marquee now optically trims the unused space in the font line box with a negative track bottom margin (-.04em desktop, -.06em mobile, plus a 1px trim for pixel rounding), leaving the lettering flush against its clipped lower edge. This changes neither the type size nor the horizontal animation, and retains the copyright row. The rule remains inside the reversible panel trial.

## Marquee descenders and page ending correction

The earlier negative-margin trim cut too much of the g/y descenders. It is removed. The visible area now extends downward with .215em desktop / .183em mobile descender allowance. The copyright row appears above the decorative marquee, making the marquee the footer's final element, with zero outer bottom padding and no content strip below it. Copyright content, black background and horizontal alignment are retained. The CSS-only arrangement is part of the reversible panel toggle.

## Footer copy and certification cards

Both About Us versions now show the copyright once, in the former footer description position alongside Privacy policy / Cookie policy. The Strategy / Design / Engineering row, duplicate copyright and footer divider lines are removed. The automatic year identifier is retained on the relocated copyright. The marquee is naturally the last footer element without CSS reordering.

Excellence. Certified. cards now use smaller marks (54x60px desktop, 52x60px mobile, with proportional SOC dimensions), lighter #141416 surfaces and increased padding (32px 28px desktop, 28px 24px mobile). Their icon-to-caption spacing is preserved: 18px vertically on desktop (22px for the inset SOC mark), and 20px horizontally on mobile. Card sizing remains content-driven.

## Footer divider and subtle marquee crop

Restored the divider immediately above the copyright/privacy-policy row in both About Us versions. The marquee now uses a shallow bottom crop (about .04em desktop / .035em mobile) while retaining most of the g/y descenders. Its group height defines the visible area with zero bottom padding; the footer and marquee also retain zero bottom margin/padding and end at the page edge. This supersedes the preceding fully extended descender area.

The footer policy-row divider is dimmed from #49414f to #2d2931 in both About Us versions.

## Shared footer rollout to the full website

The approved footer replaces the earlier footer on all 14 active HTML pages, including About Us v2. Its groups remain Industries, Services, Accelerators, Company, with all seven accelerator links and per-page current-link states. Every page now uses the full-width black panel, dim policy divider, single copyright/policy row, smaller subtly cropped marquee and zero outer bottom spacing. Internal footer-top padding is consistently 96px desktop / 80px tablet / 64px mobile, independent of each page's section padding.

`src/partials/footer.html` is the single content source. `build_site.py` refreshes each manifest page's footer from that template before rebuilding the same `css/site.css` and `js/site.js` assets. `src/styles/footer.css` owns the shared design. Page-specific footer duplicates and the obsolete About Us footer-panel trial source/flag are removed. Older entries describing an About Us-only footer trial are superseded by this rollout. All non-footer page content and section styles are preserved.

Browser review covers all 14 pages at 1440, 768, 390 and 320px (56 footer layout checks), checking black backgrounds, menu order, seven accelerators, one copyright, dim divider, full-width panel, responsive padding, no footer text clipping or page overflow, valid local footer destinations and a flush marquee/page ending.

## Global compact spacing, divider removal and gradient rollout

All 14 active pages now share the About Us compact section spacing: 48px desktop, 40px at widths up to 1100px, and 32px at widths up to 700px. Regular content sections use these values on both edges, including closing CTA sections. Hero navigation clearance and scroll-animation tracks remain content-aware. Footer spacing remains independently set to its approved 96px / 80px / 64px internal top padding.

Top/bottom borders on section boundaries and the homepage partner strip are removed, along with decorative section-sweep lines. Borders inside cards, diagrams, forms and controls are retained, as is the expressly approved dim footer policy divider.

The continuous uneven dark-charcoal-dark gradient now applies to every page, including About Us v1. Main sections are transparent, and full-section sticky masks are cleared so the same canvas flows through the page. Hero photographs and scene objects remain. The shared appearance script measures the actual hero edge with ResizeObserver to align the gradient as hero content or viewport size changes. The footer's full-width black panel and marquee remain unchanged.

The former About Us-only gradient source is consolidated into `src/styles/global-system.css`. Its manifest module/token is removed. `src/scripts/site-appearance.js` is included in the same single JavaScript bundle. All original HTML content, image references, anchor destinations and the approved shared footer are preserved. Older notes describing a solid global background or an About Us-only compact/gradient trial are superseded.

Rollout verification: all 14 pages passed at 1440, 768, 390 and 320px (56 appearance checks), confirming responsive section padding, transparent section surfaces, removed section borders, aligned hero/gradient edges, unchanged approved footer spacing and no visible mapped-text clipping or horizontal overflow. All 56 enlarged-text/text-spacing cases passed. About/Careers slideshows, Accelerator/Insights tabs, success stories, first-visit loading and homepage scroll-driven initialization also passed.

## Reversible homepage scale-row preview

The scale section is lifted into the hero's lower area by up to 144px on wide desktop, 104px on smaller desktop, 64px on tablet and 48px on mobile. Its text retains at least 24px clearance from the hero copy/actions (16px mobile), with the lift reduced automatically for enlarged content and short layouts. The transparent top padding lets pointer input pass through to hero actions.

The preview is isolated in `src/styles/home-scale-preview.css` / `src/scripts/home-scale-preview.js`, included in the existing merged CSS/JS assets. Remove `data-wissen-scale-preview="raised"` from `index.html` to restore the original position immediately. Other pages and the original hero content remain unchanged.

The homepage preview now anchors the entire scale section to the hero's bottom edge, replacing the earlier fixed lift. The hero fills the visible viewport and reserves the measured stats-row height so hero text/buttons stay above it. On short screens or with enlarged text, it grows naturally to retain the content. The decorative art stays outside normal flow on tablet/mobile. Removing the same preview attribute still restores the previous layout.

## Saved hero/stats version and main homepage restoration

`index-v2.html` preserves the latest full-viewport hero with the scale section anchored at its bottom. The main `index.html` is restored exactly to the pre-preview HTML checkpoint, retaining the globally approved compact spacing, continuous gradient and shared footer. Its preview attribute/style token and preview script configuration are removed. The isolated hero/scale modules now run on the versioned page. The site has 15 active pages and continues to serve one CSS and one JavaScript asset.

## Homepage Difference vertical-centering exception

Both homepage versions center the complete Difference composition in the viewport area below the current navbar. The pinned stage starts at the measured navbar edge and uses the remaining viewport height, with symmetric viewport-aware padding and no trailing panels margin. Its existing header/image alignment and chapter transitions are retained. Scroll progress accounts for the navbar inset. On short windows (under 600px high), mobile and reduced-motion layouts, chapters remain in natural flow so they are readable instead of being squeezed into a pinned frame. Navbar measurement is included in the same shared script bundle.

The Difference controller also falls back to natural flow if enlarged heading/body copy cannot fit inside the available stage. It remeasures after font, navbar, viewport and text-size changes, keeping all chapters readable without overlapping the navbar or each other.

Centering verification passed 72 chapter/layout cases across both homepage versions, including 1280x720, wide desktop, tablet, mobile and short landscape windows. The pinned composition is centered within 2px of the navbar-excluded viewport center; all four chapter transitions remain functional. 200% text tests switch to readable natural flow and restore pinning when text returns to normal, without script errors.

The original orbiting rings and soft glow are restored behind the Ready to transform what's next CTA on index.html, index-v2.html and industries/bfsi/Industries-BFSI.html. The current section gradient/spacing remains; the existing reduced-motion rule still stops the orbit animation when requested. Other closing CTA backgrounds retain their current treatment.

## AI journey challenges layout repair

Removed body-text roles from the timeline's structural list items. Their 65ch body-copy limit was shrinking each row while the rail stayed centered in the full container. Rows now span the timeline width, with dots aligned to the center rail and the original alternating desktop layout and scroll highlights preserved.

A page-scoped `src/styles/ai-journey-layout.css` module sets flexible, shrinkable grid columns, restores normal text width, and uses the shared section spacing below the heading. On mobile, rows grow with their content rather than reserving 268px each; icons and dots align at a fixed common center with a consistent icon-to-copy gap. No copy or icons are changed, and the module is part of the same single stylesheet.

AI journey repair verification: 20 layout cases passed across 320–2560px in normal and reduced-motion modes, with all dots aligned to the rail. Six enlarged-text/text-spacing cases passed; scroll progression through the first, middle and final challenges is working. All page copy and surrounding markup are preserved.

The AI journey challenge rectangles now highlight both vertical edges with matching 2px lavender borders driven by the same scrolling focus value. On mobile the left accent follows the inset card edge, leaving the timeline rail outside the rectangle. Existing highlight timing and intensity are preserved.

Correction: challenge edge accents alternate left, right, left, right, left down the five cards, with one highlighted edge per card. This replaces the simultaneous two-edge treatment. The existing scroll timing/intensity and mobile card inset remain.

The AI & ML impact cards (Wealth Management, Intelligent Surveillance, Healthcare Insurance, Customer Engagement) now use 260px desktop / 240px tablet / 220px mobile minimum heights, growing naturally for longer or enlarged text. Titles and descriptions form a bottom-left-aligned block with a consistent 12px gap, replacing the old large top title margins. Existing padding, copy and abstract shapes remain. Page-scoped `src/styles/ai-impact-layout.css` is included in the single stylesheet.

The Our AI, ML & IoT Services heading and card stack now use the shared --site-max container and --site-gutter side padding, matching the Overview and Impact content edges. The outer max width was already 1440px; a later percentage-padding rule was narrowing the usable width. The page-scoped correction is in `src/styles/ai-services-layout.css` within the same merged stylesheet. Existing vertical spacing and sticky stacking are retained.

## BFSI subpage review and repairs

Reviewed Capital Markets Technology, Risk & Regulatory Compliance Engineering, Wealth & Asset Management Data Infrastructure, and Responsible / Privacy-Preserving Financial AI. Fixed the structural body-copy width limit on all four challenge timelines, restoring centered rails, full-width rows, alternating edge highlights and compact mobile alignment. The AI/ML timeline fixes are now a shared `src/styles/journey-timeline.css` component; its existing appearance and animation remain.

Repaired eight Application Development submenu destinations per page (32 links) that referred to the deleted Application-Development-Services.html. They now target matching, verified service anchors in services/Application-Development.html. Overrode the homepage Application Development card's inherited zero flex-grow and standardized service-card copy layout so its CTA aligns with the other service cards. Updated nine success-story actions from Read the Case Study to Read success story to match the website terminology. Existing claims, imagery, cards, gradients, section spacing and footer are retained. Page-specific card repairs are in `src/styles/bfsi-subpages.css`, built into the same single stylesheet.

BFSI subpage verification: 40 responsive layout cases (320–2560px), 32 enlarged-text/text-spacing cases, and eight desktop/mobile interaction cases passed across all four pages. Menus, carousel arrows and keyboard Home/End, first/last card reachability, and timeline progression work without script errors. All local destinations resolve; referenced local images exist. AI/ML timeline regression checks also pass after sharing its component. All other copy and imagery are preserved, and the existing JavaScript bundle is byte-for-byte unchanged. External article/service URLs were retained.

Removed the seven redundant top-corner arrows beside the insight-card labels/titles across the four BFSI subpages. The full-card links, reading-action arrows, copy and imagery are retained.


Homepage industry accordion: removed "Select an industry to see where we focus." from both homepage versions. Reallocated its space to taller cards: 558px on full desktop layouts, compact desktop heights increased by 38px, and 462px expanded cards on phones (510px at 360px and below for longer wrapped copy). Desktop copy uses the final expanded-card width throughout the flex animation, preventing the last-moment line rewrap/jitter. Preserved hover previews, radio selection, keyboard controls, imagery and links. Responsive checks at 320–1920px covered all six cards and sampled the animation frame by frame.
