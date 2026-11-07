"""Rotate the LinkedIn access token in one command.

Runs the OAuth 2.0 authorization-code flow against a local callback, then
updates the local .env, the GitHub Actions secrets, and the
LINKEDIN_TOKEN_EXPIRES_AT repository variable used by the expiry reminder.

One-time setup: in the LinkedIn developer portal (app -> Auth tab) add
    http://localhost:8765/callback
as an authorized redirect URL, and put LINKEDIN_CLIENT_ID and
LINKEDIN_CLIENT_SECRET in the repository .env.

Usage:
    uv run --directory tools python linkedin/rotate_token.py [--no-github]
"""

import argparse
import datetime as dt
import http.server
import os
import re
import secrets
import shutil
import subprocess
import sys
import threading
import urllib.parse
import webbrowser
from pathlib import Path

import requests
from dotenv import load_dotenv

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

from auth import TOKEN_URL  # noqa: E402

ENV_PATH = SCRIPT_DIR.parent.parent / ".env"
REPO = "MrDesjardins/patrickdesjardins"
PORT = 8765
REDIRECT_URI = f"http://localhost:{PORT}/callback"
SCOPES = "openid profile email w_member_social"
AUTHORIZE_URL = "https://www.linkedin.com/oauth/v2/authorization"


def build_authorize_url(client_id: str, state: str) -> str:
    query = urllib.parse.urlencode(
        {
            "response_type": "code",
            "client_id": client_id,
            "redirect_uri": REDIRECT_URI,
            "state": state,
            "scope": SCOPES,
        }
    )
    return f"{AUTHORIZE_URL}?{query}"


def wait_for_code(expected_state: str, timeout_seconds: int = 300) -> str:
    result: dict[str, str] = {}
    done = threading.Event()

    class Handler(http.server.BaseHTTPRequestHandler):
        def do_GET(self) -> None:  # noqa: N802
            parsed = urllib.parse.urlparse(self.path)
            if parsed.path != "/callback":
                self.send_response(404)
                self.end_headers()
                return
            params = urllib.parse.parse_qs(parsed.query)
            if params.get("state", [""])[0] != expected_state:
                result["error"] = "state mismatch"
            elif "error" in params:
                result["error"] = params.get("error_description", params["error"])[0]
            else:
                result["code"] = params.get("code", [""])[0]
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.end_headers()
            message = "LinkedIn token received. You can close this tab." if "code" in result else f"Failed: {result.get('error')}"
            self.wfile.write(message.encode())
            done.set()

        def log_message(self, format: str, *args: object) -> None:  # noqa: A002
            return

    server = http.server.HTTPServer(("127.0.0.1", PORT), Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        if not done.wait(timeout_seconds):
            raise RuntimeError("Timed out waiting for the LinkedIn redirect")
    finally:
        server.shutdown()
    if "code" not in result or not result["code"]:
        raise RuntimeError(f"Authorization failed: {result.get('error', 'no code')}")
    return result["code"]


def exchange_code(code: str, client_id: str, client_secret: str) -> dict:
    response = requests.post(
        TOKEN_URL,
        data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": REDIRECT_URI,
            "client_id": client_id,
            "client_secret": client_secret,
        },
        timeout=30,
    )
    response.raise_for_status()
    return response.json()


def upsert_env(env_text: str, key: str, value: str) -> str:
    line = f"{key}={value}"
    pattern = re.compile(rf"^{re.escape(key)}=.*$", re.MULTILINE)
    if pattern.search(env_text):
        return pattern.sub(lambda _: line, env_text, count=1)
    if env_text and not env_text.endswith("\n"):
        env_text += "\n"
    return env_text + line + "\n"


def expiry_date(issued_at: dt.datetime, expires_in_seconds: int) -> str:
    return (issued_at + dt.timedelta(seconds=expires_in_seconds)).date().isoformat()


def gh(*args: str, stdin: str | None = None) -> None:
    subprocess.run(["gh", *args, "--repo", REPO], input=stdin, text=True, check=True)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--no-github", action="store_true", help="Only update the local .env")
    args = parser.parse_args()

    load_dotenv(ENV_PATH)
    client_id = os.environ.get("LINKEDIN_CLIENT_ID")
    client_secret = os.environ.get("LINKEDIN_CLIENT_SECRET")
    if not client_id or not client_secret:
        print(f"Set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET in {ENV_PATH} (LinkedIn app -> Auth tab).")
        return 1
    if not args.no_github and not shutil.which("gh"):
        print("GitHub CLI `gh` not found; install it or pass --no-github.")
        return 1

    state = secrets.token_urlsafe(24)
    url = build_authorize_url(client_id, state)
    print(f"Opening LinkedIn authorization page:\n{url}\n")
    webbrowser.open(url)
    code = wait_for_code(state)

    issued_at = dt.datetime.now(dt.timezone.utc)
    token = exchange_code(code, client_id, client_secret)
    access_token = token["access_token"]
    expires_on = expiry_date(issued_at, int(token.get("expires_in", 0)))
    refresh_token = token.get("refresh_token")
    if refresh_token:
        # A refresh token outlives the access token; CI mints access tokens from it.
        expires_on = expiry_date(issued_at, int(token.get("refresh_token_expires_in", 0)))
    print(f"Got access token; reminder date (expiry): {expires_on}")
    print("Refresh token issued: CI will refresh automatically." if refresh_token else "No refresh token (app not approved for programmatic refresh).")

    env_text = ENV_PATH.read_text() if ENV_PATH.exists() else ""
    env_text = upsert_env(env_text, "LINKEDIN_ACCESS_TOKEN", access_token)
    if refresh_token:
        env_text = upsert_env(env_text, "LINKEDIN_REFRESH_TOKEN", refresh_token)
    ENV_PATH.write_text(env_text)
    print(f"Updated {ENV_PATH}")

    if not args.no_github:
        gh("secret", "set", "LINKEDIN_ACCESS_TOKEN", stdin=access_token)
        if refresh_token:
            gh("secret", "set", "LINKEDIN_REFRESH_TOKEN", stdin=refresh_token)
            gh("secret", "set", "LINKEDIN_CLIENT_ID", stdin=client_id)
            gh("secret", "set", "LINKEDIN_CLIENT_SECRET", stdin=client_secret)
        gh("variable", "set", "LINKEDIN_TOKEN_EXPIRES_AT", "--body", expires_on)
        print("Updated GitHub secrets and LINKEDIN_TOKEN_EXPIRES_AT")
    return 0


if __name__ == "__main__":
    sys.exit(main())
