# mypy: ignore-errors
"""Tests for the X post helper."""

import sys
import types
import unittest
from importlib import import_module
from unittest.mock import patch

google_module = types.ModuleType("google")
genai_module = types.ModuleType("genai")
google_module.genai = genai_module
sys.modules.setdefault("google", google_module)
sys.modules.setdefault("google.genai", genai_module)

dotenv_module = types.ModuleType("dotenv")
dotenv_module.load_dotenv = lambda *args, **kwargs: None
sys.modules.setdefault("dotenv", dotenv_module)

requests_oauthlib_module = types.ModuleType("requests_oauthlib")


class OAuth1Stub:
    pass


requests_oauthlib_module.OAuth1 = OAuth1Stub
sys.modules.setdefault("requests_oauthlib", requests_oauthlib_module)

compose_tweet = import_module("twitter.post").compose_tweet


class TwitterPostTests(unittest.TestCase):
    def test_compose_tweet_appends_url(self):
        tweet = compose_tweet("Short insight #python", "my-post")
        self.assertIn("https://patrickdesjardins.com/blog/my-post", tweet)
        self.assertLessEqual(len(tweet), 280)

    def test_compose_tweet_uses_philosophy_url_when_selected(self):
        with patch.dict("os.environ", {"SOCIAL_POST_CONTENT_KIND": "philosophy"}, clear=False):
            tweet = compose_tweet("Short philosophy note #fable", "my-post")
        self.assertIn("https://patrickdesjardins.com/philosophy/my-post", tweet)
        self.assertLessEqual(len(tweet), 280)

    def test_compose_tweet_truncates_long_text(self):
        tweet = compose_tweet("x" * 400, "my-post")
        self.assertLessEqual(len(tweet), 280)
        self.assertIn("…", tweet)


if __name__ == "__main__":
    unittest.main()
