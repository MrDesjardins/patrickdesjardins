import sys
import types
import unittest
from unittest.mock import patch

from social_common import find_first_image, parse_frontmatter, strip_mdx


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
