# Application Development — reversible typography trial

## Request for the next session

Implement this trial in the existing **Wissen Dark/Application-Development.html**. Use the accompanying **application-development-typography.css** as a separate, page-only stylesheet. Preserve the original shared CSS. Removing one stylesheet link must restore the previous typography.

**Status:** These are handoff files, not an applied website change. The current session could not access the Windows project or inspect the latest Application Development markup. CSS uses explicit opt-in attributes, not guessed project selectors. Inspect and map the real page before enabling the stylesheet. Do not rebuild the page from the older homepage attachments.

## Known project location

Previously reported local folder (verify access in the new session):

```text
C:\Users\91754\.codex\.chatgpt-projects\g-p-6ac376bf418481918c567c8f4c4c4235\Wissen Dark
```

Expected page: `Application-Development.html`.

Previously reported shared stylesheet: `css/master.css`. Inspect all page stylesheet links and inline styles rather than assuming that is the only source. Keep the trial at:

```text
Wissen Dark/css/application-development-typography.css
```

## Why this trial

The user finds the hero and section headings too similar in size, and line spacing unnecessarily loose in some components. Previously reported desktop sizes were 64.8px for hero headings and 55px for section headings: approximately a 1.18:1 relationship. Those figures came from the earlier conversation and were not re-measured here.

The trial increases hierarchy to 72px versus 48px on desktop (1.5:1), with role-specific line heights. This is a design proposal for this website, not a universal typography rule.

## Target scale

Sizes are CSS pixels. Line height is a unitless multiplier.

| Role / data-appdev-type | Desktop >=1200px | Mobile <=520px | Line height |
| --- | ---: | ---: | ---: |
| `hero-title` | 72 | 40 | 1.08 |
| `section-title` | 48 | 30 | 1.15 |
| `card-title` | 24 | 22 | 1.25 |
| `hero-body` | 18 | 16 | 1.5 |
| `body` — section copy / longer paragraphs | 16 | 16 | 1.6 |
| `card-body` — short descriptions | 16 | 15 | 1.45 |
| `card-body-long` — longer card paragraphs | 16 | 15 | 1.6 |
| `label` — existing labels / captions | 12 | 12 | 1.3 |
| `control` — existing content buttons / links | 14 | 14 | 1.2 |

The CSS interpolates fluidly between 520px and 1200px. At the previously discussed example widths of 1440px and 390px, it reaches the desktop and mobile values above.

Heading letter spacing is normalized to `-0.04em` for the hero, `-0.03em` for section headings, and `-0.02em` for card headings so older fixed tracking does not become disproportionately tight at the smaller sizes.

Keep the existing theme font families and weights. Prior conversation identified Manrope headings, DM Sans body text, and Georgia italic emphasis; verify against the local source and preserve what the actual page uses. Preserve colors and italic emphasis.

## Implementation

1. Locate and read the actual page, its linked CSS, and relevant inline styles. Read applicable AGENTS.md instructions. Confirm this is the latest page with the three-phone hero and current content. Do not substitute the old homepage files.
2. Copy the supplied CSS into `Wissen Dark/css/application-development-typography.css`.
3. Append `appdev-type-trial` to the existing body classes. Do not replace existing classes.
4. Add `data-appdev-type` to each relevant text element, selecting the role from the table. Apply the role to the text element itself, not a whole section or card container. Keep semantic heading tags and the existing hierarchy.
5. Add this link at the end of `<head>`, after existing stylesheet links AND inline `<style>` blocks:

   ```html
   <!-- Typography trial: remove this one link to revert. -->
   <link rel="stylesheet" href="css/application-development-typography.css" id="appdev-typography-trial">
   ```

6. Inspect the actual cascade if any local selector or inline declaration overrides the trial. Prefer adjusting the trial's specificity for the real page. If necessary, move a conflicting inline declaration into the original theme with identical behavior, preserving rollback. Never use blanket `!important` declarations or edit shared typography to force the trial through. Check nested heading spans for their own font-size/line-height rules; map a matching role to the text-bearing child only when necessary.
7. Leave layout dimensions and section spacing unchanged initially. Line height controls lines within a text block; margins and padding control space between blocks. Do not use line height to create section whitespace. Preserve readability for longer copy using `body` or `card-body-long`.
8. Report the files changed, the final role mapping, and any remaining limitation. Give the user the rollback instruction below.

Illustrative markup only — map onto the current HTML rather than copying these snippets as replacement content:

```html
<body class="existing-page-class appdev-type-trial">
  <main>
    <section>
      <h1 data-appdev-type="hero-title">Existing hero heading</h1>
      <p data-appdev-type="hero-body">Existing hero introduction.</p>
    </section>
    <section>
      <h2 data-appdev-type="section-title">Existing section heading</h2>
      <p data-appdev-type="body">Existing section copy.</p>
      <article>
        <h3 data-appdev-type="card-title">Existing card heading</h3>
        <p data-appdev-type="card-body">Existing short description.</p>
      </article>
    </section>
  </main>
</body>
```

## Preserve the current page

- This trial is for Application Development only. Do not attach the stylesheet to other pages or modify `master.css`.
- Keep existing content, document copy, imagery, hover effects, and scroll animations.
- Preserve the homepage 3D brain in the center hero phone and English UI screens in the side phones.
- Preserve circle/square abstract artwork in the two “Applications need more than code” cards.
- Keep sections two, three, and four free of links and buttons. Do not introduce heading captions.
- Keep existing service link labels as **Explore**.
- Preserve the dark surfaces and purple accents. Do not add purple section backgrounds.
- Do not style the navigation, footer, metric numerals, icons, or miniature UI inside hero phones through these text roles. Keep the trial focused on the page content hierarchy. The generic proposed navigation row from the earlier discussion is intentionally not applied to the shared header.
- Keep all page dependencies inside Wissen Dark. This CSS adds no external dependencies.

## Review and verification

The user previously asked to do the visual review themselves. Do not run a screenshot/review loop or add automated tests for this reversible CSS change. Perform basic source checks: valid stylesheet path, no shared CSS edits, correct scoping, and no accidental content changes. If browser verification is available and requested, inspect computed typography and wrapping at 1440px and 390px; also check a tablet width and text spacing overrides for clipping. Do not claim rendered verification unless it was actually performed.

## Rollback

Remove or comment out the single link with `id="appdev-typography-trial"`. The original styles then apply again. The body class and data attributes are inert without the stylesheet and may remain, or be removed for cleanup. No original theme rules should have been deleted or altered.

## Suggested first message in the new session

> Read this handoff and the accompanying CSS, then apply the typography trial to the existing local Wissen Dark/Application-Development.html. Inspect the current markup and map the opt-in text roles. Keep the trial in its own CSS file, preserve the original theme, and make rollback possible by removing one stylesheet link. I will do the visual review.
