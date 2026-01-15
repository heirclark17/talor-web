"""
Test with user's actual tailored resume data
"""
import requests
import json

BASE_URL = "https://resume-ai-backend-production-3134.up.railway.app"
USER_ID = "user_090a1e7e-e104-495d-bac8-e63056bcc477"  # User's actual ID
TAILORED_RESUME_ID = 111  # From earlier tests

print("=" * 80)
print("TESTING WITH ACTUAL USER DATA")
print("=" * 80)
print(f"User ID: {USER_ID}")
print(f"Tailored Resume ID: {TAILORED_RESUME_ID}")

# Test analyze-changes
print("\n[1] Testing /api/resume-analysis/analyze-changes...")
try:
    response = requests.post(
        f"{BASE_URL}/api/resume-analysis/analyze-changes",
        headers={
            "Content-Type": "application/json",
            "X-User-ID": USER_ID,
            "Origin": "https://talorme.com"
        },
        json={"tailored_resume_id": TAILORED_RESUME_ID},
        timeout=60
    )

    print(f"Status: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    print(f"Response text: {response.text[:1500]}")

    if response.status_code == 200:
        data = response.json()
        print("SUCCESS!")
        print(f"Analysis: {json.dumps(data, indent=2)[:500]}")
    else:
        print(f"FAILED with status {response.status_code}")

except Exception as e:
    print(f"Exception: {e}")

print("\n" + "=" * 80)
