#!/usr/bin/env python3
"""
Test user isolation on new Vercel deployment
"""
import asyncio
from playwright.async_api import async_playwright

# New deployment URL
FRONTEND_URL = "https://resume-ai-app-blond.vercel.app"
BACKEND_URL = "https://resume-ai-backend-production-3134.up.railway.app"

async def test_isolation():
    print("=" * 70)
    print("TESTING USER ISOLATION ON NEW DEPLOYMENT")
    print("=" * 70)
    print(f"\nFrontend: {FRONTEND_URL}")
    print(f"Backend: {BACKEND_URL}")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)

        # User A
        context_a = await browser.new_context()
        page_a = await context_a.new_page()

        # User B
        context_b = await browser.new_context()
        page_b = await context_b.new_page()

        # Navigate
        print("\n[1/4] Loading frontend for both users...")
        await page_a.goto(FRONTEND_URL, wait_until='networkidle')
        await page_b.goto(FRONTEND_URL, wait_until='networkidle')

        # Wait for init
        await asyncio.sleep(2)

        # Check session IDs
        print("[2/4] Checking session IDs...")
        user_a_id = await page_a.evaluate("() => localStorage.getItem('talor_user_id')")
        user_b_id = await page_b.evaluate("() => localStorage.getItem('talor_user_id')")

        print(f"\n  User A ID: {user_a_id}")
        print(f"  User B ID: {user_b_id}")

        if not user_a_id or not user_b_id:
            print("\n  ERROR: Session IDs not generated!")
            await browser.close()
            return False

        if user_a_id == user_b_id:
            print("\n  ERROR: Same session ID!")
            await browser.close()
            return False

        print("\n  SUCCESS: Different session IDs!")

        # Test API
        print("\n[3/4] Testing API calls...")
        response_a = await page_a.evaluate(f"""
            async () => {{
                const userId = localStorage.getItem('talor_user_id');
                const response = await fetch('{BACKEND_URL}/api/resumes/list', {{
                    headers: {{ 'X-User-ID': userId }}
                }});
                return await response.json();
            }}
        """)

        response_b = await page_b.evaluate(f"""
            async () => {{
                const userId = localStorage.getItem('talor_user_id');
                const response = await fetch('{BACKEND_URL}/api/resumes/list', {{
                    headers: {{ 'X-User-ID': userId }}
                }});
                return await response.json();
            }}
        """)

        print(f"  User A sees: {len(response_a.get('resumes', []))} resumes")
        print(f"  User B sees: {len(response_b.get('resumes', []))} resumes")

        # Check isolation
        print("\n[4/4] Verifying isolation...")
        ids_a = {r['id'] for r in response_a.get('resumes', [])}
        ids_b = {r['id'] for r in response_b.get('resumes', [])}
        overlap = ids_a.intersection(ids_b)

        if overlap:
            print(f"  ERROR: Shared resumes detected: {overlap}")
            result = False
        else:
            print("  SUCCESS: No shared resumes!")
            result = True

        print("\n" + "=" * 70)
        print("TEST RESULT:", "PASS" if result else "FAIL")
        print("=" * 70)

        print("\nKeeping browsers open for 10 seconds...")
        await asyncio.sleep(10)

        await browser.close()
        return result

if __name__ == "__main__":
    result = asyncio.run(test_isolation())
    exit(0 if result else 1)
