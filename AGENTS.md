# Repository Rules for Agents

This repository is Patrick Desjardins' static website and blog. Keep changes simple, static-first, and aligned with the existing writing and build workflow.

## Core Goals

- Preserve the website as a static site. Do not add a runtime server, database, auth flow, or backend dependency unless the user explicitly asks for it.
- Prefer small, deterministic files and build steps over framework-heavy behavior.
- Keep the publishing loop fast. A small content edit should not force unnecessary work.
- Keep article pages readable and fast on mobile.

## Performance Rules

- Do not put external API calls in the static page generation path unless absolutely required. Static builds should primarily read local files.
- Client-only enhancements must not block the article content from rendering.
- Extra browser work should be scoped to the pages that need it. For example, Mastodon reply loading should only run when a page has a configured thread.
- Avoid adding large dependencies for narrow UI behavior. Use existing React, Vite, CSS modules, and small local helpers first.
- Preserve incremental build behavior. Do not casually change shared files that make every route stale unless the change genuinely affects every route.
- Run `rtk npm run build` after changes that affect routing, shared CSS, client bundles, content rendering, or generated output.

## Mobile and UI Rules

- Article pages must remain readable on narrow screens. Avoid fixed-width UI, wide tables without wrapping, and deeply indented layouts that collapse content.
- For threaded comments or nested content, cap visual indentation and keep deeper content visible.
- Text must not overlap, overflow buttons, or require horizontal scrolling on normal mobile widths.
- Keep UI around articles quiet and content-first. Do not add marketing-style sections, heavy cards, or decorative layout elements to article pages.
- Use CSS modules for component styling and include new modules in `src/site/style-entry.ts` when static extraction needs them.

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

Use RTK first for commands that can emit medium or high output.

Common checks:

```bash
rtk npm run content:validate
rtk npm run test:ci
rtk npm run lint
rtk npm run build
```

For Python tools tests:

```bash
uv run python -m unittest discover tests
```

If `uv` needs cache access and sandboxing blocks it, rerun with the proper escalation instead of changing the command shape.
