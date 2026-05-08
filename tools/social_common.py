import datetime
import os
import random
import re
import sys
import time
from typing import Any

import requests
import yaml
from zoneinfo import ZoneInfo

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BLOG_POSTS_DIR = os.path.join(SCRIPT_DIR, "../src/_posts/")
PHILOSOPHY_POSTS_DIR = os.path.join(SCRIPT_DIR, "../src/_philosophy/")
BLOG_BASE_URL = "https://patrickdesjardins.com/blog"
PHILOSOPHY_BASE_URL = "https://patrickdesjardins.com/philosophy"
DEFAULT_WAIT_TIMEOUT_SECONDS = 600
DEFAULT_WAIT_INTERVAL_SECONDS = 15
GEMINI_RETRY_MAX_ATTEMPTS = 6
GEMINI_RETRY_BASE_DELAY_SECONDS = 5
GEMINI_RETRY_MAX_DELAY_SECONDS = 60

CONTENT_CONFIG = {
    "blog": {"posts_dir": BLOG_POSTS_DIR, "base_url": BLOG_BASE_URL},
    "philosophy": {
        "posts_dir": PHILOSOPHY_POSTS_DIR,
        "base_url": PHILOSOPHY_BASE_URL,
    },
}


def post_calendar_today_iso(env_var_name: str, default_tz_name: str = "UTC") -> str:
    """Calendar date used to match frontmatter `date` (not necessarily UTC)."""
    tz_name = (os.environ.get(env_var_name) or default_tz_name).strip() or default_tz_name
    try:
        tz: datetime.tzinfo = ZoneInfo(tz_name)
    except Exception:
        print(
            f"Warning: invalid {env_var_name}={tz_name!r}, using {default_tz_name}",
            file=sys.stderr,
        )
        tz = datetime.timezone.utc if default_tz_name == "UTC" else ZoneInfo(default_tz_name)
    return datetime.datetime.now(tz).date().isoformat()


def parse_frontmatter(content: str) -> dict[str, Any]:
    match = re.match(r"^---\n(.*?\n)---\n", content, flags=re.DOTALL)
    if not match:
        return {}
    parsed = yaml.safe_load(match.group(1))
    return parsed if isinstance(parsed, dict) else {}


def strip_mdx(content: str) -> str:
    body = re.sub(r"^---\n.*?\n---\n", "", content, count=1, flags=re.DOTALL)
    body = re.sub(r"```[\s\S]*?```", "", body)
    body = re.sub(r"`[^`]+`", "", body)
    body = re.sub(r"!\[.*?\]\(.*?\)", "", body)
    body = re.sub(r"\[([^\]]+)\]\(.*?\)", r"\1", body)
    body = re.sub(r"^#{1,6}\s+", "", body, flags=re.MULTILINE)
    body = re.sub(r"^(import|export)\s+.*$", "", body, flags=re.MULTILINE)
    body = re.sub(r"<[A-Z][A-Za-z]*[^>]*/>", "", body)
    body = re.sub(r"<[A-Z][A-Za-z]*[^>]*>.*?</[A-Z][A-Za-z]*>", "", body, flags=re.DOTALL)
    body = re.sub(r"\{[^}]*\}", "", body)
    body = re.sub(r"^>\s*", "", body, flags=re.MULTILINE)
    body = re.sub(r"^[-*]\s+", "", body, flags=re.MULTILINE)
    body = re.sub(r"^\d+\.\s+", "", body, flags=re.MULTILINE)
    body = re.sub(r"\n{3,}", "\n\n", body)
    return body.strip()


def find_first_image(content: str) -> str | None:
    match = re.search(r"!\[.*?\]\((/images/blog/[^)]+)\)", content)
    if not match:
        return None
    rel_path = match.group(1).lstrip("/")
    abs_path = os.path.join(SCRIPT_DIR, "../public", rel_path)
    return abs_path if os.path.isfile(abs_path) else None


def get_social_content_kind() -> str:
    kind = (os.environ.get("SOCIAL_POST_CONTENT_KIND") or "blog").strip().lower()
    if kind not in CONTENT_CONFIG:
        valid_values = ", ".join(sorted(CONTENT_CONFIG))
        raise ValueError(
            f"Invalid SOCIAL_POST_CONTENT_KIND={kind!r}. Expected one of: {valid_values}"
        )
    return kind


def get_social_content_config() -> dict[str, str]:
    return CONTENT_CONFIG[get_social_content_kind()]


def build_post_url(slug: str) -> str:
    return f"{get_social_content_config()['base_url']}/{slug}"


