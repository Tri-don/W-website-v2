# Wissen blog CMS

The schema and managed editing Studio were deployed on 3 November 2026.

- Studio: https://wissen-blogs-zu6gxemo.sanity.studio/
- Project: Wissen (`zu6gxemo`)
- Dataset: `production` (public)
- Schema workspace: `default`
- Management: Sanity MCP-managed schema and Studio

## Start editing

1. Sign in with your Sanity account.
2. Create a Blog author with a name, optional role, biography and photo.
3. Create Blog categories with a name, optional slug and description.
4. Create a Blog post. Fill the name/title, generate its URL slug, add a short introduction, cover image and article content.
5. In Publishing & discovery, choose the author, set the publication date, categories and tags, and optionally select related blog posts.
6. In SEO & sharing, optionally customise the SEO title, description, social image and search-engine indexing.
7. Save drafts while editing; publish when ready. A future date is a visibility filter, not a scheduled publish action. Hosted static pages need a new build/deployment after publication.

The featured flag is reserved for later Insights-listing integration. Reading time, contents navigation and last-edited date are generated automatically.

## Model and source

`schemaTypes/blog-model.json` stores the deployed declarative model. `schema.mcp.txt` stores the exact declaration sent to Sanity. `deployment.json` records the target workspace and Studio URL. Blog posts reference reusable authors and categories; tags are text entries. Body content supports paragraphs, headings, quotations, nested lists, links, images and code samples.

Image fields include alternative text, caption, credit, cropping and hotspot settings. Related posts are selected as references, with the website showing up to three published, dated articles. SEO supports an optional sharing image and no-index flag.

The active managed schema uses declarative fields and Sanity's built-in type validation. It does not enforce the function-based required/length/custom validation rules in the future local adapter. Editors should supply title, slug, introduction, publication date, article body and appropriate image alternative text. The website filters or rejects incomplete exportable posts as described in BLOG-SETUP.md.

`schemaTypes/blog.js` is a local Studio adapter with additional validation and preview configuration. There is no local Studio application or CLI configuration here. Do not deploy that adapter over the managed workspace as a separate source without an explicit migration. Future managed schema updates must also redeploy the managed Studio so its editor picks up the changes.

No sample articles, authors or categories were created, and no existing content was modified or published during schema setup. Website hosting and automatic publishing remain separate from this CMS setup.
