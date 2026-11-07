"""LinkedIn OAuth helpers shared by the posting script and the rotation tool."""

import os

import requests

TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"


def refresh_access_token(refresh_token: str, client_id: str, client_secret: str) -> str:
    response = requests.post(
        TOKEN_URL,
        data={
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": client_id,
            "client_secret": client_secret,
        },
        timeout=30,
    )
    response.raise_for_status()
    return response.json()["access_token"]


def resolve_access_token() -> str | None:
    """Return a usable access token.

    LinkedIn only issues refresh tokens to apps approved for programmatic
    refresh (e.g. the Community Management API). When LINKEDIN_REFRESH_TOKEN and
    the app credentials are configured, mint a fresh access token at runtime so
    the stored one never needs rotating. Otherwise fall back to the static
    LINKEDIN_ACCESS_TOKEN (60-day lifetime).
    """
    static_token = os.environ.get("LINKEDIN_ACCESS_TOKEN") or None
    refresh_token = os.environ.get("LINKEDIN_REFRESH_TOKEN")
    client_id = os.environ.get("LINKEDIN_CLIENT_ID")
    client_secret = os.environ.get("LINKEDIN_CLIENT_SECRET")
    if refresh_token and client_id and client_secret:
        try:
            token = refresh_access_token(refresh_token, client_id, client_secret)
            print("Refreshed LinkedIn access token from refresh token")
            return token
        except requests.RequestException as error:
            print(f"LinkedIn token refresh failed ({error}); using LINKEDIN_ACCESS_TOKEN")
    return static_token
