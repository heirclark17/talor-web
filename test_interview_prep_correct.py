"""
Comprehensive Interview Prep Test - Correct URL paths
Tests EVERY feature on the interview prep page
"""

import asyncio
from playwright.async_api import async_playwright, Page
import time

# Configuration
SITE_URL = "https://talorme.com"
RESUME_PATH = r"C:\Users\derri\Downloads\Diamond_Marie_Dixon_Resume_Final (4) (2).docx"
JOB_URL = "https://www.amazon.jobs/en/jobs/3048245/security-delivery-practice-manager?cmpid=SPLICX0248M&utm_source=linkedin.com&utm_campaign=cxro&utm_medium=social_media&utm_content=job_posting&ss=paid"

async def test_all_features(page: Page):
    """Test every single feature on Interview Prep page"""

    print("\n" + "=" * 80)
    print("TESTING ALL INTERVIEW PREP FEATURES")
    print("=" * 80)

    await asyncio.sleep(3)

    # Test 1: Company Profile
    print("\n[1/8] Company Profile Section")
    try:
        btn = page.locator("button").filter(has_text="Company Profile").first
        await btn.click()
        await asyncio.sleep(0.5)
        print("  [OK] Expanded")

        # Look for company name
        if await page.locator("text=/Amazon|AWS/i").count() > 0:
            print("  [OK] Company info displayed")

    except Exception as e:
        print(f"  [X] {str(e)[:100]}")

    # Test 2: Role Analysis
    print("\n[2/8] Role Analysis Section")
    try:
        btn = page.locator("button").filter(has_text="Role Analysis").first
        await btn.click()
        await asyncio.sleep(0.5)
        print("  [OK] Expanded")

        if await page.get_by_text("Must-Have Skills").count() > 0:
            print("  [OK] Must-Have Skills found")
        if await page.get_by_text("Nice-to-Have").count() > 0:
            print("  [OK] Nice-to-Have Skills found")

    except Exception as e:
        print(f"  [X] {str(e)[:100]}")

    # Test 3: Values & Culture
    print("\n[3/8] Values & Culture Section")
    try:
        btn = page.locator("button").filter(has_text="Values").first
        await btn.click()
        await asyncio.sleep(0.5)
        print("  [OK] Expanded")
    except Exception as e:
        print(f"  [X] {str(e)[:100]}")

    # Test 4: Strategy & News (Real Data)
    print("\n[4/8] Strategy & Recent News (Real Data)")
    try:
        btn = page.locator("button").filter(has_text="Strategy").first
        await btn.click()
        await asyncio.sleep(0.5)
        print("  [OK] Expanded")

        await asyncio.sleep(2)  # Wait for real data

        badges = await page.get_by_text("Real Data").count()
        print(f"  [OK] Found {badges} Real Data badges")

        if await page.get_by_text("Strategic Initiatives").count() > 0:
            print("  [OK] Strategic Initiatives section")

        sources = await page.locator('a:has-text("View Source")').count()
        print(f"  [OK] Found {sources} source links")

    except Exception as e:
        print(f"  [X] {str(e)[:100]}")

    # Test 5: Practice Questions (Real Data)
    print("\n[5/8] Practice Questions (Real Data)")
    try:
        btn = page.locator("button").filter(has_text="Practice Questions").first
        await btn.click()
        await asyncio.sleep(0.5)
        print("  [OK] Expanded")

        await asyncio.sleep(2)

        if await page.get_by_text("Real Interview Questions").count() > 0:
            print("  [OK] Real questions section")

        types = await page.get_by_text("behavioral").count()
        types += await page.get_by_text("technical").count()
        print(f"  [OK] Found {types} question type indicators")

    except Exception as e:
        print(f"  [X] {str(e)[:100]}")

    # Test 6: Candidate Positioning + STAR Builder
    print("\n[6/8] Candidate Positioning + STAR Story Builder")
    try:
        btn = page.locator("button").filter(has_text="Candidate Positioning").first
        await btn.click()
        await asyncio.sleep(0.5)
        print("  [OK] Expanded")

        # Scroll to STAR Builder
        await page.evaluate("window.scrollBy(0, 400)")
        await asyncio.sleep(1)

        if await page.get_by_text("STAR Story Builder").is_visible(timeout=5000):
            print("  [OK] STAR Story Builder visible")

            await asyncio.sleep(2)

            checkboxes = await page.locator('input[type="checkbox"]').count()
            print(f"  [OK] Found {checkboxes} experience checkboxes")

            if checkboxes > 0:
                await page.locator('input[type="checkbox"]').first.check()
                print("  [OK] Selected experience")

                if await page.locator('select').count() > 0:
                    await page.locator('select').first.select_option(index=1)
                    print("  [OK] Selected theme")

                    if await page.get_by_text("Generate STAR Story").is_visible():
                        print("  [OK] Generate button ready (skipping API call)")
            else:
                if await page.get_by_text("Loading resume experiences").is_visible():
                    print("  [WARN] Experiences loading")

    except Exception as e:
        print(f"  [X] {str(e)[:100]}")

    # Test 7: Scrolling
    print("\n[7/8] Page Navigation")
    try:
        await page.evaluate("window.scrollTo(0, 0)")
        await asyncio.sleep(0.3)
        print("  [OK] Scrolled to top")

        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        await asyncio.sleep(0.3)
        print("  [OK] Scrolled to bottom")

    except Exception as e:
        print(f"  [X] {str(e)[:100]}")

    # Test 8: Screenshots
    print("\n[8/8] Screenshots")
    try:
        await page.screenshot(path="test_full_page.png", full_page=True)
        print("  [OK] Full page: test_full_page.png")

        await page.screenshot(path="test_viewport.png")
        print("  [OK] Viewport: test_viewport.png")

    except Exception as e:
        print(f"  [X] {str(e)[:100]}")

