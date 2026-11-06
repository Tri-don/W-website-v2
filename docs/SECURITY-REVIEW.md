# Website security review — 5 November 2026

Scope: the local Wissen Dark source, CMS renderers, static export, contact form and Vercel deployment configuration. This is a source review with automated regression tests, not a penetration test of a deployed website.

## Findings and changes

| Finding | Change |
| --- | --- |
| The contact form had no method, so a browser fallback could put entered details into a GET URL. | Set `method="post"`. The deployment CSP blocks all native form submissions while no backend exists. Fields and submission are now disabled in HTML and JavaScript, with a visible unavailable message. The form never reads, stores or sends field values. |
| Deployment headers did not include a Content Security Policy or framing restrictions. | Added a policy allowing local scripts, local styles/fonts/video, local or Sanity images and connections to the configured Sanity project. Inline executable scripts, inline handlers, eval, plugins, base-URL changes, frames and native form posts are blocked by the configured policy. |
| CMS image URLs could point at arbitrary HTTP/HTTPS hosts. | Limit CMS image sources to local `assets/images/` paths and the HTTPS Sanity image CDN; reject traversal and encoded backslashes in local paths. Normal article links can still point at valid public HTTP/HTTPS pages. |
| Link validation accepted malformed URLs and URLs with embedded credentials. | Parse HTTP/HTTPS URLs, reject credentials and invalid hosts, reject control characters, and reject encoded CR/LF in mail links. Existing HTML escaping and new-tab opener protection remain. |
| Rich-text tag lookup included inherited object keys. | Use own-property checks for supported marks and block styles. Unknown styles fall back to paragraphs; unknown marks do not become HTML tags. |
| Dollar replacement sequences in CMS metadata could duplicate generated page markup. | Use callback replacements for titles, descriptions, JSON-LD/social metadata and generated canonical links. Regression tests cover literal dollar sequences and script-closing text. |
| Recursive copying of all public folders could accidentally publish an unrelated file or follow a media symlink. | Export only recognized image/video/font extensions and the exact compiled CSS/JS bundles. Reject unexpected asset files and symlinks before replacing output. Copy only an explicit allowlist of public CMS configuration fields. |
| CMS endpoint configuration was interpolated without validation. | Validate project/dataset/API-version fields before constructing API URLs; build requests reject HTTP redirects. GROQ variables remain parameterized. |

Additional deployment headers are `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, a restrictive Permissions Policy, the existing referrer policy and one-year HSTS. HSTS intentionally has no subdomain or preload commitment.

## Compatibility and deployment

The site uses shared external JavaScript and CSS. Inline style attributes remain allowed because the current layouts and animations use them; inline executable JavaScript is not allowed. There are no third-party script dependencies in the current page HTML.

These HTTP protections are configured in `vercel.json`. They take effect when deployed through Vercel; opening a local file does not apply server headers. Another host must be configured with equivalent headers and the old-page redirects. The configured policy only allows API connections to the current Sanity project; update its `connect-src` entries and associated tests if changing projects.

When implementing a real contact endpoint, update `form-action` deliberately and add backend validation, abuse/rate controls and appropriate request-origin/CSRF protections. Client-side validation alone is not a server security boundary. No backend or message submission service was added in this review.

## Verification

- `npm run check` covers 14 active source pages and 1,283 local references, JavaScript syntax, CMS behavior, path rebasing, redirect mappings and malicious-content tests.
- Eighteen automated tests passed, including a complete static export with local fixture content in an isolated temporary directory. That export checks generated links, article paths, the sitemap and exclusion of synthetic private configuration/files.
- A scan of 60 active text files found no matches for the selected private-key, GitHub-token, AWS-key-ID and literal-credential patterns. This is a limited pattern scan, not a complete secret audit or Git-history audit.
- No new npm dependency was introduced; the root lockfile has no third-party packages.
- GitHub's build workflow now runs the checks before the CMS build and validates generated references afterward.

## Integration follow-up

All browser article, Insights and homepage queries now use the API CDN with explicit GET, omitted credentials and rejected redirects. The browser CSP no longer allows the uncached API origin. Build-time reads continue to use the uncached API for fresh exports.

Generated configuration includes an allowlisted array of exported article slugs. Live card refreshes retain static article links for those slugs, and the live fallback shares a static canonical URL when that export exists. Posts published after the last build still need a rebuild before their static previews are available.

The form is fail-closed until a protected backend is implemented. Build checks reject an enabled form mode or action; tests cover HTML-disabled fields and script prevention of submission/data access. See FORM-INTEGRATION.md for backend requirements. Server-side CAPTCHA/rate limiting is not claimed to exist while there is no backend.

## Unverified areas

The live Sanity build could not complete because the execution approval flow did not complete. A browser check could not complete either: the in-app preview timed out, the native browser approval timed out, and local HTTP access from the restricted shell was denied. Therefore live content fetching, actual browser enforcement of the configured headers and deployed response headers have not been verified here.

A follow-up read of live project metadata confirmed a public production dataset and two exact CORS origins: localhost Studio and the Vercel integration preview, with no wildcard. Full account roles, published field contents, production DNS/TLS, hosting account settings, traffic protection and any future backend remain outside this local source review. No external settings, content, deployments, commits or pushes were changed.

References: [OWASP CSP guidance](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html), [MDN form method](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/form), [MDN style attribute policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/style-src-attr), [Vercel static configuration](https://vercel.com/docs/project-configuration/vercel-json).
