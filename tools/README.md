# Tools

Python tooling for the blog. All tools share a single [uv](https://docs.astral.sh/uv/) environment defined in `pyproject.toml`.

## Setup

Install dependencies (run once, from the repo root):

```bash
uv sync --directory tools
```

This creates `tools/.venv/` and `tools/uv.lock`. Commit `uv.lock` to keep builds reproducible.

---

## search

Generates a semantic search index over all blog posts in `src/_posts/`.

**Generate the index:**

```bash
uv run --directory tools python tools/search/main.py generate
```

**Search the index:**

```bash
uv run --directory tools python tools/search/main.py search "your query here"
```

Output files are written to `tools/search/output/` (local) and `public/output/` (website).

---

## linkedin

Posts a new article to LinkedIn. Detects any post in `src/_posts/` whose `date` frontmatter matches today, generates a summary via Gemini, and publishes via the LinkedIn UGC API.

**Post today's article:**

```bash
uv run --directory tools python tools/linkedin/post.py
```

**Get your LinkedIn person ID** (run once during setup):

```bash
uv run --directory tools python tools/linkedin/get_id.py
```

Required environment variables:

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Gemini API key |
| `LINKEDIN_ACCESS_TOKEN` | LinkedIn OAuth 2.0 token (expires after ~60 days) |
| `LINKEDIN_PERSON_ID` | Your LinkedIn person ID (from `get_id.py`) |

Copy `.env.example` to `.env` and fill in the values for local use.

### Rotating the LinkedIn Access Token (~every 60 days)

LinkedIn OAuth tokens expire after ~60 days. When the workflow starts failing with a 401, rotate the token:

1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps) and open your app.
2. Navigate to **Auth** tab → **OAuth 2.0 tools**.
3. Click **Request access token**.
4. Select the required scopes: `openid`, `profile`, `email`, `w_member_social`.
5. Click **Request access token** — copy the generated token.
6. Update `.env` locally: set `LINKEDIN_ACCESS_TOKEN=<new token>`.
7. Update the GitHub secret: **repo → Settings → Secrets and variables → Actions → `LINKEDIN_ACCESS_TOKEN` → Update**.
