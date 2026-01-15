"""
Test all new backend APIs are deployed and working
"""
import requests
import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE_URL = "https://resume-ai-backend-production-3134.up.railway.app"
USER_ID = "test-user-123"

print("=" * 80)
print("TESTING BACKEND API DEPLOYMENT")
print("=" * 80)

# Test 1: Health check
print("\n1. Testing /health...")
response = requests.get(f"{BASE_URL}/health")
print(f"   Status: {response.status_code}")
print(f"   Response: {response.json()}")

# Test 2: OpenAPI spec
print("\n2. Checking OpenAPI spec for new endpoints...")
response = requests.get(f"{BASE_URL}/openapi.json")
spec = response.json()
paths = spec.get("paths", {})

new_endpoints = [
    "/api/resume-analysis/analyze-changes",
    "/api/resume-analysis/analyze-keywords",
    "/api/resume-analysis/match-score",
    "/api/resume-analysis/export",
    "/api/certifications/recommend"
]

for endpoint in new_endpoints:
    if endpoint in paths:
        print(f"   ✓ {endpoint}")
    else:
        print(f"   ✗ {endpoint} NOT FOUND")

# Test 3: Get list of tailored resumes
print("\n3. Getting list of tailored resumes...")
response = requests.get(
    f"{BASE_URL}/api/tailor/list",
    headers={"X-User-ID": USER_ID}
)
print(f"   Status: {response.status_code}")

if response.status_code == 200:
    resumes = response.json()
    print(f"   Found {len(resumes)} tailored resumes")

    if isinstance(resumes, list) and len(resumes) > 0:
        # Test with first resume
        resume_id = resumes[0]["id"]
        print(f"\n4. Testing with tailored resume ID: {resume_id}")

        # Test analyze-changes
        print("\n   4a. Testing analyze-changes...")
        response = requests.post(
            f"{BASE_URL}/api/resume-analysis/analyze-changes",
            headers={
                "X-User-ID": USER_ID,
                "Content-Type": "application/json"
            },
            json={"tailored_resume_id": resume_id}
        )
        print(f"       Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"       ✓ Got analysis with {len(data.get('sections', []))} sections")
        else:
            print(f"       Response: {response.text[:200]}")

        # Test analyze-keywords
        print("\n   4b. Testing analyze-keywords...")
        response = requests.post(
            f"{BASE_URL}/api/resume-analysis/analyze-keywords",
            headers={
                "X-User-ID": USER_ID,
                "Content-Type": "application/json"
            },
            json={"tailored_resume_id": resume_id}
        )
        print(f"       Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            categories = data.get("categories", {})
            print(f"       ✓ Got {len(categories)} keyword categories")
        else:
            print(f"       Response: {response.text[:200]}")

        # Test match-score
        print("\n   4c. Testing match-score...")
        response = requests.post(
            f"{BASE_URL}/api/resume-analysis/match-score",
            headers={
                "X-User-ID": USER_ID,
                "Content-Type": "application/json"
            },
            json={"tailored_resume_id": resume_id}
        )
        print(f"       Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            score = data.get("overall_score", 0)
            print(f"       ✓ Match score: {score}/100")
        else:
            print(f"       Response: {response.text[:200]}")
    else:
        print("\n   No tailored resumes available to test with")
else:
    print(f"   Failed to get resumes: {response.status_code}")

# Test 5: Get interview preps
print("\n5. Getting list of interview preps...")
response = requests.get(
    f"{BASE_URL}/api/interview-prep/list",
    headers={"X-User-ID": USER_ID}
)
print(f"   Status: {response.status_code}")

if response.status_code == 200:
    preps = response.json()
    print(f"   Found {len(preps)} interview preps")

    if isinstance(preps, list) and len(preps) > 0:
        prep_id = preps[0]["id"]
        print(f"\n6. Testing certifications with interview prep ID: {prep_id}")

        response = requests.post(
            f"{BASE_URL}/api/certifications/recommend",
            headers={
                "X-User-ID": USER_ID,
                "Content-Type": "application/json"
            },
            json={"interview_prep_id": prep_id}
        )
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            certs = data.get("certifications", {})
            total = len(certs.get("entry", [])) + len(certs.get("mid", [])) + len(certs.get("advanced", []))
            print(f"   ✓ Got {total} certification recommendations")
        else:
            print(f"   Response: {response.text[:200]}")
    else:
        print("\n   No interview preps available to test with")
else:
    print(f"   Failed to get interview preps: {response.status_code}")

print("\n" + "=" * 80)
print("TEST COMPLETE")
print("=" * 80)
