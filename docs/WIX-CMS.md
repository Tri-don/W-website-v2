# Wix CMS on Vercel

Wix is the editor for blog content on this branch. Vercel reads the private Wix collections at build time and generates the existing website, including static article pages at `/blogs/<slug>/`. The homepage and Insights show all eligible articles. Service and industry sections match their configured tags. The browser reads generated site content and approved Wix CDN images.

## Preview setup

1. In Wix, create a key for **My Site** with **Read Data Items** permission.
2. In Vercel project **wissen**, set `WIX_API_KEY` as a Preview Secret and `WIX_SITE_ID` to `0a708359-b4df-4cca-9791-0893019b85e3` as Preview Config.
3. Deploy `vercel-wix-cms` to Preview and verify the homepage, Insights, article links, and filtered industry and service pages. A missing credential, failed Wix query or malformed publishable article fails the build.

## Editing and publishing

- In **Wissen Blogs**, supply the title, lowercase URL slug, body, and publication date before enabling **Publish on website**. A future date stays hidden until a build runs after that date. Clear **Publish on website** to remove the article on the next successful build.
- Set **Author** and **Blog categories** using the linked collections. Related posts use their URL slugs. Mark sample posts **Exclude from search engines**.
- Industry tags are `bfsi-fintech`, `telecom`, `retail`, `manufacturing`, `healthcare-life-sciences` and `energy-commodities`. Service tags are `application-development`, `agentic-data-platforms`, `intelligent-automation`, `ai-ml`, `cloud` and `experience-design`.
- News, Downloads and Case Studies have collections for content entry and review. Their website rendering remains separate from this blog migration.
- To automate publishing, create a Vercel deploy hook for the branch that serves Wix. Use Wix CMS automations for add, update and delete on the Blogs collection and for relevant changes to Authors and Categories. Configure each action to send an HTTP `POST` to the deploy hook. Keep the hook URL private and verify publishing and unpublishing on Preview before using a production hook.

## Sanity rollback

- Production at migration start used `vercel-sanity-integration` commit `35ecb25166441718a7a8149577f449e2ca4c2e15`, Vercel deployment `dpl_FanRH73hLDX74uUM11ujFie9nbiW`.
- The Sanity project is `zu6gxemo`, dataset `production`, with [Wissen Content Studio](https://wissen-blogs-zu6gxemo.sanity.studio/). The Git branch preserves the Studio schema, build, browser queries and publishing guides. The public dataset used no read token. If a read token is required after a permission change, configure `SANITY_API_READ_TOKEN` as a Vercel build secret.
- To roll back after switching, restore the Sanity deployment or deploy the preserved Sanity branch, set that branch as the production source for future builds, and disable any Wix automations that target production. Test the homepage, Insights, and a known article route. Wix edits made after cutover are independent and would need a separate content transfer back to Sanity.
