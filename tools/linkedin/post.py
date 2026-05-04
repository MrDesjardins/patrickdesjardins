import os
import sys
from typing import Any

import requests
from dotenv import load_dotenv
from google import genai

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from social_common import (
    BLOG_BASE_URL,
    SCRIPT_DIR,
    find_first_image,
    find_todays_post,
    post_calendar_today_iso,
    strip_mdx,
    wait_for_blog_post_to_be_available,
)

load_dotenv(os.path.join(SCRIPT_DIR, "../.env"))


def require_generated_text(response_text: str | None) -> str:
    if response_text is None:
        raise RuntimeError("Gemini returned no text for the LinkedIn post")
    return response_text.strip()


def generate_linkedin_text(title: str, body_text: str) -> str:
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    prompt = f"""You are a LinkedIn content writer for a software engineering blog.
Write a LinkedIn post for the article titled "{title}".
Rules:
- 2-3 sentences maximum
- One key insight or takeaway, no fluff
- Professional but conversational tone
- Do NOT include a URL
- End with 2-3 relevant hashtags on their own line
- Do not make it cringe or clickbaity
- Never use this character: —
- Invite the reader to check out the article

    Article content:
{body_text[:4000]}
"""
    response = client.models.generate_content(model="gemini-2.5-flash", contents=prompt)
    return require_generated_text(response.text)


def upload_image_to_linkedin(image_path: str, person_id: str, token: str) -> str:
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
    }
    register_payload = {
        "registerUploadRequest": {
            "recipes": ["urn:li:digitalmediaRecipe:feedshare-image"],
            "owner": f"urn:li:person:{person_id}",
            "serviceRelationships": [
                {
                    "relationshipType": "OWNER",
                    "identifier": "urn:li:userGeneratedContent",
                }
            ],
        }
    }
    response = requests.post(
        "https://api.linkedin.com/v2/assets?action=registerUpload",
        headers=headers,
        json=register_payload,
    )
    response.raise_for_status()
    data = response.json()
    upload_url = data["value"]["uploadMechanism"][
        "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
    ]["uploadUrl"]
    asset = data["value"]["asset"]

    with open(image_path, "rb") as file_handle:
        put_response = requests.put(
            upload_url,
            headers={"Authorization": f"Bearer {token}"},
            data=file_handle.read(),
        )
        put_response.raise_for_status()

    print(f"Uploaded image to LinkedIn asset: {asset}")
    return asset


def post_to_linkedin(text: str, slug: str, asset_urn: str | None = None) -> None:
    person_id = os.environ["LINKEDIN_PERSON_ID"]
    token = os.environ["LINKEDIN_ACCESS_TOKEN"]
    url = f"{BLOG_BASE_URL}/{slug}"
    full_text = f"New blog post: {url}\n\n{text}"
    share_content: dict[str, Any] = {
        "shareCommentary": {"text": full_text},
        "shareMediaCategory": "IMAGE" if asset_urn else "NONE",
    }
    if asset_urn:
        share_content["media"] = [{"status": "READY", "media": asset_urn}]
    payload = {
        "author": f"urn:li:person:{person_id}",
        "lifecycleState": "PUBLISHED",
        "specificContent": {"com.linkedin.ugc.ShareContent": share_content},
        "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"},
    }
    response = requests.post(
        "https://api.linkedin.com/v2/ugcPosts",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
        },
        json=payload,
    )
    response.raise_for_status()
    print(f"Posted to LinkedIn: {response.headers.get('X-RestLi-Id', response.status_code)}")


if __name__ == "__main__":
    required_vars = ["GEMINI_API_KEY", "LINKEDIN_ACCESS_TOKEN", "LINKEDIN_PERSON_ID"]
    missing = [var_name for var_name in required_vars if not os.environ.get(var_name)]
    if missing:
        print(f"Error: Missing required environment variables: {', '.join(missing)}")
        sys.exit(1)

    title, slug, content = find_todays_post("LINKEDIN_POST_DATE_TZ")
    if not title:
        tz_label = (os.environ.get("LINKEDIN_POST_DATE_TZ") or "UTC").strip() or "UTC"
        print(
            f"No post with date {post_calendar_today_iso('LINKEDIN_POST_DATE_TZ')} (calendar day in {tz_label}) found. Skipping."
        )
        sys.exit(0)
    if slug is None or content is None:
        raise RuntimeError("Matched LinkedIn post is missing slug or content")

    print(f"Found today's post: {title} ({slug})")
    body = strip_mdx(content)
    linkedin_text = generate_linkedin_text(title, body)
    print("Generated LinkedIn text:\n", linkedin_text)

    asset_urn = None
    image_path = find_first_image(content)
    if image_path:
        print(f"Found blog image: {image_path}")
        try:
            asset_urn = upload_image_to_linkedin(
                image_path,
                os.environ["LINKEDIN_PERSON_ID"],
                os.environ["LINKEDIN_ACCESS_TOKEN"],
            )
        except requests.HTTPError as error:
            print(
                f"Image upload failed ({error.response.status_code}), falling back to text-only post"
            )
    else:
        print("No blog image found, posting text-only")

    try:
        wait_for_blog_post_to_be_available(title, slug, "LINKEDIN")
        post_to_linkedin(linkedin_text, slug, asset_urn=asset_urn)
    except requests.HTTPError as error:
        if error.response.status_code == 401:
            print("LinkedIn token expired — rotate LINKEDIN_ACCESS_TOKEN")
        else:
            print(f"LinkedIn API error {error.response.status_code}: {error.response.text}")
        sys.exit(1)
    except RuntimeError as error:
        print(str(error))
        sys.exit(1)
