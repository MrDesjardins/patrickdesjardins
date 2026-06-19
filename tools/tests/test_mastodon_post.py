# mypy: ignore-errors
import json
import sys
import tempfile
import types
import unittest
from importlib import import_module
from pathlib import Path
from unittest.mock import patch

dotenv_module = types.ModuleType("dotenv")
dotenv_module.load_dotenv = lambda *args, **kwargs: None
sys.modules.setdefault("dotenv", dotenv_module)

mastodon_post = import_module("mastodon.post")


class MastodonPostTests(unittest.TestCase):
    def test_registry_read_write_round_trip(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "mastodon-discussions.json"
            registry = mastodon_post.empty_registry()
            registry["blog"]["article"] = {
                "instanceUrl": "https://mastodon.social",
                "statusId": "123",
                "statusUrl": "https://mastodon.social/@mrdesjardins/123",
                "postedAt": "2026-06-19T00:00:00Z",
            }
            mastodon_post.write_registry(registry, path)
            self.assertEqual(mastodon_post.read_registry(path), registry)

    def test_compose_status_for_blog(self):
        with patch.dict("os.environ", {"SOCIAL_POST_CONTENT_KIND": "blog"}, clear=False):
            text = mastodon_post.compose_status(
                "A Useful TypeScript Pattern",
                "typescript-pattern",
                {"categories": ["TypeScript"]},
            )
        self.assertIn("New technical article", text)
        self.assertIn("https://patrickdesjardins.com/blog/typescript-pattern", text)
        self.assertIn("#typescript", text)
        self.assertLessEqual(len(text), 500)

    def test_compose_status_for_philosophy(self):
        with patch.dict(
            "os.environ", {"SOCIAL_POST_CONTENT_KIND": "philosophy"}, clear=False
        ):
            text = mastodon_post.compose_status(
                "The Garden of Reasons",
                "garden-of-reasons",
                {"categories": ["Ethics"]},
            )
        self.assertIn("New philosophical essay", text)
        self.assertIn("https://patrickdesjardins.com/philosophy/garden-of-reasons", text)
        self.assertIn("#ethics", text)

    def test_post_to_mastodon_sends_status_payload(self):
        class Response:
            def raise_for_status(self):
                return None

            def json(self):
                return {"id": "123", "url": "https://mastodon.social/@mrdesjardins/123"}

        with patch("mastodon.post.requests.post", return_value=Response()) as post_mock:
            data = mastodon_post.post_to_mastodon(
                "hello",
                instance_url="https://mastodon.social/",
                access_token="token",
            )

        self.assertEqual(data["id"], "123")
        post_mock.assert_called_once_with(
            "https://mastodon.social/api/v1/statuses",
            headers={"Authorization": "Bearer token"},
            json={"status": "hello", "visibility": "public"},
            timeout=30,
        )

    def test_find_post_by_slug_reads_selected_collection(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            posts_dir = Path(temp_dir) / "philosophy"
            posts_dir.mkdir()
            (posts_dir / "selected.mdx").write_text(
                """---
title: Selected Essay
date: "2026-06-14"
categories:
 - "fable"
---
Body
""",
                encoding="utf-8",
            )
            with patch.dict(
                "social_common.CONTENT_CONFIG",
                {
                    "blog": {"posts_dir": str(posts_dir), "base_url": "https://example.com/blog"},
                    "philosophy": {
                        "posts_dir": str(posts_dir),
                        "base_url": "https://example.com/philosophy",
                    },
                },
                clear=False,
            ), patch.dict(
                "os.environ", {"SOCIAL_POST_CONTENT_KIND": "philosophy"}, clear=False
            ):
                title, slug, content, frontmatter = mastodon_post.find_post_by_slug(
                    "selected"
                )

        self.assertEqual(title, "Selected Essay")
        self.assertEqual(slug, "selected")
        self.assertIn("Body", content)
        self.assertEqual(frontmatter["categories"], ["fable"])

    def test_main_skips_when_registry_already_has_slug(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "registry.json"
            path.write_text(
                json.dumps(
                    {
                        "blog": {"article": {"statusId": "123"}},
                        "philosophy": {},
                    }
                ),
                encoding="utf-8",
            )
            with patch("mastodon.post.REGISTRY_PATH", path), patch(
                "mastodon.post.find_todays_post",
                return_value=("Article", "article", "content", {}),
            ), patch.dict(
                "os.environ",
                {
                    "SOCIAL_POST_CONTENT_KIND": "blog",
                    "MASTODON_ACCESS_TOKEN": "token",
                    "MASTODON_INSTANCE_URL": "https://mastodon.social",
                    "GITHUB_EVENT_NAME": "schedule",
                },
                clear=False,
            ), patch("mastodon.post.post_to_mastodon") as post_mock:
                result = mastodon_post.main()

        self.assertEqual(result, 0)
        post_mock.assert_not_called()

    def test_main_posts_and_writes_registry(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "registry.json"
            with patch("mastodon.post.REGISTRY_PATH", path), patch(
                "mastodon.post.find_todays_post",
                return_value=("Article", "article", "content", {"categories": ["Python"]}),
            ), patch.dict(
                "os.environ",
                {
                    "SOCIAL_POST_CONTENT_KIND": "blog",
                    "MASTODON_ACCESS_TOKEN": "token",
                    "MASTODON_INSTANCE_URL": "https://mastodon.social",
                    "MASTODON_WAIT_FOR_POST": "0",
                    "GITHUB_EVENT_NAME": "schedule",
                },
                clear=False,
            ), patch(
                "mastodon.post.post_to_mastodon",
                return_value={
                    "id": "123",
                    "url": "https://mastodon.social/@mrdesjardins/123",
                },
            ):
                result = mastodon_post.main()

            registry = json.loads(path.read_text(encoding="utf-8"))

        self.assertEqual(result, 0)
        self.assertEqual(registry["blog"]["article"]["statusId"], "123")

    def test_main_uses_slug_override(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "registry.json"
            with patch("mastodon.post.REGISTRY_PATH", path), patch(
                "mastodon.post.find_post_by_slug",
                return_value=("Essay", "essay", "content", {"categories": ["fable"]}),
            ) as find_mock, patch.dict(
                "os.environ",
                {
                    "SOCIAL_POST_CONTENT_KIND": "philosophy",
                    "MASTODON_ACCESS_TOKEN": "token",
                    "MASTODON_INSTANCE_URL": "https://mastodon.social",
                    "MASTODON_POST_SLUG": "essay",
                    "MASTODON_WAIT_FOR_POST": "0",
                    "GITHUB_EVENT_NAME": "workflow_dispatch",
                },
                clear=False,
            ), patch(
                "mastodon.post.post_to_mastodon",
                return_value={
                    "id": "123",
                    "url": "https://mastodon.social/@mrdesjardins/123",
                },
            ):
                result = mastodon_post.main()

        self.assertEqual(result, 0)
        find_mock.assert_called_once_with("essay")


if __name__ == "__main__":
    unittest.main()
