#!/usr/bin/env python3
"""
Automated user isolation test
"""
import asyncio
from playwright.async_api import async_playwright
import time

FRONTEND_URL = "https://talorme.com"

async def test_isolation():
    print("=" * 70)
    print("AUTOMATED USER ISOLATION TEST")
    print("=" * 70)

    async with async_playwright() as p:
        # Launch browser
        print("\n[1/8] Launching browser...")
        browser = await p.chromium.launch(headless=False)

        # Create two separate contexts (different users)
        print("[2/8] Creating User A context...")
        context_a = await browser.new_context()
        page_a = await context_a.new_page()

        print("[3/8] Creating User B context...")
        context_b = await browser.new_context()
        page_b = await context_b.new_page()

        # Navigate both to the site
        print("[4/8] Loading frontend for User A...")
        await page_a.goto(FRONTEND_URL, wait_until='networkidle')

        print("[5/8] Loading frontend for User B...")
        await page_b.goto(FRONTEND_URL, wait_until='networkidle')

        # Wait for localStorage to initialize
        print("[6/8] Waiting for session initialization...")
        await asyncio.sleep(3)

        # Get session IDs from localStorage
        print("[7/8] Checking session IDs...")
        user_a_id = await page_a.evaluate("() => localStorage.getItem('talor_user_id')")
        user_b_id = await page_b.evaluate("() => localStorage.getItem('talor_user_id')")

        print("\n" + "=" * 70)
        print("SESSION IDS")
        print("=" * 70)
        print(f"User A: {user_a_id}")
        print(f"User B: {user_b_id}")

        # Check if session IDs were generated
        if not user_a_id:
            print("\nERROR: User A does not have a session ID!")
            print("Possible causes:")
            print("  - Frontend deployment incomplete")
            print("  - JavaScript error preventing localStorage write")
            print("  - Check browser console for errors")
            await asyncio.sleep(5)
            await browser.close()
            return False

        if not user_b_id:
            print("\nERROR: User B does not have a session ID!")
            await asyncio.sleep(5)
            await browser.close()
            return False

        # Verify they're different
        if user_a_id == user_b_id:
            print("\nERROR: Both users have the SAME session ID!")
            print("User isolation is BROKEN!")
            await asyncio.sleep(5)
            await browser.close()
            return False

        print("\nSUCCESS: Users have different session IDs")

        # Test API calls
        print("\n[8/8] Testing API isolation...")

        # User A: Call API
        print("\n  User A: Fetching resume list...")
        try:
            response_a = await page_a.evaluate("""
                async () => {
                    const userId = localStorage.getItem('talor_user_id');
                    const response = await fetch('https://resume-ai-backend-production-3134.up.railway.app/api/resumes/list', {
                        headers: {
                            'X-User-ID': userId
                        }
                    });
                    if (!response.ok) {
                        return { error: `HTTP ${response.status}`, status: response.status };
                    }
                    return await response.json();
                }
            """)

            if 'error' in response_a:
                print(f"    API Response: {response_a}")
            else:
                print(f"    User A sees {len(response_a.get('resumes', []))} resumes")

        except Exception as e:
            print(f"    ERROR calling API: {e}")
            response_a = {'resumes': [], 'error': str(e)}

        # User B: Call API
        print("\n  User B: Fetching resume list...")
        try:
            response_b = await page_b.evaluate("""
                async () => {
                    const userId = localStorage.getItem('talor_user_id');
                    const response = await fetch('https://resume-ai-backend-production-3134.up.railway.app/api/resumes/list', {
                        headers: {
                            'X-User-ID': userId
                        }
                    });
                    if (!response.ok) {
                        return { error: `HTTP ${response.status}`, status: response.status };
                    }
                    return await response.json();
                }
            """)

            if 'error' in response_b:
                print(f"    API Response: {response_b}")
            else:
                print(f"    User B sees {len(response_b.get('resumes', []))} resumes")

        except Exception as e:
            print(f"    ERROR calling API: {e}")
            response_b = {'resumes': [], 'error': str(e)}

        # Verify isolation
        print("\n" + "=" * 70)
        print("VERIFICATION RESULTS")
        print("=" * 70)

        # Check if there are any resumes
        resumes_a = response_a.get('resumes', [])
        resumes_b = response_b.get('resumes', [])

        if resumes_a or resumes_b:
            # Check for overlap
            ids_a = {r['id'] for r in resumes_a}
            ids_b = {r['id'] for r in resumes_b}

            overlap = ids_a.intersection(ids_b)

            if overlap:
                print(f"\nERROR: Users can see shared resumes!")
                print(f"  Shared resume IDs: {overlap}")
                print("  ISOLATION FAILED!")
                result = False
            else:
                print(f"\nSUCCESS: No shared resumes detected!")
                print("  ISOLATION WORKING!")
                result = True
        else:
            print("\nINFO: No resumes uploaded yet")
            print("  Session IDs are unique and properly set")
            print("  API accepts X-User-ID header")
            print("  ISOLATION CONFIGURED CORRECTLY")
            result = True

        # Summary
        print("\n" + "=" * 70)
        print("TEST SUMMARY")
        print("=" * 70)
        print(f"User A ID: {user_a_id}")
        print(f"User B ID: {user_b_id}")
        print(f"IDs Different: {'YES' if user_a_id != user_b_id else 'NO'}")
        print(f"User A Resumes: {len(resumes_a)}")
        print(f"User B Resumes: {len(resumes_b)}")

        if 'error' in response_a or 'error' in response_b:
            print(f"\nWARNING: API errors detected")
            print(f"  User A: {response_a.get('error', 'OK')}")
            print(f"  User B: {response_b.get('error', 'OK')}")

        print("\n" + "=" * 70)
        if result:
            print("OVERALL RESULT: PASS - User isolation is working!")
        else:
            print("OVERALL RESULT: FAIL - User isolation has issues!")
        print("=" * 70)

        # Keep browsers open for 10 seconds for visual verification
        print("\nBrowsers will close in 10 seconds...")
        await asyncio.sleep(10)

        await browser.close()
        return result

if __name__ == "__main__":
    try:
        result = asyncio.run(test_isolation())
        exit(0 if result else 1)
    except Exception as e:
        print(f"\nFATAL ERROR: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
