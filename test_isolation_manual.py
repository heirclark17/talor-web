#!/usr/bin/env python3
"""
Manual user isolation test - Opens two browsers for visual verification
"""
import asyncio
from playwright.async_api import async_playwright

FRONTEND_URL = "https://talorme.com"

async def test_isolation_manual():
    print("=" * 70)
    print("MANUAL USER ISOLATION TEST")
    print("=" * 70)
    print("\nThis will open two browser windows side by side.")
    print("Each represents a different user.")
    print("\nInstructions:")
    print("1. In Browser 1 (LEFT): Upload a resume and note its filename")
    print("2. In Browser 2 (RIGHT): Upload a different resume")
    print("3. Verify that each browser only shows its own resume")
    print("4. Verify they DON'T see each other's resumes")
    print("\n" + "=" * 70)
    input("\nPress Enter to start the test...")

    async with async_playwright() as p:
        # Launch browser
        print("\nLaunching browsers...")
        browser = await p.chromium.launch(
            headless=False,
            args=['--start-maximized']
        )

        # Create two separate contexts (different users)
        print("Creating User A (Browser 1 - LEFT)...")
        context_a = await browser.new_context(
            viewport={'width': 960, 'height': 1080},
            color_scheme='light'
        )
        page_a = await context_a.new_page()

        print("Creating User B (Browser 2 - RIGHT)...")
        context_b = await browser.new_context(
            viewport={'width': 960, 'height': 1080},
            color_scheme='dark'
        )
        page_b = await context_b.new_page()

        # Navigate both to the site
        print("\nLoading frontend for both users...")
        await page_a.goto(FRONTEND_URL)
        await page_b.goto(FRONTEND_URL)

        # Wait for localStorage to initialize
        await asyncio.sleep(2)

        # Get session IDs
        user_a_id = await page_a.evaluate("() => localStorage.getItem('talor_user_id')")
        user_b_id = await page_b.evaluate("() => localStorage.getItem('talor_user_id')")

        print("\n" + "=" * 70)
        print("USER SESSION IDS")
        print("=" * 70)
        print(f"User A (LEFT):  {user_a_id}")
        print(f"User B (RIGHT): {user_b_id}")

        if not user_a_id or not user_b_id:
            print("\nWARNING: One or both users don't have session IDs!")
            print("This means the frontend deployment may not be complete yet.")
            print("Check browser console for errors.")

        elif user_a_id == user_b_id:
            print("\nERROR: Both users have the SAME session ID!")
            print("User isolation is NOT working correctly.")

        else:
            print("\nSUCCESS: Users have different session IDs!")
            print("User isolation is configured correctly.")

        print("\n" + "=" * 70)
        print("TESTING INSTRUCTIONS")
        print("=" * 70)
        print("\n1. In Browser 1 (LEFT - Light theme):")
        print("   - Upload a test resume (e.g., 'test_resume_A.pdf')")
        print("   - Note the filename in the dashboard")
        print("\n2. In Browser 2 (RIGHT - Dark theme):")
        print("   - Upload a different resume (e.g., 'test_resume_B.pdf')")
        print("   - Note the filename in the dashboard")
        print("\n3. Verification:")
        print("   - Browser 1 should ONLY show test_resume_A.pdf")
        print("   - Browser 2 should ONLY show test_resume_B.pdf")
        print("   - They should NOT see each other's files")
        print("\n4. Refresh both pages:")
        print("   - Verify the isolation persists after refresh")
        print("   - Each user should still only see their own resume")
        print("\n" + "=" * 70)
        input("\nPress Enter when done testing (browsers will close)...")

        # Cleanup
        await browser.close()

        print("\n" + "=" * 70)
        print("TEST COMPLETED")
        print("=" * 70)
        print("\nDid each user only see their own resume?")
        result = input("Type 'yes' if isolation worked correctly: ")

        if result.lower() == 'yes':
            print("\nSUCCESS: User isolation is working correctly!")
            return True
        else:
            print("\nFAILURE: User isolation needs troubleshooting.")
            print("Check:")
            print("  1. Browser console for JavaScript errors")
            print("  2. Network tab to verify X-User-ID header is sent")
            print("  3. Backend logs for any errors")
            return False

if __name__ == "__main__":
    try:
        asyncio.run(test_isolation_manual())
    except KeyboardInterrupt:
        print("\n\nTest cancelled by user.")
    except Exception as e:
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()
