import datetime
import json
import os
import sys
from pathlib import Path
from typing import Any

import requests
from dotenv import load_dotenv

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from social_common import (
    SCRIPT_DIR,
    build_post_url,
    find_todays_post,
    format_category_hashtag,
    get_social_content_config,
    get_social_content_kind,
    parse_frontmatter,
    post_calendar_today_iso,
    wait_for_blog_post_to_be_available,
)

load_dotenv(os.path.join(SCRIPT_DIR, "../.env"))

REGISTRY_PATH = Path(SCRIPT_DIR) / "../src/data/mastodon-discussions.json"
MASTODON_MAX_LENGTH = 500


def empty_registry() -> dict[str, dict[str, Any]]:
    return {"blog": {}, "philosophy": {}}


def read_registry(path: Path | None = None) -> dict[str, dict[str, Any]]:
    path = path or REGISTRY_PATH
    if not path.exists():
        return empty_registry()
    with path.open("r", encoding="utf-8") as file_handle:
        data = json.load(file_handle)
    registry = empty_registry()
    for kind in registry:
        if isinstance(data.get(kind), dict):
            registry[kind] = data[kind]
    return registry


def write_registry(
    registry: dict[str, dict[str, Any]], path: Path | None = None
) -> None:
    path = path or REGISTRY_PATH
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as file_handle:
        json.dump(registry, file_handle, indent=2, sort_keys=True)
        file_handle.write("\n")


def compose_status(title: str, slug: str, frontmatter: dict[str, Any]) -> str:
    kind = get_social_content_kind()
    url = build_post_url(slug)
    hashtag = format_category_hashtag(frontmatter)
    if kind == "philosophy":
        label = "New philosophical essay"
        fallback_hashtag = "#philosophy"
    else:
        label = "New technical article"
        fallback_hashtag = "#softwareengineering"

    text = f"{label}: {title}\n\n{url}\n\n{hashtag or fallback_hashtag}"
    if len(text) <= MASTODON_MAX_LENGTH:
        return text

    reserved = len(f"{label}: \n\n{url}\n\n{hashtag or fallback_hashtag}") + 1
    title_limit = max(20, MASTODON_MAX_LENGTH - reserved)
    shortened_title = title[: title_limit - 1].rstrip() + "…"
    return f"{label}: {shortened_title}\n\n{url}\n\n{hashtag or fallback_hashtag}"


def find_post_by_slug(
    slug: str,
) -> tuple[str | None, str | None, str | None, dict[str, Any] | None]:
    posts_dir = get_social_content_config()["posts_dir"]
    for path in Path(posts_dir).rglob("*"):
        if path.suffix not in {".md", ".mdx"} or path.stem != slug:
            continue
        content = path.read_text(encoding="utf-8")
        frontmatter = parse_frontmatter(content)
        return frontmatter.get("title", "Untitled"), slug, content, frontmatter
    return None, None, None, None


def post_to_mastodon(
    text: str,
    *,
    instance_url: str,
    access_token: str,
) -> dict[str, Any]:
    response = requests.post(
        f"{instance_url.rstrip('/')}/api/v1/statuses",
        headers={"Authorization": f"Bearer {access_token}"},
        json={"status": text, "visibility": "public"},
        timeout=30,
    )
    response.raise_for_status()
    data = response.json()
    if not isinstance(data.get("id"), str):
        raise RuntimeError("Mastodon response did not include a status id")
    return data


def should_run_for_event() -> bool:
    return os.environ.get("GITHUB_EVENT_NAME") in {"schedule", "workflow_dispatch", None}


def should_wait_for_post() -> bool:
    return os.environ.get("MASTODON_WAIT_FOR_POST", "1").strip().lower() not in {
        "0",
        "false",
        "no",
    }


def main() -> int:
    if not should_run_for_event():
        print("Mastodon posting only runs for schedule and workflow_dispatch events.")
        return 0

    required_vars = ["MASTODON_ACCESS_TOKEN", "MASTODON_INSTANCE_URL"]
    missing = [var_name for var_name in required_vars if not os.environ.get(var_name)]
    if missing:
        print(f"Error: Missing required environment variables: {', '.join(missing)}")
        return 1

    requested_slug = (os.environ.get("MASTODON_POST_SLUG") or "").strip()
    if requested_slug:
        title, slug, _content, frontmatter = find_post_by_slug(requested_slug)
    else:
        title, slug, _content, frontmatter = find_todays_post("MASTODON_POST_DATE_TZ")
    if not title:
        if requested_slug:
            content_kind = get_social_content_kind()
            print(f"No {content_kind} post with slug {requested_slug!r} found. Skipping.")
            return 0
        tz_label = (os.environ.get("MASTODON_POST_DATE_TZ") or "UTC").strip() or "UTC"
        content_kind = get_social_content_kind()
        print(
            f"No {content_kind} post with date {post_calendar_today_iso('MASTODON_POST_DATE_TZ')} (calendar day in {tz_label}) found. Skipping."
        )
        return 0
    if slug is None or frontmatter is None:
        raise RuntimeError("Matched Mastodon post is missing slug or frontmatter")

    kind = get_social_content_kind()
    registry = read_registry()
    if slug in registry[kind]:
        print(f"Mastodon discussion already registered for {kind}/{slug}; skipping.")
        return 0

    text = compose_status(title, slug, frontmatter)
    print("Generated Mastodon status:\n", text)

    if should_wait_for_post():
        wait_for_blog_post_to_be_available(title, slug, "MASTODON")
    else:
        print("Skipping public availability wait before Mastodon post.")
    instance_url = os.environ["MASTODON_INSTANCE_URL"].rstrip("/")
    data = post_to_mastodon(
        text,
        instance_url=instance_url,
        access_token=os.environ["MASTODON_ACCESS_TOKEN"],
    )

    registry[kind][slug] = {
        "instanceUrl": instance_url,
        "statusId": data["id"],
        "statusUrl": data.get("url") or f"{instance_url}/@mrdesjardins/{data['id']}",
        "postedAt": datetime.datetime.now(datetime.timezone.utc)
        .replace(microsecond=0)
        .isoformat()
        .replace("+00:00", "Z"),
    }
    write_registry(registry)
    print(f"Registered Mastodon discussion for {kind}/{slug}: {registry[kind][slug]['statusUrl']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
