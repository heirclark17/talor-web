"""
End-to-end test: Upload resume, generate tailored version, test ALL analysis endpoints
"""
import requests
import json
import time
import uuid

BASE_URL = "https://resume-ai-backend-production-3134.up.railway.app"
RESUME_PATH = r"C:\Users\derri\Downloads\Diamond_Marie_Dixon_Resume_Final (4) (2).docx"

print("=" * 80)
print("END-TO-END TEST: Upload > Tailor > Analyze")
print("=" * 80)

# Generate user ID (same way frontend does it)
print("\n[1] Generating user ID...")
user_id = f"user_{uuid.uuid4()}"
print(f"OK User ID: {user_id}")

# Upload resume
print("\n[2] Uploading resume...")
with open(RESUME_PATH, 'rb') as f:
    response = requests.post(
        f"{BASE_URL}/api/resumes/upload",
        headers={"X-User-ID": user_id},
        files={"file": f}
    )

if response.status_code == 200:
    resume_data = response.json()
    print(f"Response: {json.dumps(resume_data, indent=2)}")
    # Handle different response structures
    if "resume" in resume_data:
        base_resume_id = resume_data["resume"]["id"]
    elif "id" in resume_data:
        base_resume_id = resume_data["id"]
    elif "resume_id" in resume_data:
        base_resume_id = resume_data["resume_id"]
    else:
        print(f"X Unexpected response structure: {resume_data}")
        exit(1)
    print(f"OK Resume uploaded: ID {base_resume_id}")
else:
    print(f"X Upload failed: {response.status_code} - {response.text}")
    exit(1)

# Tailor resume
print("\n[3] Generating tailored resume...")
job_data = {
    "base_resume_id": base_resume_id,
    "company": "Amazon",
    "job_title": "Security Delivery Practice Manager",
    "job_url": "https://www.amazon.jobs/en/jobs/3048245/security-delivery-practice-manager"
}

response = requests.post(
    f"{BASE_URL}/api/tailor/tailor",
    headers={
        "Content-Type": "application/json",
        "X-User-ID": user_id
    },
    json=job_data,
    timeout=180
)

if response.status_code == 200:
    tailor_data = response.json()
    tailored_resume_id = tailor_data["tailored_resume_id"]
    print(f"OK Tailored resume generated: ID {tailored_resume_id}")
else:
    print(f"X Tailoring failed: {response.status_code} - {response.text[:500]}")
    exit(1)

# Wait a moment for data to settle
time.sleep(2)

# Test analyze-changes
print("\n[4] Testing /api/resume-analysis/analyze-changes...")
response = requests.post(
    f"{BASE_URL}/api/resume-analysis/analyze-changes",
    headers={
        "Content-Type": "application/json",
        "X-User-ID": user_id,
        "Origin": "https://talorme.com"
    },
    json={"tailored_resume_id": tailored_resume_id},
    timeout=60
)

print(f"Status: {response.status_code}")
print(f"CORS: {response.headers.get('Access-Control-Allow-Origin', 'MISSING')}")

if response.status_code == 200:
    data = response.json()
    print("OKOKOK ANALYSIS SUCCESSFUL!")
    analysis = data.get("analysis", {})
    print(f"  - Keywords added: {analysis.get('keywords_added', 'N/A')}")
    print(f"  - Changes summary: {analysis.get('summary', 'N/A')[:100]}...")
elif response.status_code == 500:
    print("X 500 ERROR!")
    print(f"  Response text: {response.text[:1000]}")
    try:
        error_detail = response.json().get("detail", "Unknown error")
        print(f"  Error detail: {error_detail}")
    except:
        print("  Could not parse JSON response")
else:
    print(f"X Error: {response.status_code}")
    print(f"  Response: {response.text[:500]}")

# Test analyze-keywords
print("\n[5] Testing /api/resume-analysis/analyze-keywords...")
response = requests.post(
    f"{BASE_URL}/api/resume-analysis/analyze-keywords",
    headers={
        "Content-Type": "application/json",
        "X-User-ID": user_id,
        "Origin": "https://talorme.com"
    },
    json={"tailored_resume_id": tailored_resume_id},
    timeout=60
)

print(f"Status: {response.status_code}")

if response.status_code == 200:
    data = response.json()
    print("OKOKOK KEYWORDS ANALYSIS SUCCESSFUL!")
    keywords = data.get("keywords", {})
    print(f"  Keywords: {json.dumps(keywords, indent=2)[:200]}...")
elif response.status_code == 500:
    print("X 500 ERROR!")
    error_detail = response.json().get("detail", "Unknown error")
    print(f"  Error: {error_detail}")
else:
    print(f"X Error: {response.status_code}")
    print(f"  Response: {response.text[:500]}")

# Test match-score
print("\n[6] Testing /api/resume-analysis/match-score...")
response = requests.post(
    f"{BASE_URL}/api/resume-analysis/match-score",
    headers={
        "Content-Type": "application/json",
        "X-User-ID": user_id,
        "Origin": "https://talorme.com"
    },
    json={"tailored_resume_id": tailored_resume_id},
    timeout=60
)

print(f"Status: {response.status_code}")

if response.status_code == 200:
    data = response.json()
    print("OKOKOK MATCH SCORE SUCCESSFUL!")
    match_score = data.get("match_score", {})
    print(f"  Score: {match_score.get('score', 'N/A')}/100")
    print(f"  Breakdown: {json.dumps(match_score.get('breakdown', {}), indent=2)[:200]}...")
elif response.status_code == 500:
    print("X 500 ERROR!")
    error_detail = response.json().get("detail", "Unknown error")
    print(f"  Error: {error_detail}")
else:
    print(f"X Error: {response.status_code}")
    print(f"  Response: {response.text[:500]}")

# Test export
print("\n[7] Testing /api/resume-analysis/export...")
response = requests.post(
    f"{BASE_URL}/api/resume-analysis/export",
    headers={
        "Content-Type": "application/json",
        "X-User-ID": user_id,
        "Origin": "https://talorme.com"
    },
    json={"tailored_resume_id": tailored_resume_id, "format": "pdf"},
    timeout=30
)

print(f"Status: {response.status_code}")

if response.status_code == 200:
    content_type = response.headers.get("Content-Type", "")
    if "pdf" in content_type:
        print("OKOKOK EXPORT SUCCESSFUL!")
        print(f"  PDF size: {len(response.content)} bytes")
    else:
        print(f"X Unexpected content type: {content_type}")
elif response.status_code == 500:
    print("X 500 ERROR!")
    error_detail = response.json().get("detail", "Unknown error")
    print(f"  Error: {error_detail}")
else:
    print(f"X Error: {response.status_code}")
    print(f"  Response: {response.text[:500]}")

print("\n" + "=" * 80)
print("TEST COMPLETE")
print("=" * 80)
print(f"\nGenerated IDs:")
print(f"  Base Resume ID: {base_resume_id}")
print(f"  Tailored Resume ID: {tailored_resume_id}")
print(f"  User ID: {user_id}")
