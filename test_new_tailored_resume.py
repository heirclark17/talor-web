"""
Test with the newly created tailored resume
"""
import requests
import json

BASE_URL = "https://resume-ai-backend-production-3134.up.railway.app"
USER_ID = "user_e2f2ca3e-7915-4361-b780-fe556877d220"  # From last test
TAILORED_RESUME_ID = 113  # From last test

print("=" * 80)
print("TESTING WITH NEWLY CREATED DATA")
print("=" * 80)
print(f"User ID: {USER_ID}")
print(f"Tailored Resume ID: {TAILORED_RESUME_ID}")

# First verify the tailored resume exists
print("\n[1] Verifying tailored resume exists...")
response = requests.get(
    f"{BASE_URL}/api/tailor/tailored/{TAILORED_RESUME_ID}",
    headers={"X-User-ID": USER_ID}
)
print(f"Status: {response.status_code}")
if response.status_code == 200:
    data = response.json()
    print("OK Tailored resume found!")
    print(f"  Job: {data.get('job', {}).get('company')} - {data.get('job', {}).get('title')}")
    print(f"  Has original_resume: {bool(data.get('original_resume'))}")
    print(f"  Has tailored_content: {bool(data.get('tailored_content'))}")
else:
    print(f"X Tailored resume not found: {response.text}")
    exit(1)

# Test analyze-changes
print("\n[2] Testing /api/resume-analysis/analyze-changes...")
try:
    response = requests.post(
        f"{BASE_URL}/api/resume-analysis/analyze-changes",
        headers={
            "Content-Type": "application/json",
            "X-User-ID": USER_ID,
            "Origin": "https://talorme.com"
        },
        json={"tailored_resume_id": TAILORED_RESUME_ID},
        timeout=90
    )

    print(f"Status: {response.status_code}")
    print(f"Content-Type: {response.headers.get('Content-Type')}")
    print(f"CORS: {response.headers.get('Access-Control-Allow-Origin', 'MISSING')}")
    print(f"Response text (first 2000 chars): {response.text[:2000]}")

    if response.status_code == 200:
        data = response.json()
        print("\nSUCCESS!")
        print(f"Analysis: {json.dumps(data, indent=2)[:800]}")
    else:
        print(f"\nFAILED with status {response.status_code}")

except Exception as e:
    print(f"Exception: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 80)
