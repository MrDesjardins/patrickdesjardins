import sys
import tempfile
import types
import unittest
from pathlib import Path
from unittest.mock import patch

from social_common import (
    build_post_url,
    find_first_image,
    format_category_hashtag,
    parse_frontmatter,
    post_calendar_today_iso,
    post_target_date_iso,
    resolve_social_image,
    strip_mdx,
)


class _FakeGenaiServerError(Exception):
    pass


def _install_fake_genai(behaviors):
    """Install a stub `google.genai` whose generate_content follows `behaviors`.

    Each entry in `behaviors` is either an Exception instance to raise or a string
    to return as `response.text`. Returns the recorded call count container.
    """
    calls = {"count": 0}

    class _FakeResponse:
        def __init__(self, text):
            self.text = text

    class _FakeModels:
        def generate_content(self, *, model, contents):
            index = calls["count"]
            calls["count"] += 1
            behavior = behaviors[index]
            if isinstance(behavior, Exception):
                raise behavior
            return _FakeResponse(behavior)

    class _FakeClient:
        def __init__(self, *, api_key):
            self.models = _FakeModels()

    google_module = types.ModuleType("google")
    genai_module = types.ModuleType("google.genai")
    genai_module.Client = _FakeClient
    errors_module = types.ModuleType("google.genai.errors")
    errors_module.ServerError = _FakeGenaiServerError
    google_module.genai = genai_module
    sys.modules["google"] = google_module
    sys.modules["google.genai"] = genai_module
    sys.modules["google.genai.errors"] = errors_module
    return calls