def format_category_hashtag(frontmatter: dict[str, Any]) -> str | None:
    categories = frontmatter.get("categories")
    if isinstance(categories, list):
        for category in categories:
            if not isinstance(category, str):
                continue
            normalized = re.sub(r"[^A-Za-z0-9]+", "", category.strip())
            if normalized:
                return f"#{normalized.lower()}"
    if isinstance(categories, str):
        normalized = re.sub(r"[^A-Za-z0-9]+", "", categories.strip())
        if normalized:
            return f"#{normalized.lower()}"
    return None


def find_post_by_calendar_date(
    target_date: str,
) -> tuple[str | None, str | None, str | None, dict[str, Any] | None]:
    posts_dir = get_social_content_config()["posts_dir"]
    for root, _, files in os.walk(posts_dir):
        for fname in files:
            if not fname.endswith((".mdx", ".md")):
                continue
            path = os.path.join(root, fname)
            with open(path, "r", encoding="utf-8") as file_handle:
                content = file_handle.read()
            frontmatter = parse_frontmatter(content)
            post_date = str(frontmatter.get("date", ""))[:10]
            if post_date == target_date:
                slug = re.sub(r"\.(mdx|md)$", "", fname)
                return frontmatter.get("title", "Untitled"), slug, content, frontmatter
    return None, None, None, None


def find_todays_post(
    tz_env_var_name: str,
) -> tuple[str | None, str | None, str | None, dict[str, Any] | None]:
    today = post_calendar_today_iso(tz_env_var_name)
    return find_post_by_calendar_date(today)


def generate_gemini_text(
    prompt: str,
    *,
    purpose: str,
    model: str = "gemini-2.5-flash",
    max_attempts: int = GEMINI_RETRY_MAX_ATTEMPTS,
) -> str:
    """Call Gemini's generate_content with retry/backoff on transient server errors.

    The Gemini API frequently returns 503 UNAVAILABLE under load. We retry with
    exponential backoff so a brief spike does not break the daily CI workflow.
    """
    from google import genai
    from google.genai import errors as genai_errors

    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    last_error: Exception | None = None
    for attempt in range(1, max_attempts + 1):
        try:
            response = client.models.generate_content(model=model, contents=prompt)
        except genai_errors.ServerError as error:
            last_error = error
            if attempt == max_attempts:
                break
            delay = min(
                GEMINI_RETRY_MAX_DELAY_SECONDS,
                GEMINI_RETRY_BASE_DELAY_SECONDS * (2 ** (attempt - 1)),
            ) + random.uniform(0, 1)
            print(
                f"Gemini {purpose} request failed with server error "
                f"(attempt {attempt}/{max_attempts}): {error}; retrying in {delay:.1f}s",
                file=sys.stderr,
            )
            time.sleep(delay)
            continue
        text = response.text
        if text is None:
            raise RuntimeError(f"Gemini returned no text for the {purpose}")
        return text.strip()

    assert last_error is not None
    raise RuntimeError(
        f"Gemini {purpose} request failed after {max_attempts} attempts: {last_error}"
    ) from last_error


def wait_for_blog_post_to_be_available(title: str, slug: str, env_prefix: str) -> None:
    timeout_seconds = int(
        os.environ.get(
            f"{env_prefix}_BLOG_WAIT_TIMEOUT_SECONDS", DEFAULT_WAIT_TIMEOUT_SECONDS
        )
    )
    interval_seconds = int(
        os.environ.get(
            f"{env_prefix}_BLOG_WAIT_INTERVAL_SECONDS", DEFAULT_WAIT_INTERVAL_SECONDS
        )
    )
    deadline = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(
        seconds=timeout_seconds
    )
    url = build_post_url(slug)
    expected_title = re.sub(r"\s+", " ", title).strip().lower()
    last_error = "no response received"

    while datetime.datetime.now(datetime.timezone.utc) < deadline:
        try:
            response = requests.get(
                url,
                timeout=20,
                headers={"Cache-Control": "no-cache", "Pragma": "no-cache"},
            )
            normalized_html = re.sub(r"\s+", " ", response.text).lower()
            if response.status_code == 200 and expected_title in normalized_html:
                print(f"Confirmed blog post is publicly available: {url}")
                return
            last_error = (
                f"status={response.status_code}; title_found={expected_title in normalized_html}"
            )
        except requests.RequestException as error:
            last_error = str(error)

        print(
            f"Waiting for blog post to become available at {url} ({last_error}); retrying in {interval_seconds}s"
        )
        time_to_sleep_until = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(
            seconds=interval_seconds
        )
        while datetime.datetime.now(datetime.timezone.utc) < time_to_sleep_until:
            remaining = (
                time_to_sleep_until - datetime.datetime.now(datetime.timezone.utc)
            ).total_seconds()
            if remaining <= 0:
                break
            time.sleep(min(1, remaining))

    raise RuntimeError(
        f"Timed out after {timeout_seconds}s waiting for blog post to become available at {url}. Last result: {last_error}"
    )
