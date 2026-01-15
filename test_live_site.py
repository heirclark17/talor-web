#!/usr/bin/env python3
"""
Test the live site with real browser interaction
"""
import asyncio
from playwright.async_api import async_playwright

async def test_live_site():
    print("=" * 70)
    print("TESTING LIVE SITE: https://talorme.com")
    print("=" * 70)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context()
        page = await context.new_page()

        # Enable console logging
        page.on("console", lambda msg: print(f"[BROWSER] {msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: print(f"[ERROR] {err}"))

        print("\n[1/5] Loading homepage...")
        await page.goto("https://talorme.com", wait_until='networkidle')

        # Wait for initialization
        await asyncio.sleep(2)

        print("[2/5] Checking session ID...")
        user_id = await page.evaluate("() => localStorage.getItem('talor_user_id')")
        print(f"  Session ID: {user_id}")

        if user_id and user_id.startswith('user_'):
            print("  SUCCESS: Session ID generated!")
        else:
            print("  ERROR: No valid session ID!")

        print("\n[3/5] Checking if page loaded correctly...")
        title = await page.title()
        print(f"  Page Title: {title}")

        print("\n[4/5] Checking for JavaScript errors...")
        # Any errors would have been logged via page.on() above

        print("\n[5/5] Testing navigation to upload page (if applicable)...")
        # Try to find upload button or similar
        try:
            upload_button = await page.query_selector('text=Upload')
            if upload_button:
                print("  Upload button found!")
            else:
                print("  No upload button visible (might need to navigate)")
        except:
            print("  Could not check for upload button")

        print("\n" + "=" * 70)
        print("LIVE SITE TEST COMPLETE")
        print("=" * 70)
        print(f"\nSession ID: {user_id}")
        print(f"Status: {'WORKING' if user_id else 'NEEDS INVESTIGATION'}")

        print("\nKeeping browser open for 15 seconds for manual inspection...")
        await asyncio.sleep(15)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(test_live_site())
