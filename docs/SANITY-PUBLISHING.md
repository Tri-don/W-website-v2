> File paths in this guide are relative to the website root. Run commands from that root.

# Publish blogs from Sanity

The intended editor workflow is: write a blog in Sanity, click Publish, and wait for the website update to deploy. Editors will not need to edit HTML or GitHub files for each post.

## What is ready

- Sanity schema and editor: https://wissen-blogs-zu6gxemo.sanity.studio/
- Three published dummy articles, including cover images, author, categories and tags.
- A portable static generator using the approved v3 design in `insights/Blog.html`.
- A GitHub Actions workflow in `.github/workflows/sanity-publish.yml`. It builds on pushes to the integration branch or main, and can accept a workflow-dispatch event once registered on the default branch.
- Each successful run stores a `wissen-website` artifact containing the generated site, blog listing and individual articles. It is retained for seven days.

Hosting has deliberately been deferred. No live deployment step or active Sanity webhook has been configured. Publishing in Sanity currently saves public CMS content; it does not yet deploy a hosted website. This workflow contains no hosting credentials and does not enable GitHub Pages or another host.

## Finish after choosing hosting

1. Connect the deployment job to the chosen host, using the generated `dist` output. Host-specific credentials belong in GitHub Actions secrets, not in the repository or public Sanity dataset.
2. Set the GitHub repository variable `SITE_URL` to the final public site root. The current public Sanity dataset needs no read token. If it becomes private, set the optional build secret `SANITY_API_READ_TOKEN` and use the static generated pages for public delivery.
3. Ensure the workflow exists on the repository's default branch before setting up external workflow-dispatch triggers. Its current review branch is `vercel-sanity-integration`; main has not been updated by this task.
4. Configure the Sanity webhook below with a narrowly scoped GitHub credential. Activate it only after the deployment job succeeds, then test publishing, updating and unpublishing a disposable demo post.

## Sanity webhook settings for GitHub Actions

| Setting | Value |
| --- | --- |
| Project / dataset | Wissen / `production` |
| Method | POST |
| URL | `https://api.github.com/repos/Tri-don/W-website-v2/actions/workflows/sanity-publish.yml/dispatches` |
| Events | Create, Update, Delete |
| Draft and version events | Disabled |
| Content-Type header | `application/json` |
| Accept header | `application/vnd.github+json` |
| X-GitHub-Api-Version header | `2026-03-10` |
| Authorization header | `Bearer` followed by the real GitHub token, stored only in Sanity's webhook settings |

Use a fine-grained credential restricted to this repository with Actions: write permission, or a suitably scoped GitHub App credential. Creating and connecting that credential remains a setup step; this repository does not contain one.

Filter:

```groq
_type in ["blogPost", "blogAuthor", "blogCategory"]
```

Projection (constant JSON-compatible GROQ object):

```groq
{"ref": "vercel-sanity-integration"}
```

Change `ref` to `main` when the publishing code is merged there. The workflow checks out the dispatch branch and queries current published content directly from Sanity. This supports article publication, updates, author/category changes, and unpublishing. A failed build stops before deployment; hosting must keep serving the preceding successful release.

Future-dated visibility still needs another build after the date passes. A date field alone is not an automatic publication schedule.

## Reference documentation

- https://www.sanity.io/docs/content-lake/webhooks
- https://docs.github.com/en/rest/actions/workflows#create-a-workflow-dispatch-event
- https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflow_dispatch

No Vercel plugin is required for this GitHub-based build workflow. Hostinger or another static host can be connected to its output later.
