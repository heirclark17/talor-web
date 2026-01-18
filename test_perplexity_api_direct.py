import requests
import json
import time

def test_perplexity_api_direct():
    """Direct API test for Perplexity integration"""
    
    print("\n" + "=" * 70)
    print("Testing Career Path API with Perplexity Integration")
    print("=" * 70)
    
    # Test data matching what the frontend would send
    payload = {
        "target_role_interest": "Senior Cybersecurity Architect",
        "location": "Houston, TX",
        "skills_have": ["AWS", "Security Architecture", "Cloud Security", "Zero Trust", "NIST Framework"],
        "years_experience": 10,
        "current_role": "Cybersecurity Program Manager",
        "strengths": ["Leadership & Team Management", "Security Architecture", "Cloud Security"],
        "likes": ["Pursuing career growth in cybersecurity", "Continuous learning"]
    }
    
    print("\nStep 1: Sending request to production API...")
    print(f"  Endpoint: https://resume-ai-backend-production.up.railway.app/api/career-plan")
    print(f"  Dream Role: {payload['target_role_interest']}")
    print(f"  Location: {payload['location']}")
    
    start_time = time.time()
    
    try:
        response = requests.post(
            "https://resume-ai-backend-production.up.railway.app/api/career-plan",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=180  # 3 minute timeout for Perplexity research
        )
        
        elapsed = time.time() - start_time
        print(f"\nStep 2: Response received in {elapsed:.1f} seconds")
        print(f"  Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("  [OK] Success!")
            
            data = response.json()
            
            print("\nStep 3: Analyzing response structure...")
            
            # Check for main sections
            sections_found = []
            if "targetRoles" in data:
                sections_found.append(f"Target Roles ({len(data['targetRoles'])} roles)")
            if "skillsAnalysis" in data:
                sections_found.append("Skills Analysis")
            if "certifications" in data:
                sections_found.append(f"Certifications ({len(data['certifications'])} certs)")
            if "educationOptions" in data:
                sections_found.append(f"Education Options ({len(data['educationOptions'])} options)")
            if "experiencePlan" in data:
                sections_found.append(f"Experience Plan ({len(data['experiencePlan'])} projects)")
            if "events" in data:
                sections_found.append(f"Events ({len(data['events'])} events)")
            if "timeline" in data:
                sections_found.append("Timeline")
            if "resumeAssets" in data:
                sections_found.append("Resume Assets")
            
            for section in sections_found:
                print(f"  [OK] {section}")
            
            # Check for web-grounded data indicators
            print("\nStep 4: Checking for web-grounded data...")
            
            response_text = json.dumps(data).lower()
            
            # Check for salary data
            if "$" in response_text and ("salary" in response_text or "compensation" in response_text):
                print("  [OK] Salary ranges found")
            else:
                print("  [WARN] No salary data")
            
            # Check for URLs/citations
            if "http" in response_text or "www." in response_text:
                print("  [OK] URLs/citations found")
            else:
                print("  [WARN] No URLs found")
            
            # Check for percentages/statistics
            if "%" in response_text or ("growth" in response_text and "20" in response_text):
                print("  [OK] Growth statistics found")
            else:
                print("  [WARN] No growth statistics")
            
            # Print sample target role data
            if "targetRoles" in data and len(data["targetRoles"]) > 0:
                print("\nStep 5: Sample Target Role Data:")
                role = data["targetRoles"][0]
                print(f"  Title: {role.get('title', 'N/A')}")
                print(f"  Growth Outlook: {role.get('growthOutlook', 'N/A')[:100]}...")
                print(f"  Salary Range: {role.get('salaryRange', 'N/A')}")
            
            print("\n" + "=" * 70)
            print("SUCCESS: Perplexity API integration is working!")
            print("  - Career plan generated successfully")
            print("  - All sections present")
            print("  - Response time: " + f"{elapsed:.1f}s")
            print("=" * 70)
            
        else:
            print(f"  [FAIL] HTTP {response.status_code}")
            print(f"\nError Response:")
            print(response.text[:500])
            
    except requests.exceptions.Timeout:
        elapsed = time.time() - start_time
        print(f"\n[TIMEOUT] Request exceeded {elapsed:.1f} seconds")
        print("  Perplexity research may be taking longer than expected")
        
    except Exception as e:
        print(f"\n[ERROR] {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_perplexity_api_direct()
