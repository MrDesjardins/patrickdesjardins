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

Generates semantic search indexes for:

- Technical blog posts in `src/_posts/` → `tools/search/output/` (local, NumPy) and `public/output/` (site, JSON)
- Philosophy posts in `src/_philosophy/` → `tools/search/output-philosophy/` and `public/philosophy-output/`

**Generate both indexes:**

```bash
uv run --directory tools python tools/search/main.py generate
```

**Search the technical blog index:**

```bash
uv run --directory tools python tools/search/main.py search "your query here"
```

**Search the philosophy index:**

```bash
uv run --directory tools python tools/search/main.py search philosophy "your query here"
```

---

## linkedin

Posts a new item to LinkedIn. By default, it posts technical blog posts from `src/_posts/`. Set `SOCIAL_POST_CONTENT_KIND=philosophy` to post philosophy essays from `src/_philosophy/` with the philosophy-specific prompt and first MDX image when present.

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
| `SOCIAL_POST_CONTENT_KIND` | Optional. Content source to post from. Default: `blog`. Supported: `philosophy`, `blog`. Set to `philosophy` for the essay-specific behavior. |
| `LINKEDIN_BLOG_WAIT_TIMEOUT_SECONDS` | Optional. Max time to wait for the public blog URL to serve the new post before posting to LinkedIn. Default: `600` |
| `LINKEDIN_BLOG_WAIT_INTERVAL_SECONDS` | Optional. Delay between public URL readiness checks. Default: `15` |

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

---

## twitter

X/Twitter posting is intentionally disabled because the X API is not funded yet. This is not a functional issue with the automation. Re-enable the script after API funding is available.

Posts a new item to X/Twitter. By default, it posts technical blog posts from `src/_posts/`. Set `SOCIAL_POST_CONTENT_KIND=philosophy` to post philosophy essays from `src/_philosophy/` with the philosophy-specific prompt and first MDX image when present.

**Post today's article:**

```bash
uv run --directory tools python tools/twitter/post.py
```

Required environment variables:

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Gemini API key |
| `TWITTER_API_KEY` | X API consumer key |
| `TWITTER_API_SECRET` | X API consumer secret |
| `TWITTER_ACCESS_TOKEN` | X user access token |
| `TWITTER_ACCESS_TOKEN_SECRET` | X user access token secret |
| `SOCIAL_POST_CONTENT_KIND` | Optional. Content source to post from. Default: `blog`. Supported: `philosophy`, `blog`. Set to `philosophy` for the essay-specific behavior. |
| `TWITTER_POST_DATE_TZ` | Optional. Calendar timezone used to match the post `date`. |
| `TWITTER_BLOG_WAIT_TIMEOUT_SECONDS` | Optional. Max time to wait for the public blog URL to serve the new post before posting to X. Default: `600` |
| `TWITTER_BLOG_WAIT_INTERVAL_SECONDS` | Optional. Delay between public URL readiness checks. Default: `15` |

Update the same values in GitHub repository secrets before using the workflow automation.
