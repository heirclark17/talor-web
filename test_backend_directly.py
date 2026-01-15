"""
Test backend endpoints directly to see actual errors
"""
import requests
import json

BASE_URL = "https://resume-ai-backend-production-3134.up.railway.app"

print("=" * 80)
print("TESTING BACKEND ENDPOINTS DIRECTLY")
print("=" * 80)

# Test analyze-changes
print("\n[1] Testing /api/resume-analysis/analyze-changes...")
try:
    response = requests.post(
        f"{BASE_URL}/api/resume-analysis/analyze-changes",
        headers={
            "Content-Type": "application/json",
            "X-User-ID": "user_090a1e7e-e104-495d-bac8-e63056bcc477",
            "Origin": "https://talorme.com"
        },
        json={"tailored_resume_id": 111},
        timeout=10
    )
    print(f"Status: {response.status_code}")
    print(f"CORS Header: {response.headers.get('Access-Control-Allow-Origin', 'MISSING')}")
    print(f"Response: {response.text[:500]}")
except Exception as e:
    print(f"Error: {e}")

# Test export
print("\n[2] Testing /api/resume-analysis/export...")
try:
    response = requests.post(
        f"{BASE_URL}/api/resume-analysis/export",
        headers={
            "Content-Type": "application/json",
            "X-User-ID": "user_090a1e7e-e104-495d-bac8-e63056bcc477",
            "Origin": "https://talorme.com"
        },
        json={"tailored_resume_id": 111, "format": "docx"},
        timeout=10
    )
    print(f"Status: {response.status_code}")
    print(f"CORS Header: {response.headers.get('Access-Control-Allow-Origin', 'MISSING')}")
    print(f"Response: {response.text[:500]}")
except Exception as e:
    print(f"Error: {e}")

# Test certifications
print("\n[3] Testing /api/certifications/recommend...")
try:
    response = requests.post(
        f"{BASE_URL}/api/certifications/recommend",
        headers={
            "Content-Type": "application/json",
            "X-User-ID": "user_090a1e7e-e104-495d-bac8-e63056bcc477",
            "Origin": "https://talorme.com"
        },
        json={"interview_prep_id": 54},
        timeout=10
    )
    print(f"Status: {response.status_code}")
    print(f"CORS Header: {response.headers.get('Access-Control-Allow-Origin', 'MISSING')}")
    print(f"Response: {response.text[:500]}")
except Exception as e:
    print(f"Error: {e}")

print("\n" + "=" * 80)
