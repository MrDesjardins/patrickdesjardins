# Repository Rules for Agents

This repository is Patrick Desjardins' static website and blog. Keep changes simple, static-first, and aligned with the existing writing and build workflow.

## Core Goals

- Preserve the website as a static site. Do not add a runtime server, database, auth flow, or backend dependency unless the user explicitly asks for it.
- Prefer small, deterministic files and build steps over framework-heavy behavior.
- Keep the publishing loop fast. A small content edit should not force unnecessary work.
- Keep article pages readable and fast on mobile.
- When an agent discovers an important architectural, operational, deployment, performance, or correctness detail, it must update this file or the appropriate repository documentation as part of the same work. Do not leave critical knowledge only in the conversation.

## Performance Rules

- Do not put external API calls in the static page generation path unless absolutely required. Static builds should primarily read local files.
- Client-only enhancements must not block the article content from rendering.
- Extra browser work should be scoped to the pages that need it. For example, Mastodon reply loading should only run when a page has a configured thread.
- Avoid adding large dependencies for narrow UI behavior. Use existing React, Vite, CSS modules, and small local helpers first.
- Preserve incremental build behavior. Do not casually change shared files that make every route stale unless the change genuinely affects every route.
- Run `rtk npm run build` after changes that affect routing, shared CSS, client bundles, content rendering, or generated output.

## Static Rendering Correctness

- This project has more than one rendering path. React route files under `src/app/**` are not always the final source of production HTML.
- Blog and philosophy article detail pages may be rendered by the Rust native generator in `tools/sitegen/src/main.rs` for performance.
- If an article-page feature is added in React, verify whether the Rust native renderer must also emit the same static shell.
- Client components only work in production when the generated HTML in `out/` contains their mount point. Adding code to `src/site/client.tsx` is not enough.
- React-rendered static routes use the SSR bundle at `out/server/render.js`; when changing files that feed that renderer, make sure the Rust incremental build invalidates the bundle before rerendering HTML.
- Any feature that depends on data attributes, placeholder roots, IDs, or static page markup must be checked in the generated HTML after `rtk npm run build`.
- Production documents emit canonical, Open Graph, Twitter, and article JSON-LD metadata from both renderers. Keep the head builders in `src/site/render.tsx` and `tools/sitegen/src/main.rs` in sync.
- Philosophy native pages must retain the literal `philosophy-site` wrapper class because `paper-prism.css` scopes its code theme to that class.
- For article-page changes, search the relevant generated file under `out/blog/*.html` or `out/philosophy/*.html` for the expected marker before calling the work complete.
- If a new local data file affects generated article HTML, add it as a route dependency in the Rust generator. Otherwise a data-only edit may not rebuild the affected page.
- When adding behavior to one rendering path, add a regression test for the production path. Prefer a Rust `sitegen` test for native-rendered article markup.

## Mobile and UI Rules

- Article pages must remain readable on narrow screens. Avoid fixed-width UI, wide tables without wrapping, and deeply indented layouts that collapse content.
- For threaded comments or nested content, cap visual indentation and keep deeper content visible.
- Text must not overlap, overflow buttons, or require horizontal scrolling on normal mobile widths.
- Keep UI around articles quiet and content-first. Do not add marketing-style sections, heavy cards, or decorative layout elements to article pages.
- Use CSS modules for component styling and include new modules in `src/site/style-entry.ts` when static extraction needs them.
- The production page links Vite's client CSS only. `style-entry.ts` ensures CSS used by native-rendered HTML is present; do not re-add `static-modules.css` as a second stylesheet.
- `style-entry.ts` only ships CSS if `client.tsx` keeps `staticStyleModules` reachable through an observable side effect (e.g. assigning it to `window`). A bare `void staticStyleModules` lets Rollup tree-shake every static module's stylesheet and silently ship unstyled pages — a dependency bump can flip this with no build error. After any build touching the client bundle or CSS modules, confirm the shared styles shipped: `grep -c "app_layout__" out/assets/client-*.css` must be non-zero (this class backs the site-wide layout, so its absence unstyles every page).

## Accessibility Rules

