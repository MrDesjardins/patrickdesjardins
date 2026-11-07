# Tools

Python tooling for the blog. All tools share a single [uv](https://docs.astral.sh/uv/) environment defined in `pyproject.toml`.

## Setup

Install dependencies (run once, from the repo root):

```bash
uv sync --directory tools
```

This creates `tools/.venv/` and `tools/uv.lock`. Commit `uv.lock` to keep builds reproducible.

Social posting can attach images. If a post does not contain a valid local
Markdown image, the social scripts use the `og-img` CLI (`og render`) to create
a temporary preview image under `/tmp/patrick-social-og/`. Install it locally
when testing image fallback behavior:

```bash
cargo install og-img --locked
```

---

## search

Generates semantic search indexes for:

- Technical blog posts in `src/_posts/` → `tools/search/output/` (local, NumPy) and `public/output/` (site, JSON)
- Philosophy posts in `src/_philosophy/` → `tools/search/output-philosophy/` and `public/philosophy-output/`

**Generate both indexes:**

```bash
uv run --directory tools python search/main.py generate
```

**Search the technical blog index:**

```bash
uv run --directory tools python search/main.py search "your query here"
```

**Search the philosophy index:**

```bash
uv run --directory tools python search/main.py search philosophy "your query here"
```

---

## linkedin

Posts a new item to LinkedIn. By default, it posts technical blog posts from `src/_posts/`. Set `SOCIAL_POST_CONTENT_KIND=philosophy` to post philosophy essays from `src/_philosophy/` with the philosophy-specific prompt. The script uploads the first valid MDX image when present, or a generated `og-img` preview when the article has no image.

**Post today's article:**

```bash
uv run --directory tools python linkedin/post.py
```

**Get your LinkedIn person ID** (run once during setup):

```bash
uv run --directory tools python linkedin/get_id.py
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

LinkedIn's self-serve "Share on LinkedIn" product only issues 60-day access tokens with **no refresh token**, so a human login is required each time; this cannot be fully automated. Rotation is a single command:

```bash
uv run --directory tools python linkedin/rotate_token.py
```

It opens the LinkedIn consent page (if you are already logged in and have granted the scopes, it redirects immediately), catches the redirect on `http://localhost:8765/callback`, exchanges the code, then updates `.env`, the `LINKEDIN_ACCESS_TOKEN` GitHub secret, and the `LINKEDIN_TOKEN_EXPIRES_AT` repository variable. Pass `--no-github` to only update `.env`.

One-time setup:

1. In the [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps), open the app → **Auth** tab and add `http://localhost:8765/callback` under **Authorized redirect URLs**.
2. Copy the app's **Client ID** and **Client Secret** into `.env` as `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET`.
3. Make sure `gh auth status` works locally (needs permission to set repo secrets/variables).

The `LinkedIn token expiry reminder` workflow (`.github/workflows/linkedin-token-check.yml`) runs daily and opens a GitHub issue 10 days before `LINKEDIN_TOKEN_EXPIRES_AT`, or when that variable is unset.

**Refresh tokens:** if the app is ever approved for programmatic refresh (e.g. the Community Management API), LinkedIn returns a 365-day refresh token. `rotate_token.py` then stores `LINKEDIN_REFRESH_TOKEN`, `LINKEDIN_CLIENT_ID` and `LINKEDIN_CLIENT_SECRET` as GitHub secrets, and `post.py` mints a fresh access token on every run (`tools/linkedin/auth.py`), so rotation drops to once a year.

---

## mastodon

Posts a new item to Mastodon and records the discussion thread in
`src/data/mastodon-discussions.json`. The script uploads the first valid MDX
image when present, or a generated `og-img` preview when the article has no
image. If image generation or upload fails, it posts text-only.

Required environment variables:

| Variable | Description |
|---|---|
| `MASTODON_ACCESS_TOKEN` | Mastodon user token with `write:statuses` and `write:media` scopes |
| `MASTODON_INSTANCE_URL` | Mastodon instance URL. Defaults to `https://mastodon.social` in GitHub Actions |
| `SOCIAL_POST_CONTENT_KIND` | Optional. Content source to post from. Default: `blog`. Supported: `philosophy`, `blog`. |
| `MASTODON_POST_DATE_TZ` | Optional. Calendar timezone used to match the post `date`. |
| `MASTODON_POST_SLUG` | Optional. Post a specific slug instead of matching today's date. |
| `MASTODON_WAIT_FOR_POST` | Optional. Set to `0` to skip waiting for the public article URL before posting. |

---

## twitter

X/Twitter posting is intentionally disabled because the X API is not funded yet. This is not a functional issue with the automation. Re-enable the script after API funding is available.

Posts a new item to X/Twitter. By default, it posts technical blog posts from `src/_posts/`. Set `SOCIAL_POST_CONTENT_KIND=philosophy` to post philosophy essays from `src/_philosophy/` with the philosophy-specific prompt. The script uploads the first valid MDX image when present, or a generated `og-img` preview when the article has no image.

**Post today's article:**

```bash
uv run --directory tools python twitter/post.py
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
