# Wissen — Mark6

Static website. No npm install or build step is required.

## Upload to Git

Upload the contents of this folder to your repository root, keeping `index.html`, `css/`, `js/`, and `assets/` together. Do not upload the enclosing folder as an extra directory.

## Preview

Open `index.html` directly in Chrome or Edge, or run `python -m http.server 8000` from this folder and open http://localhost:8000.

## Hosting

Deploy the repository as a static website. The publish directory is the repository root; no build command is needed. Relative asset paths also support hosting under a repository subpath.

For GitHub Pages, select the branch and its root folder in Settings → Pages. `.nojekyll` preserves the plain static output.

Configure your hosting provider to compress HTML, CSS and JavaScript, and cache fingerprinted files under `assets/`. The asset filenames are content hashes: use a new filename if you change an asset. No provider-specific cache configuration is assumed.

## Contents

- `index.html`: page markup
- `css/styles.css`: styles and font declarations
- `js/`: page interactions
- `assets/images/`, `assets/fonts/`, `assets/videos/`: separate, deduplicated media

The lower page images and background video load on demand. The autoplay hero video still needs its own media download. External destinations, including Google Maps, require an internet connection. This is a homepage; service/product destinations link to the existing Wissen website.
