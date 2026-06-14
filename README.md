[![GitHub Pages](https://github.com/MrDesjardins/patrickdesjardins/actions/workflows/main.yml/badge.svg)](https://github.com/MrDesjardins/patrickdesjardins/actions/workflows/main.yml)

# Description

This is the code for Patrick Desjardins' website and blog. NextJS is the static site generation (SSG) system.

# Code Style

Themes: https://github.com/PrismJS/prism-themes

# Authoring

Create a post:

```bash
npm run content:new -- --title "My Post Title" --date 2026-06-14 --kind blog
```

Use `--kind philosophy` for philosophy essays and `--extension md` when MD is
preferred over MDX.

Validate and preview:

```bash
npm run content:validate
npm run images:check
npm run dev
```

Optimize oversized referenced images before publishing:

```bash
npm run images:optimize
```

Publish by pushing to `master`; CI validates content, generates search assets,
builds the static export, runs accessibility checks, and deploys GitHub Pages.
