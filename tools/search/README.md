# Search index generator

Semantic search embeddings for blog and philosophy collections using
`all-MiniLM-L6-v2` (must match the browser model `Xenova/all-MiniLM-L6-v2`).

## Commands

```bash
cd tools
uv run python search/main.py generate
uv run python search/main.py search "rust async"
uv run python search/main.py search philosophy "bridge"
```

## Incremental builds

Generation reuses cached vectors when post content is unchanged:

- `tools/search/output/manifest.json` — blog cache metadata
- `tools/search/output/embeddings.npy` — blog vectors (CLI + cache source)
- `public/output/embeddings.bin` — compact binary for the website

Only new or edited posts are encoded on subsequent runs.

## Local benchmarks

```bash
cd tools

# Full or cold rebuild
time uv run python search/main.py generate

# No-op incremental (expect ~1-5s, "0 encoded")
time uv run python search/main.py generate

# Single post change
touch ../src/_posts/2026/code-quality-2026-with-ai.mdx
time uv run python search/main.py generate

# CLI search sanity
uv run python search/main.py search "rust async"
```

## Website client

The browser loads `index.json` plus `embeddings.bin` (falls back to legacy
`embeddings.json` if needed). See `src/lib/search/loadEmbeddings.ts`.
