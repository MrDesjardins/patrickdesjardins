# mypy: ignore-errors
"""Tests for LinkedIn token resolution and rotation helpers."""

import datetime as dt
import os
import sys
import unittest
from pathlib import Path
from unittest.mock import MagicMock, patch

import requests

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "linkedin"))

import auth  # noqa: E402
import rotate_token  # noqa: E402

CREDS = {
    "LINKEDIN_REFRESH_TOKEN": "refresh",
    "LINKEDIN_CLIENT_ID": "id",
    "LINKEDIN_CLIENT_SECRET": "secret",
}


class ResolveAccessTokenTests(unittest.TestCase):
    def test_static_token_without_refresh_credentials(self):
        with patch.dict(os.environ, {"LINKEDIN_ACCESS_TOKEN": "static"}, clear=True):
            self.assertEqual(auth.resolve_access_token(), "static")

    def test_none_when_nothing_configured(self):
        with patch.dict(os.environ, {}, clear=True):
            self.assertIsNone(auth.resolve_access_token())

    def test_refresh_token_wins(self):
        response = MagicMock()
        response.json.return_value = {"access_token": "fresh"}
        with patch.dict(os.environ, {"LINKEDIN_ACCESS_TOKEN": "static", **CREDS}, clear=True), \
                patch.object(auth.requests, "post", return_value=response) as post:
            self.assertEqual(auth.resolve_access_token(), "fresh")
        self.assertEqual(post.call_args.kwargs["data"]["grant_type"], "refresh_token")

    def test_refresh_failure_falls_back_to_static(self):
        with patch.dict(os.environ, {"LINKEDIN_ACCESS_TOKEN": "static", **CREDS}, clear=True), \
                patch.object(auth.requests, "post", side_effect=requests.ConnectionError("down")):
            self.assertEqual(auth.resolve_access_token(), "static")


class RotateHelperTests(unittest.TestCase):
    def test_upsert_replaces_existing_key(self):
        text = "A=1\nLINKEDIN_ACCESS_TOKEN=old\nB=2\n"
        self.assertEqual(
            rotate_token.upsert_env(text, "LINKEDIN_ACCESS_TOKEN", "new"),
            "A=1\nLINKEDIN_ACCESS_TOKEN=new\nB=2\n",
        )

    def test_upsert_appends_missing_key(self):
        self.assertEqual(rotate_token.upsert_env("A=1", "K", "v"), "A=1\nK=v\n")

    def test_upsert_keeps_backslashes_literal(self):
        self.assertEqual(rotate_token.upsert_env("K=x\n", "K", r"a\1b"), "K=a\\1b\n")

    def test_expiry_date(self):
        issued = dt.datetime(2026, 11, 7, 23, 0, tzinfo=dt.timezone.utc)
        self.assertEqual(rotate_token.expiry_date(issued, 5184000), "2027-01-06")

    def test_authorize_url_contains_redirect_and_scope(self):
        url = rotate_token.build_authorize_url("cid", "st")
        self.assertIn("redirect_uri=http%3A%2F%2Flocalhost%3A8765%2Fcallback", url)
        self.assertIn("w_member_social", url)
        self.assertIn("state=st", url)


if __name__ == "__main__":
    unittest.main()
