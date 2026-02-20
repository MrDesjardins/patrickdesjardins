import os, re, sys, datetime, yaml, requests
from google import genai
from dotenv import load_dotenv

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(SCRIPT_DIR, "../../.env"))
BLOG_POSTS_DIR = os.path.join(SCRIPT_DIR, "../../src/_posts/")
BLOG_BASE_URL = "https://patrickdesjardins.com/blog"


def parse_frontmatter(content):
    match = re.match(r'^---\n(.*?\n)---\n', content, flags=re.DOTALL)
    return yaml.safe_load(match.group(1)) if match else {}


def strip_mdx(content):
    body = re.sub(r'^---\n.*?\n---\n', '', content, count=1, flags=re.DOTALL)
    body = re.sub(r'```[\s\S]*?```', '', body)
    body = re.sub(r'`[^`]+`', '', body)
    body = re.sub(r'!\[.*?\]\(.*?\)', '', body)
    body = re.sub(r'\[([^\]]+)\]\(.*?\)', r'\1', body)
    body = re.sub(r'^#{1,6}\s+', '', body, flags=re.MULTILINE)
    body = re.sub(r'^(import|export)\s+.*$', '', body, flags=re.MULTILINE)
    # Strip JSX self-closing tags: <Alert />, <YouTube id="..." />
    body = re.sub(r'<[A-Z][A-Za-z]*[^>]*/>', '', body)
    # Strip JSX block tags: <Alert>...</Alert>
    body = re.sub(r'<[A-Z][A-Za-z]*[^>]*>.*?</[A-Z][A-Za-z]*>', '', body, flags=re.DOTALL)
    # Strip MDX interpolations: {variable}
    body = re.sub(r'\{[^}]*\}', '', body)
    # Strip blockquotes: > text
    body = re.sub(r'^>\s*', '', body, flags=re.MULTILINE)
    # Strip unordered list markers: - item, * item
    body = re.sub(r'^[-*]\s+', '', body, flags=re.MULTILINE)
    # Strip ordered list markers: 1. item
    body = re.sub(r'^\d+\.\s+', '', body, flags=re.MULTILINE)
    body = re.sub(r'\n{3,}', '\n\n', body)
    return body.strip()


def find_todays_post():
    today = datetime.datetime.now(datetime.timezone.utc).date().isoformat()  # "YYYY-MM-DD"
    for root, _, files in os.walk(BLOG_POSTS_DIR):
        for fname in files:
            if not fname.endswith(('.mdx', '.md')):
                continue
            path = os.path.join(root, fname)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            fm = parse_frontmatter(content)
            post_date = str(fm.get('date', ''))[:10]
            if post_date == today:
                slug = re.sub(r'\.(mdx|md)$', '', fname)
                return fm.get('title', 'Untitled'), slug, content
    return None, None, None


def generate_linkedin_text(title, body_text):
    client = genai.Client(api_key=os.environ['GEMINI_API_KEY'])
    prompt = f"""You are a LinkedIn content writer for a software engineering blog.
Write a LinkedIn post for the article titled "{title}".
Rules:
- Start with a compelling 1-2 sentence hook
- Summarize the key insight or takeaway in 2-3 sentences
- Professional but conversational tone
- Do NOT include a URL (it will be appended separately)
- End with 3-5 relevant hashtags
- Stay under 200 words total
- Do not make it cringe or clickbaity

Article content:
{body_text[:4000]}
"""
    response = client.models.generate_content(model='gemini-2.5-flash', contents=prompt)
    return response.text.strip()


def post_to_linkedin(text, title, slug):
    person_id = os.environ['LINKEDIN_PERSON_ID']
    token = os.environ['LINKEDIN_ACCESS_TOKEN']
    url = f"{BLOG_BASE_URL}/{slug}"
    full_text = f"{text}\n\n{url}"
    payload = {
        "author": f"urn:li:person:{person_id}",
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {"text": full_text},
                "shareMediaCategory": "NONE"
            }
        },
        "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"}
    }
    resp = requests.post(
        "https://api.linkedin.com/v2/ugcPosts",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0"
        },
        json=payload
    )
    resp.raise_for_status()
    print(f"Posted to LinkedIn: {resp.headers.get('X-RestLi-Id', resp.status_code)}")


if __name__ == "__main__":
    required_vars = ['GEMINI_API_KEY', 'LINKEDIN_ACCESS_TOKEN', 'LINKEDIN_PERSON_ID']
    missing = [v for v in required_vars if not os.environ.get(v)]
    if missing:
        print(f"Error: Missing required environment variables: {', '.join(missing)}")
        sys.exit(1)

    title, slug, content = find_todays_post()
    if not title:
        print("No post with today's date found. Skipping.")
        sys.exit(0)
    print(f"Found today's post: {title} ({slug})")
    body = strip_mdx(content)
    linkedin_text = generate_linkedin_text(title, body)
    print("Generated LinkedIn text:\n", linkedin_text)
    try:
        post_to_linkedin(linkedin_text, title, slug)
    except requests.HTTPError as e:
        if e.response.status_code == 401:
            print("LinkedIn token expired — rotate LINKEDIN_ACCESS_TOKEN")
        else:
            print(f"LinkedIn API error {e.response.status_code}: {e.response.text}")
        sys.exit(1)
