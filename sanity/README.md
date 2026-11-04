# Wissen content CMS

The blog schema and managed editing Studio were deployed on 3 November 2026. News posts, Downloads and Case Studies were added on 4 November 2026, and the existing Studio was redeployed as Wissen Content.

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

The Featured flag selects the homepage blog section's centre card. Reading time, contents navigation and last-edited date are generated automatically.

## News, Downloads and Case Studies

These are three separate document collections in the same project, dataset and Studio:

| Collection | Type name | Fields |
| --- | --- | --- |
| News post | `newsPost` | Title, short description, news image, external article link, publisher logo, publisher name, publication date, industry tags, service tags |
| Download | `download` | Name, URL slug, description, uploaded file, cover image, publication date, industry tags, service tags |
| Case study | `caseStudy` | Title, URL slug, short description, cover image, publication date, industry tags, service tags, optional client name, rich-text content, optional Download reference, SEO and social metadata |

The tag fields use multi-select lists aligned with the current website taxonomy. Industry values are `bfsi-fintech`, `telecom`, `retail`, `manufacturing`, `healthcare-life-sciences` and `energy-commodities`. Service values are `application-development`, `agentic-data-platforms`, `intelligent-automation`, `ai-ml`, `cloud` and `experience-design`. These stable values can be used for future filters and page-specific listings.

News posts link to the original publisher's article. The logo is a separate image upload from the news cover. Publisher name provides a textual fallback for the logo. Downloads use Sanity's native file upload, which stores the original filename, MIME type, size and hosted asset URL automatically; no duplicate manual file-size field is needed. Case Studies support the same rich text and image capabilities as Blogs, and can reference a Download entry for an accompanying document.

Create a new entry from its collection in Studio, complete the fields and publish when ready. These schemas use a date-only `date` field (`YYYY-MM-DD`); supply it before publication. Add suitable alternative text to image uploads. The new collections are ready for content entry. Website renderers for these three types are a separate integration step.

No sample records or uploaded assets were created as part of this schema update. Existing blog content was preserved.

## Model and source

`schemaTypes/blog-model.json` stores the declarative blog model. `schemaTypes/resources-model.json` stores the three additional collections. `resources.mcp.txt` stores the additive declaration used for this update; `schema.mcp.txt` contains the complete six-type declaration for reference. `deployment.json` records the target workspace and Studio URL. Blog posts reference reusable authors and categories; tags are text entries. Body content supports paragraphs, headings, quotations, nested lists, links, images and code samples.

Image fields include alternative text, caption, credit, cropping and hotspot settings. Related posts are selected as references, with the website showing up to three published, dated articles. SEO supports an optional sharing image and no-index flag.

The active managed schema uses declarative fields and Sanity's built-in type validation. It does not enforce the function-based required/length/custom validation rules in the future local adapter. Editors should supply title, slug, introduction, publication date, article body and appropriate image alternative text. The website filters or rejects incomplete exportable posts as described in BLOG-SETUP.md.

`schemaTypes/blog.js` is a local Studio adapter with additional validation and preview configuration. There is no local Studio application or CLI configuration here. Do not deploy that adapter over the managed workspace as a separate source without an explicit migration. Future managed schema updates must also redeploy the managed Studio so its editor picks up the changes.

The original schema setup did not create sample content. Three demo blog posts and a fourth user-created post were subsequently published during blog integration. This update adds schema definitions only; it does not change or republish content documents.
