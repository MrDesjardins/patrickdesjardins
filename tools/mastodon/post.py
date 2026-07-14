import datetime
import json
import mimetypes
import os
import sys
import time
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
    resolve_social_image,
    social_image_alt_text,
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
    media_ids: list[str] | None = None,
) -> dict[str, Any]:
    payload: list[tuple[str, str]] = [("status", text), ("visibility", "public")]
    for media_id in media_ids or []:
        payload.append(("media_ids[]", media_id))
    response = requests.post(
        f"{instance_url.rstrip('/')}/api/v1/statuses",
        headers={"Authorization": f"Bearer {access_token}"},
        data=payload,
        timeout=30,
    )
    response.raise_for_status()
    data = response.json()
    if not isinstance(data.get("id"), str):
        raise RuntimeError("Mastodon response did not include a status id")
    return data


def wait_for_mastodon_media(
    media_id: str,
    *,
    instance_url: str,
    access_token: str,
    timeout_seconds: int = 30,
    interval_seconds: int = 2,
) -> dict[str, Any]:
    deadline = time.monotonic() + timeout_seconds
    headers = {"Authorization": f"Bearer {access_token}"}
    last_status = "not checked"
    while time.monotonic() < deadline:
        response = requests.get(
            f"{instance_url.rstrip('/')}/api/v1/media/{media_id}",
            headers=headers,
            timeout=30,
        )
        last_status = str(response.status_code)
        if response.status_code == 200:
            data = response.json()
            if data.get("url"):
                return data
        elif response.status_code != 206:
            response.raise_for_status()
        time.sleep(interval_seconds)
    raise RuntimeError(
        f"Timed out waiting for Mastodon media {media_id} to process. Last status: {last_status}"
    )


def upload_media_to_mastodon(
    image_path: str,
    *,
    title: str,
    instance_url: str,
    access_token: str,
) -> str:
    with open(image_path, "rb") as file_handle:
        response = requests.post(
            f"{instance_url.rstrip('/')}/api/v2/media",
            headers={"Authorization": f"Bearer {access_token}"},
            files={
                "file": (
                    Path(image_path).name,
                    file_handle,
                    mimetypes.guess_type(image_path)[0] or "image/png",
                )
            },
            data={"description": social_image_alt_text(title)},
            timeout=60,
        )
    response.raise_for_status()
    data = response.json()
    media_id = data.get("id")
    if not isinstance(media_id, str):
        raise RuntimeError("Mastodon media upload response did not include an id")
    if response.status_code == 202 or not data.get("url"):
        wait_for_mastodon_media(
            media_id,
            instance_url=instance_url,
            access_token=access_token,
        )
    print(f"Uploaded image to Mastodon media ID: {media_id}")
    return media_id


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
        title, slug, content, frontmatter = find_post_by_slug(requested_slug)
    else:
        title, slug, content, frontmatter = find_todays_post("MASTODON_POST_DATE_TZ")
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
    if slug is None or content is None or frontmatter is None:
        raise RuntimeError("Matched Mastodon post is missing slug, content, or frontmatter")

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
    media_ids: list[str] = []
    image_path = resolve_social_image(
        title=title,
        slug=slug,
        content=content,
        frontmatter=frontmatter,
    )
    if image_path:
        try:
            media_ids.append(
                upload_media_to_mastodon(
                    image_path,
                    title=title,
                    instance_url=instance_url,
                    access_token=os.environ["MASTODON_ACCESS_TOKEN"],
                )
            )
        except requests.HTTPError as error:
            print(
                f"Mastodon image upload failed ({error.response.status_code}), falling back to text-only post"
            )
        except RuntimeError as error:
            print(f"Mastodon image upload failed, falling back to text-only post: {error}")
    data = post_to_mastodon(
        text,
        instance_url=instance_url,
        access_token=os.environ["MASTODON_ACCESS_TOKEN"],
        media_ids=media_ids,
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
