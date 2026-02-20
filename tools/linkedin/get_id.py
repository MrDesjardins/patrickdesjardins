import os
import requests
from dotenv import load_dotenv

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(SCRIPT_DIR, "../../.env"))

token = os.environ["LINKEDIN_ACCESS_TOKEN"]

response = requests.get(
    "https://api.linkedin.com/v2/userinfo",
    headers={
        "Authorization": f"Bearer {token}",
        "X-Restli-Protocol-Version": "2.0.0",
        "LinkedIn-Version": "202501"
    }
)

print(response.status_code)
print(response.json())
