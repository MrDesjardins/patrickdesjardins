import os
import sys

import requests
from dotenv import load_dotenv
from requests_oauthlib import OAuth1

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from social_common import (
    SCRIPT_DIR,
    build_post_url,
    format_category_hashtag,
    find_first_image,
    find_todays_post,
    generate_gemini_text,
    get_social_content_kind,
    post_calendar_today_iso,
    strip_mdx,
    wait_for_blog_post_to_be_available,
)

load_dotenv(os.path.join(SCRIPT_DIR, "../.env"))

TWEET_MAX_LENGTH = 280


def build_oauth1() -> OAuth1:
    return OAuth1(
        os.environ["TWITTER_API_KEY"],
        os.environ["TWITTER_API_SECRET"],
        os.environ["TWITTER_ACCESS_TOKEN"],
        os.environ["TWITTER_ACCESS_TOKEN_SECRET"],
    )


def generate_twitter_text(title: str, body_text: str) -> str:
    prompt = f"""You are writing a post for X for a software engineering blog article titled "{title}".
Write a single post body before the URL is appended separately.
Rules:
- 1-2 sentences maximum
- Focus on one technical insight or concrete takeaway
- No fluff, no clickbait, no emojis
- Do NOT include a URL
- End with 1-2 relevant hashtags
- Never use this character: —
- Keep it comfortably under 220 characters

Article content:
{body_text[:4000]}
"""
    return generate_gemini_text(prompt, purpose="X post")


def generate_philosophy_twitter_text(
    title: str, body_text: str, category_hashtag: str | None
) -> str:
    hashtag_line = category_hashtag or "#philosophy"
    prompt = f"""You are writing a post for X about a philosophy essay titled "{title}".
Write a single post body before the URL is appended separately.
Rules:
- 1-2 sentences maximum
- Explicitly call it a philosophical essay
- Briefly describe the essay's topic in 1-2 concise sentences
- No fluff, no clickbait, no emojis
- Do NOT include a URL
- End with exactly this hashtag: {hashtag_line}
- Never use this character: —
- Keep it comfortably under 220 characters

Essay content:
{body_text[:4000]}
"""
    return generate_gemini_text(prompt, purpose="X post")


def compose_tweet(text: str, slug: str) -> str:
    url = build_post_url(slug)
    normalized_text = " ".join(text.split())
    available_length = TWEET_MAX_LENGTH - len(url) - 1
    if available_length <= 0:
        raise ValueError("Blog URL leaves no room for tweet text")
    if len(normalized_text) > available_length:
        normalized_text = normalized_text[: available_length - 1].rstrip() + "…"
    return f"{normalized_text}\n{url}"


def upload_media(image_path: str) -> str:
    with open(image_path, "rb") as file_handle:
        response = requests.post(
            "https://upload.twitter.com/1.1/media/upload.json",
            auth=build_oauth1(),
            files={"media": file_handle},
            timeout=30,
        )
    response.raise_for_status()
    media_id = response.json()["media_id_string"]
    print(f"Uploaded image to X media ID: {media_id}")
    return media_id


def post_to_twitter(text: str, media_id: str | None = None) -> None:
    payload: dict[str, object] = {"text": text}
    if media_id:
        payload["media"] = {"media_ids": [media_id]}
    response = requests.post(
        "https://api.x.com/2/tweets",
        auth=build_oauth1(),
        json=payload,
        timeout=30,
    )
    response.raise_for_status()
    tweet_id = response.json().get("data", {}).get("id", "unknown")
    print(f"Posted to X: {tweet_id}")


if __name__ == "__main__":
    required_vars = [
        "GEMINI_API_KEY",
        "TWITTER_API_KEY",
        "TWITTER_API_SECRET",
        "TWITTER_ACCESS_TOKEN",
        "TWITTER_ACCESS_TOKEN_SECRET",
    ]
    missing = [var_name for var_name in required_vars if not os.environ.get(var_name)]
    if missing:
        print(f"Error: Missing required environment variables: {', '.join(missing)}")
        sys.exit(1)

    title, slug, content, frontmatter = find_todays_post("TWITTER_POST_DATE_TZ")
    if not title:
        tz_label = (os.environ.get("TWITTER_POST_DATE_TZ") or "UTC").strip() or "UTC"
        content_kind = get_social_content_kind()
        print(
            f"No {content_kind} post with date {post_calendar_today_iso('TWITTER_POST_DATE_TZ')} (calendar day in {tz_label}) found. Skipping."
        )
        sys.exit(0)
    if slug is None or content is None or frontmatter is None:
        raise RuntimeError("Matched X post is missing slug or content")

    print(f"Found today's post: {title} ({slug})")
    body = strip_mdx(content)
    if get_social_content_kind() == "philosophy":
        twitter_text = generate_philosophy_twitter_text(
            title, body, format_category_hashtag(frontmatter)
        )
    else:
        twitter_text = generate_twitter_text(title, body)
    tweet = compose_tweet(twitter_text, slug)
    print("Generated X post:\n", tweet)

    media_id = None
    image_path = find_first_image(content)
    if image_path:
        print(f"Found blog image: {image_path}")
        try:
            media_id = upload_media(image_path)
        except requests.HTTPError as error:
            print(
                f"Image upload failed ({error.response.status_code}), falling back to text-only post"
            )
    else:
        print("No blog image found, posting text-only")

    try:
        wait_for_blog_post_to_be_available(title, slug, "TWITTER")
        post_to_twitter(tweet, media_id=media_id)
    except ValueError as error:
        print(f"Tweet composition error: {error}")
        sys.exit(1)
    except requests.HTTPError as error:
        if error.response.status_code in (401, 403):
            print(
                f"X API authentication/authorization error {error.response.status_code}: {error.response.text}"
            )
        else:
            print(f"X API error {error.response.status_code}: {error.response.text}")
        sys.exit(1)
    except RuntimeError as error:
        print(str(error))
        sys.exit(1)