class SocialCommonTests(unittest.TestCase):
    def test_parse_frontmatter_extracts_fields(self):
        content = """---
title: Example
date: 2026-05-01
---
Body
"""
        parsed = parse_frontmatter(content)
        self.assertEqual(parsed["title"], "Example")
        self.assertEqual(str(parsed["date"]), "2026-05-01")

    def test_strip_mdx_removes_markup_and_keeps_text(self):
        content = """---
title: Example
---

# Heading

Text with [link](https://example.com) and `code`.

```ts
console.log("test");
```

<YouTube id="abc" />

- bullet
1. numbered
"""
        stripped = strip_mdx(content)
        self.assertIn("Heading", stripped)
        self.assertIn("Text with link and .", stripped)
        self.assertIn("bullet", stripped)
        self.assertIn("numbered", stripped)
        self.assertNotIn("console.log", stripped)
        self.assertNotIn("<YouTube", stripped)

    def test_find_first_image_returns_none_when_missing(self):
        content = "No image here"
        self.assertIsNone(find_first_image(content))

    def test_format_category_hashtag_uses_first_category(self):
        frontmatter = {"categories": ["social commentary", "fable"]}
        self.assertEqual(format_category_hashtag(frontmatter), "#socialcommentary")

    def test_build_post_url_uses_blog_by_default(self):
        self.assertEqual(
            build_post_url("my-post"),
            "https://patrickdesjardins.com/blog/my-post",
        )

    def test_build_post_url_uses_philosophy_when_selected(self):
        with patch.dict("os.environ", {"SOCIAL_POST_CONTENT_KIND": "philosophy"}, clear=False):
            self.assertEqual(
                build_post_url("the-many-kingdoms-of-the-meadow"),
                "https://patrickdesjardins.com/philosophy/the-many-kingdoms-of-the-meadow",
            )

    def test_invalid_social_content_kind_raises(self):
        from social_common import get_social_content_kind

        with patch.dict("os.environ", {"SOCIAL_POST_CONTENT_KIND": "unknown"}, clear=False):
            with self.assertRaises(ValueError):
                get_social_content_kind()

    def test_post_target_date_uses_override_when_set(self):
        with patch.dict(
            "os.environ", {"SOCIAL_POST_DATE_OVERRIDE": "2026-07-09"}, clear=False
        ):
            self.assertEqual(post_target_date_iso("LINKEDIN_POST_DATE_TZ"), "2026-07-09")

    def test_post_target_date_rejects_malformed_override(self):
        with patch.dict(
            "os.environ", {"SOCIAL_POST_DATE_OVERRIDE": "07/09/2026"}, clear=False
        ):
            with self.assertRaises(ValueError):
                post_target_date_iso("LINKEDIN_POST_DATE_TZ")

    def test_post_target_date_falls_back_to_today_when_unset(self):
        with patch.dict("os.environ", {"SOCIAL_POST_DATE_OVERRIDE": ""}, clear=False):
            self.assertEqual(
                post_target_date_iso("LINKEDIN_POST_DATE_TZ"),
                post_calendar_today_iso("LINKEDIN_POST_DATE_TZ"),
            )

    def test_resolve_social_image_uses_existing_image(self):
        with patch("social_common.find_first_image", return_value="/tmp/existing.png"), patch(
            "social_common.generate_social_card_image"
        ) as generate_mock:
            result = resolve_social_image(
                title="Article",
                slug="article",
                content="Body",
                frontmatter={},
            )
        self.assertEqual(result, "/tmp/existing.png")
        generate_mock.assert_not_called()

    def test_resolve_social_image_generates_blog_card_when_image_missing(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            output_dir = Path(temp_dir)

            def fake_run(command, **_kwargs):
                Path(command[command.index("--output") + 1]).write_bytes(b"png")

            with patch("social_common.find_first_image", return_value=None), patch(
                "social_common.SOCIAL_CARD_OUTPUT_DIR", output_dir
            ), patch("social_common.subprocess.run", side_effect=fake_run) as run_mock, patch.dict(
                "os.environ", {"SOCIAL_POST_CONTENT_KIND": "blog"}, clear=False
            ):
                result = resolve_social_image(
                    title="Article",
                    slug="article",
                    content="Long body",
                    frontmatter={"categories": ["TypeScript"]},
                )

        self.assertEqual(result, str(output_dir / "blog-article.png"))
        command = run_mock.call_args.args[0]
        self.assertIn("--bg", command)
        self.assertEqual(command[command.index("--bg") + 1], "#2a2338")
        self.assertEqual(command[command.index("--accent") + 1], "#f775ff")
        self.assertEqual(command[command.index("--tags") + 1], "TypeScript")

    def test_resolve_social_image_generates_philosophy_card_when_image_missing(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            output_dir = Path(temp_dir)

            def fake_run(command, **_kwargs):
                Path(command[command.index("--output") + 1]).write_bytes(b"png")

            with patch("social_common.find_first_image", return_value=None), patch(
                "social_common.SOCIAL_CARD_OUTPUT_DIR", output_dir
            ), patch("social_common.subprocess.run", side_effect=fake_run) as run_mock, patch.dict(
                "os.environ", {"SOCIAL_POST_CONTENT_KIND": "philosophy"}, clear=False
            ):
                result = resolve_social_image(
                    title="Essay",
                    slug="essay",
                    content="Long body",
                    frontmatter={"categories": ["Ethics"]},
                )

        self.assertEqual(result, str(output_dir / "philosophy-essay.png"))
        command = run_mock.call_args.args[0]
        self.assertEqual(command[command.index("--bg") + 1], "#faf8f3")
        self.assertEqual(command[command.index("--accent") + 1], "#284e7a")

    def test_resolve_social_image_returns_none_when_generation_fails(self):
        with patch("social_common.find_first_image", return_value=None), patch(
            "social_common.subprocess.run", side_effect=FileNotFoundError
        ):
            result = resolve_social_image(
                title="Article",
                slug="article",
                content="Body",
                frontmatter={},
            )
        self.assertIsNone(result)


class GenerateGeminiTextTests(unittest.TestCase):
    def test_returns_text_on_success(self):
        calls = _install_fake_genai(["  hello world  "])
        from social_common import generate_gemini_text

        with patch.dict("os.environ", {"GEMINI_API_KEY": "test"}, clear=False):
            result = generate_gemini_text("prompt", purpose="test post")
        self.assertEqual(result, "hello world")
        self.assertEqual(calls["count"], 1)

    def test_retries_on_server_error_then_succeeds(self):
        behaviors = [
            _FakeGenaiServerError("503 UNAVAILABLE"),
            _FakeGenaiServerError("503 UNAVAILABLE"),
            "recovered",
        ]
        calls = _install_fake_genai(behaviors)
        from social_common import generate_gemini_text

        with patch.dict("os.environ", {"GEMINI_API_KEY": "test"}, clear=False), patch(
            "social_common.time.sleep"
        ) as sleep_mock:
            result = generate_gemini_text("prompt", purpose="test post", max_attempts=5)
        self.assertEqual(result, "recovered")
        self.assertEqual(calls["count"], 3)
        self.assertEqual(sleep_mock.call_count, 2)

    def test_raises_after_exhausting_attempts(self):
        behaviors = [_FakeGenaiServerError("503 UNAVAILABLE") for _ in range(4)]
        _install_fake_genai(behaviors)
        from social_common import generate_gemini_text

        with patch.dict("os.environ", {"GEMINI_API_KEY": "test"}, clear=False), patch(
            "social_common.time.sleep"
        ):
            with self.assertRaises(RuntimeError) as ctx:
                generate_gemini_text("prompt", purpose="test post", max_attempts=4)
        self.assertIn("test post", str(ctx.exception))
        self.assertIn("4 attempts", str(ctx.exception))

    def test_raises_when_response_text_is_none(self):
        _install_fake_genai([None])
        from social_common import generate_gemini_text

        with patch.dict("os.environ", {"GEMINI_API_KEY": "test"}, clear=False):
            with self.assertRaises(RuntimeError) as ctx:
                generate_gemini_text("prompt", purpose="test post")
        self.assertIn("no text", str(ctx.exception))


if __name__ == "__main__":
    unittest.main()