- CI runs an axe accessibility gate (`tests/accessibility.spec.ts`) over `/`, `/blog`, `/philosophy`, their search pages, and one article each. A single violation fails the build and blocks deploy.
- The axe/Playwright check needs a real browser and cannot run in the agent sandbox (Chromium is blocked). `jsdom` does not resolve computed colors, so a `jsdom` + `axe-core` script silently reports zero color-contrast violations even on a broken page — do not trust it as a substitute. Verify color changes by hand.
- For any color or CSS change, compute WCAG contrast against the ACTUAL rendered colors: resolve the CSS variables in `src/app/layout.module.css` against the section background the text sits on. Section backgrounds alternate `--background2` (#f0f0f0 light) / `--background3` (#fff) / `--background1` (#3a393f dark); body text `--text-color1` (#666), headings `--text-color3` (#000), `--header-color1` (#fff). Need ≥4.5:1 (≥3:1 for large/bold text ≥24px).
- A shared link/text color that passes on one background often fails on another (e.g. white contact links are fine on the dark icon row but fail on the light section). Scope the color to the container whose background it actually sits on.
- Fixing rendering or restoring CSS can UNMASK contrast bugs hidden while elements were unstyled (unstyled ≈ black on white, which passes). Re-audit contrast after any change that alters which styles ship, not just the elements you touched.

## Discovery and Metadata Rules

- Blog categories are public static routes at `/blog/category/{normalized-category}`. Category labels in listings and search results must link to those routes.
- Category normalization is lowercase ASCII with non-alphanumeric runs replaced by `-`. Keep the TypeScript and Rust implementations equivalent.
- Article descriptions default to a plain-text excerpt. Preserve useful frontmatter-free excerpts in metadata, feeds, and search output.
- Search generation must exclude future-dated content using the same UTC publishing boundary as production rendering.
- Article pages should retain back-to-collection and adjacent-article navigation.
- Year archive pages must not show global chronological pagination, because those links leave the selected year archive.

## Mastodon Discussion Rules

- The Mastodon discussion registry is `src/data/mastodon-discussions.json`.
- A thread is keyed by collection and slug:
  - `blog/{slug}` for technical posts
  - `philosophy/{slug}` for philosophy essays
- Same collection plus same slug must keep the same Mastodon thread id.
- Do not create a new Mastodon status when an article is edited and the slug is unchanged.
- It is acceptable that renaming a slug creates a new thread, because it also changes the public URL.
- The site may read public Mastodon replies in the browser, but replying should link to Mastodon unless the user explicitly asks for a real OAuth-backed server flow.
- Render remote Mastodon content as plain text. Do not inject remote HTML into the page.
- Content warnings should remain collapsed inline and link to Mastodon.
- Threaded replies should use `in_reply_to_id`, include a per-message reply link, and remain mobile-friendly.

## CI and Publishing Rules

- Scheduled/manual publishing can create Mastodon threads before the site build, then pass the updated registry as an artifact into `build-site`.
- Registry commits made by CI must use `[skip ci]` to avoid build loops.
- Keep CI jobs split by purpose where possible: quality, search index, Mastodon registry, build, deploy, social posting.
- Do not make content-only pushes pay for unnecessary code checks unless the workflow already requires them.
- Google Analytics is a static build-time concern. The GitHub Pages build must pass `NEXT_PUBLIC_GA_MEASUREMENT_ID` so both the React SSR renderer and Rust native renderer can emit the GA tag into generated HTML.
- Analytics storage defaults to denied and is enabled only after the visitor's explicit choice, persisted in `analytics-consent`.
- GitHub Pages ignores Netlify-style `_headers` directives. Do not rely on `_headers` for security or cache policy without changing the hosting/CDN layer.

## Content Rules

- Technical blog posts live under `src/_posts/{year}/`.
- Philosophy essays live under `src/_philosophy/{year}/`.
- Preserve the existing frontmatter shape:

```md
---
title: "Title"
date: "YYYY-MM-DD"
categories:
 - "category"
---
```

- Match the existing writing style: direct, practical, first-person when useful, concrete examples, and a short conclusion.
- For technical posts, prefer simple sections and explain tradeoffs. When relevant, conclude with pros and cons.

## Verification

Pushing to `master` deploys to production. Never push until every CI check that can run locally passes. Run the full set below — not just the ones related to your change — because a CSS, dependency, or rendering change can break a surface you did not touch.

Use RTK first for commands that can emit medium or high output.

Pre-push checklist (mirror of the CI `quality` and `build-site` jobs):

```bash
rtk npm run files:check
rtk npm run content:validate
rtk npm run images:check
rtk npm run lint
rtk npm run test:ci
rtk npm run build
```

The only CI gate that cannot be reproduced locally is the axe accessibility test (needs a browser; see Accessibility Rules). For CSS/color changes, do the manual contrast audit before pushing, and after a build inspect the generated `out/**` HTML and `out/assets/client-*.css` to confirm the expected classes and colors actually shipped.

For Python tools tests:

```bash
uv run python -m unittest discover tests
```

If `uv` needs cache access and sandboxing blocks it, rerun with the proper escalation instead of changing the command shape.
