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
