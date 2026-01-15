"""
Simple check - are the endpoints responding at all?
"""
import requests

BASE_URL = "https://resume-ai-backend-production-3134.up.railway.app"

print("=" * 80)
print("SIMPLE ENDPOINT CHECK")
print("=" * 80)

# Test with fake data to see if endpoints are accessible
print("\n[1] Testing analyze-changes endpoint...")
response = requests.post(
    f"{BASE_URL}/api/resume-analysis/analyze-changes",
    headers={
        "Content-Type": "application/json",
        "X-User-ID": "user_test_12345",
        "Origin": "https://talorme.com"
    },
    json={"tailored_resume_id": 999999},  # Fake ID
    timeout=5
)

print(f"Status: {response.status_code}")
print(f"CORS: {response.headers.get('Access-Control-Allow-Origin', 'MISSING')}")
print(f"Content-Type: {response.headers.get('Content-Type')}")

if response.status_code == 404:
    print("OK - Endpoint is accessible (404 = not found, expected for fake ID)")
elif response.status_code == 500:
    print(f"X - 500 error: {response.text[:500]}")
else:
    print(f"Response: {response.text[:200]}")

# Test analyze-keywords
print("\n[2] Testing analyze-keywords endpoint...")
response = requests.post(
    f"{BASE_URL}/api/resume-analysis/analyze-keywords",
    headers={
        "Content-Type": "application/json",
        "X-User-ID": "user_test_12345",
        "Origin": "https://talorme.com"
    },
    json={"tailored_resume_id": 999999},
    timeout=5
)

print(f"Status: {response.status_code}")
print(f"CORS: {response.headers.get('Access-Control-Allow-Origin', 'MISSING')}")
print(f"Content-Type: {response.headers.get('Content-Type')}")

if response.status_code == 404:
    print("OK - Endpoint is accessible (404 = not found, expected for fake ID)")
elif response.status_code == 500:
    print(f"X - 500 error: {response.text[:500]}")
else:
    print(f"Response: {response.text[:200]}")

# Test match-score
print("\n[3] Testing match-score endpoint...")
response = requests.post(
    f"{BASE_URL}/api/resume-analysis/match-score",
    headers={
        "Content-Type": "application/json",
        "X-User-ID": "user_test_12345",
        "Origin": "https://talorme.com"
    },
    json={"tailored_resume_id": 999999},
    timeout=5
)

print(f"Status: {response.status_code}")
print(f"CORS: {response.headers.get('Access-Control-Allow-Origin', 'MISSING')}")
print(f"Content-Type: {response.headers.get('Content-Type')}")

if response.status_code == 404:
    print("OK - Endpoint is accessible (404 = not found, expected for fake ID)")
elif response.status_code == 500:
    print(f"X - 500 error: {response.text[:500]}")
else:
    print(f"Response: {response.text[:200]}")

print("\n" + "=" * 80)