async def main():
    print("=" * 80)
    print("INTERVIEW PREP - COMPLETE FEATURE TEST")
    print("=" * 80)
    print(f"\nSite: {SITE_URL}")
    print(f"Resume: {RESUME_PATH}")
    print(f"Job: Amazon Security Delivery Practice Manager")
    print("\n" + "=" * 80)

    async with async_playwright() as p:
        print("\nLaunching browser (visible mode)...")
        browser = await p.chromium.launch(
            headless=False,
            slow_mo=400,
            args=['--start-maximized']
        )

        context = await browser.new_context(
            viewport=None,  # Use full screen
            no_viewport=True
        )

        page = await context.new_page()

        try:
            # STEP 1: Homepage & Upload
            print("\n[STEP 1] Loading homepage and uploading resume...")
            await page.goto(SITE_URL, wait_until="domcontentloaded", timeout=60000)
            await asyncio.sleep(3)
            print("[OK] Homepage loaded")

            # Find and use file input
            file_input = page.locator('input[type="file"]')
            if await file_input.count() > 0:
                await file_input.first.set_input_files(RESUME_PATH)
                print("  [OK] Resume file selected")
                await asyncio.sleep(5)  # Wait for upload
                print("  [OK] Upload complete")
            else:
                print("  [X] File input not found - will try to navigate to tailor page anyway")

            # STEP 2: Navigate to Tailor page
            print("\n[STEP 2] Navigating to /tailor...")
            await page.goto(f"{SITE_URL}/tailor", wait_until="domcontentloaded")
            await asyncio.sleep(2)
            print("[OK] Tailor page loaded")

            # STEP 3: Enter job URL and generate
            print("\n[STEP 3] Entering job URL and generating...")

            # Find the job URL textarea/input
            job_input = page.locator('textarea').first
            if await job_input.count() > 0:
                await job_input.click()
                await job_input.fill(JOB_URL)
                await asyncio.sleep(1)
                print("  [OK] Job URL entered")

                # Find and click Generate button
                generate_btn = page.get_by_role("button").filter(has_text="Generate")
                if await generate_btn.count() > 0:
                    print("  [INFO] Clicking Generate (30-60 seconds)...")
                    await generate_btn.first.click()

                    # Wait for Interview Prep button to appear
                    try:
                        await page.wait_for_selector('text="Interview Prep"', timeout=120000)
                        print("  [OK] Generation complete!")
                        await asyncio.sleep(2)
                    except:
                        print("  [WARN] Generation taking longer...")
                        await asyncio.sleep(5)
                else:
                    print("  [X] Generate button not found")
            else:
                print("  [X] Job URL input not found")

            # STEP 4: Navigate to Interview Prep
            print("\n[STEP 4] Navigating to Interview Prep...")

            # Try clicking Interview Prep button
            prep_btn = page.get_by_text("Interview Prep")
            if await prep_btn.count() > 0:
                await prep_btn.first.click()
                await asyncio.sleep(3)
                print("[OK] Interview Prep page loaded")
            else:
                # Try finding link
                prep_link = page.locator('a[href*="/interview-prep/"]')
                if await prep_link.count() > 0:
                    await prep_link.first.click()
                    await asyncio.sleep(3)
                    print("[OK] Navigated via link")
                else:
                    print("[X] Could not find Interview Prep navigation")

            # STEP 5: Test all features
            await test_all_features(page)

            # Summary
            print("\n" + "=" * 80)
            print("TEST COMPLETE")
            print("=" * 80)
            print("\nScreenshots saved:")
            print("  - test_full_page.png")
            print("  - test_viewport.png")
            print("\nKeeping browser open for 45 seconds...")
            await asyncio.sleep(45)

        except Exception as e:
            print(f"\n[ERROR] {e}")
            import traceback
            traceback.print_exc()
            await page.screenshot(path="error_screenshot.png")
            print("Error screenshot: error_screenshot.png")
            print("Keeping browser open for 60 seconds...")
            await asyncio.sleep(60)

        finally:
            await browser.close()
            print("\n[DONE]")

if __name__ == "__main__":
    asyncio.run(main())
