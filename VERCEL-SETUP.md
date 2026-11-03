# GitHub deployment to Vercel

This website remains plain HTML, CSS and JavaScript. The build generates complete v3 article pages from published Sanity content and produces a portable `dist` folder.

## Import the GitHub branch

In Vercel, choose Add New Project and import `Tri-don/W-website-v2`. Select the `vercel-sanity-integration` branch for the temporary website. Use that branch as the project's Production Branch; leave GitHub's `main` unchanged until the integration is ready to merge.

| Setting | Value |
| --- | --- |
| Root Directory | Repository root (`.`) |
| Framework Preset | Other |
| Node.js | 22.x |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Dependencies | No npm packages are required |

`vercel.json` supplies the build and output settings. Python 3 must be available for `build_site.py`; the build selects `python3` on Linux or `python` on Windows. The `PYTHON` environment variable can override the executable name.

Enable Vercel's system environment variables. The build uses `VERCEL_PROJECT_PRODUCTION_URL` for canonical URLs and the sitemap when `SITE_URL` is unset. An explicit `SITE_URL` takes precedence and should be the final site root, for example `https://your-domain.example/`. Do not set the example as a real value. A Sanity token is not needed for the current public dataset. For a future private dataset, provide a read-only `SANITY_API_READ_TOKEN` as a build secret; it is never written into public output.

The existing `.html` links remain supported. Blogs are generated at `/blogs/<slug>/`, with a listing at `/blogs/`. The build adds published Sanity cards to the existing Insights blog grid and retains its earlier editorial links. `Blog.html` remains a live read-only article entry point, while generated article pages contain their content without JavaScript.

The build publishes only website pages, assets, compiled CSS/JS and the small public Sanity configuration. It excludes schema sources, environment files, Git metadata and layout previews. Drafts and future-dated articles are excluded. The three demo articles retain their no-index metadata; they are sample content.

## Rebuild after Sanity publication

Git pushes trigger deployments once Vercel's GitHub integration is enabled. Sanity content changes do not create a Git commit and need a separate trigger:

1. In the Vercel project, open Settings > Git > Deploy Hooks. Create a hook for `vercel-sanity-integration` named `Sanity blog publication`.
2. In Sanity project settings, create a webhook targeting that deploy-hook URL, using HTTP POST and the `production` dataset.
3. Enable Create, Update and Delete events. Keep draft and version events disabled. Use this filter:

```groq
_type in ["blogPost", "blogAuthor", "blogCategory"]
```

4. Use the projection below and save the webhook. Publishing, editing published content, and unpublishing should then trigger fresh static builds.

```groq
{_id, _type}
```

Treat the deploy-hook URL as a deployment credential. Store it in Sanity's webhook configuration, never in the public dataset, GitHub files or browser JavaScript. This guide does not mean the webhook is already configured; its real URL is available only after the Vercel project is created.

For date-only visibility changes in the future, a build is still required after the date passes. Editing a draft does not trigger publication.

## Move to Hostinger later

1. Set `SITE_URL` to the intended Hostinger site URL and run `npm run build` on a machine with Node.js 22+ and Python 3.
2. Upload the contents of `dist` to the chosen website root, normally `public_html`. Keep the nested `blogs/<slug>/index.html` folders.
3. Update DNS when ready. Retain existing article slugs and paths to preserve links.
4. Replace the Sanity deploy-hook destination with the Hostinger build/upload automation. Remove or disable the old Vercel hook after the switch.

The website has no dependency on Vercel Functions or a proprietary page renderer. Contact-form submission still requires its existing separate backend setup.

## Local build

```powershell
npm ci --ignore-scripts
npm run build
```

The output is reproducible. Do not commit `dist` or credentials. A failed Sanity query or invalid article stops the build so it cannot silently publish an incomplete release.
