"""
Test analyze-keywords endpoint directly
"""
import requests
import json

BASE_URL = "https://resume-ai-backend-production-3134.up.railway.app"

print("=" * 80)
print("TESTING ANALYZE-KEYWORDS ENDPOINT")
print("=" * 80)

# First create a test resume and tailor it
import uuid
USER_ID = f"user_{uuid.uuid4()}"

print("\n[1] Creating test data...")
print(f"User ID: {USER_ID}")

# Upload resume
print("\n[2] Uploading resume...")
with open(r"C:\Users\derri\Downloads\Diamond_Marie_Dixon_Resume_Final (4) (2).docx", 'rb') as f:
    response = requests.post(
        f"{BASE_URL}/api/resumes/upload",
        headers={"X-User-ID": USER_ID},
        files={"file": f},
        timeout=30
    )

if response.status_code == 200:
    data = response.json()
    resume_id = data["resume_id"]
    print(f"OK Resume uploaded: ID {resume_id}")
else:
    print(f"X Upload failed: {response.status_code} - {response.text[:500]}")
    exit(1)

# Tailor resume
print("\n[3] Tailoring resume...")
response = requests.post(
    f"{BASE_URL}/api/tailor/tailor",
    headers={
        "Content-Type": "application/json",
        "X-User-ID": USER_ID
    },
    json={
        "base_resume_id": resume_id,
        "company": "Microsoft",
        "job_title": "Cybersecurity Program Manager",
        "job_url": "https://careers.microsoft.com/job/1234"
    },
    timeout=180
)

if response.status_code == 200:
    data = response.json()
    tailored_id = data["tailored_resume_id"]
    print(f"OK Tailored resume created: ID {tailored_id}")
else:
    print(f"X Tailoring failed: {response.status_code} - {response.text[:500]}")
    exit(1)

# Test analyze-keywords
print("\n[4] Testing /api/resume-analysis/analyze-keywords...")
response = requests.post(
    f"{BASE_URL}/api/resume-analysis/analyze-keywords",
    headers={
        "Content-Type": "application/json",
        "X-User-ID": USER_ID,
        "Origin": "https://talorme.com"
    },
    json={"tailored_resume_id": tailored_id},
    timeout=90
)

print(f"Status: {response.status_code}")
print(f"CORS Header: {response.headers.get('Access-Control-Allow-Origin', 'MISSING')}")
print(f"Content-Type: {response.headers.get('Content-Type')}")
print(f"Response (first 1500 chars): {response.text[:1500]}")

if response.status_code == 200:
    print("\nOK OK OK Success!")
    data = response.json()
    print(f"Keywords: {json.dumps(data, indent=2)[:500]}")
elif response.status_code == 500:
    print("\nX 500 ERROR")
    try:
        error = response.json()
        print(f"Error detail: {error.get('detail', 'Unknown')}")
    except:
        print(f"Plain text error: {response.text}")
else:
    print(f"\nX Error {response.status_code}")

print("\n" + "=" * 80)
