# Wissen Technology — Dark website

Static website ready for manual Git upload. No build step or npm installation is required.

## Pages

- `index.html` — Home
- `Industries-BFSI.html` — Banking, financial services and fintech
- `Services-Ai-ML.html` — AI, machine learning and IoT

## Shared files

- `css/master.css` — all shared and page-specific CSS
- `js/master.js` — all shared and page-specific JavaScript
- `assets/` — external images, fonts, videos and any other local media

Upload the contents of this folder to the root of your Git repository, preserving the folders and filename capitalization. The site can be served by any static web host; GitHub Pages can serve it from the repository root. The Home page is `index.html`.

Open `index.html` to review locally. The first-visit loader runs once per browser tab session when the pages are served together from the same origin. Primary navigation connects the three pages. Links to services and pages outside this three-page scope continue to their existing destinations.

The source pages are separate HTML files; assets remain external. Inline SVG icon markup is retained. Browser tests were skipped at the user's request.

Additional BFSI domain pages:
- `Responsible-Privacy-Preserving-Financial-AI.html`
- `Risk-Regulatory-Compliance-Engineering.html`
- `Wealth-Asset-Management-Data-Infrastructure.html`


## Responsive V2

Responsive changes are applied directly to this independent copy in css/master.css. Layouts adapt continuously across the requested 720, 1280, 1440, 1600, 1920 and 2560px widths. Includes tablet stacking, flexible hero and card heights, constrained wide-screen content, and scrollable desktop dropdowns. All nine pages share these rules. Local HTML asset/link references were checked; browser and visual checks were skipped at the user's request and require manual review.
