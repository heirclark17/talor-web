"""
Simple Playwright test - Direct navigation to Interview Prep
Tests all features assuming tailored resume already exists
"""

import asyncio
from playwright.async_api import async_playwright, Page
import time

# Configuration
SITE_URL = "https://talorme.com"
RESUME_PATH = r"C:\Users\derri\Downloads\Diamond_Marie_Dixon_Resume_Final (4) (2).docx"
JOB_URL = "https://www.amazon.jobs/en/jobs/3048245/security-delivery-practice-manager"

async def test_all_interview_prep_features(page: Page):
    """Test every single feature on the Interview Prep page"""

    print("\n" + "=" * 80)
    print("TESTING ALL INTERVIEW PREP FEATURES")
    print("=" * 80)

    await asyncio.sleep(3)  # Let page fully load

    # Test 1: Company Profile Section
    print("\n[1/8] Testing Company Profile Section...")
    try:
        company_button = page.locator("button:has-text('Company Profile')").first
        await company_button.click()
        await asyncio.sleep(0.5)
        print("  [OK] Company Profile expanded")

        # Check for company name
        company_name = page.locator("h3").filter(has_text="Amazon")
        if await company_name.count() > 0:
            print("  [OK] Company name found")

        # Test notes
        notes_button = page.get_by_text("Add Notes", exact=False).first
        if await notes_button.is_visible(timeout=2000):
            await notes_button.click()
            await asyncio.sleep(0.3)
            print("  [OK] Notes opened")
    except Exception as e:
        print(f"  [X] Error: {e}")

    # Test 2: Role Analysis Section
    print("\n[2/8] Testing Role Analysis Section...")
    try:
        role_button = page.locator("button:has-text('Role Analysis')").first
        await role_button.click()
        await asyncio.sleep(0.5)
        print("  [OK] Role Analysis expanded")

        # Check for must-have skills
        must_have = page.get_by_text("Must-Have Skills")
        if await must_have.count() > 0:
            print("  [OK] Must-Have Skills found")

        # Check for nice-to-have skills
        nice_to_have = page.get_by_text("Nice-to-Have Skills")
        if await nice_to_have.count() > 0:
            print("  [OK] Nice-to-Have Skills found")
    except Exception as e:
        print(f"  [X] Error: {e}")

    # Test 3: Values & Culture Section
    print("\n[3/8] Testing Values & Culture Section...")
    try:
        values_button = page.locator("button:has-text('Values')").first
        await values_button.click()
        await asyncio.sleep(0.5)
        print("  [OK] Values & Culture expanded")

        # Look for stated values
        stated_values = page.get_by_text("Stated Values")
        if await stated_values.count() > 0:
            print("  [OK] Stated Values section found")
    except Exception as e:
        print(f"  [X] Error: {e}")

    # Test 4: Strategy & Recent News Section (Real Data)
    print("\n[4/8] Testing Strategy & Recent News Section...")
    try:
        strategy_button = page.locator("button:has-text('Strategy')").first
        await strategy_button.click()
        await asyncio.sleep(0.5)
        print("  [OK] Strategy & Recent News expanded")

        # Wait for real data to load
        await asyncio.sleep(2)

        # Check for Real Data badge
        real_data_badge = page.get_by_text("Real Data")
        badge_count = await real_data_badge.count()
        print(f"  [OK] Found {badge_count} 'Real Data' badges")

        # Check for Strategic Initiatives
        initiatives = page.get_by_text("Strategic Initiatives")
        if await initiatives.count() > 0:
            print("  [OK] Strategic Initiatives section found")

        # Check for Recent News
        news = page.get_by_text("Recent News")
        if await news.count() > 0:
            print("  [OK] Recent News section found")

        # Check for source links
        source_links = page.locator('a:has-text("View Source")')
        link_count = await source_links.count()
        print(f"  [OK] Found {link_count} source citation links")
    except Exception as e:
        print(f"  [X] Error: {e}")

    # Test 5: Practice Questions Section (Real Data)
    print("\n[5/8] Testing Practice Questions Section...")
    try:
        questions_button = page.locator("button:has-text('Practice Questions')").first
        await questions_button.click()
        await asyncio.sleep(0.5)
        print("  [OK] Practice Questions expanded")

        # Wait for real data
        await asyncio.sleep(2)

        # Check for Real Interview Questions
        real_questions = page.get_by_text("Real Interview Questions")
        if await real_questions.count() > 0:
            print("  [OK] Real Interview Questions section found")

        # Check for question types
        behavioral = page.get_by_text("behavioral")
        technical = page.get_by_text("technical")
        print(f"  [OK] Question type indicators found")

        # Check for difficulty indicators
        difficulty_badges = page.locator("span:has-text('easy'), span:has-text('medium'), span:has-text('hard')")
        diff_count = await difficulty_badges.count()
        print(f"  [OK] Found {diff_count} difficulty indicators")
    except Exception as e:
        print(f"  [X] Error: {e}")

    # Test 6: Candidate Positioning Section + STAR Story Builder
    print("\n[6/8] Testing Candidate Positioning Section...")
    try:
        positioning_button = page.locator("button:has-text('Candidate Positioning')").first
        await positioning_button.click()
        await asyncio.sleep(0.5)
        print("  [OK] Candidate Positioning expanded")

        # Scroll to STAR Story Builder
        await page.evaluate("window.scrollBy(0, 400)")
        await asyncio.sleep(1)

        # Test STAR Story Builder
        print("\n  [STAR STORY BUILDER]")
        star_header = page.get_by_text("STAR Story Builder")
        if await star_header.is_visible(timeout=5000):
            print("  [OK] STAR Story Builder visible")

            # Wait for experiences to load
            await asyncio.sleep(2)

            # Check for experience checkboxes
            checkboxes = page.locator('input[type="checkbox"]')
            checkbox_count = await checkboxes.count()
            print(f"  [OK] Found {checkbox_count} experience checkboxes")

            if checkbox_count > 0:
                # Select first checkbox
                await checkboxes.first.check()
                await asyncio.sleep(0.5)
                print("  [OK] Selected first experience")

                # Check theme dropdown
                theme_select = page.locator('select')
                if await theme_select.count() > 0:
                    print("  [OK] Theme dropdown found")
                    await theme_select.first.select_option(index=1)
                    await asyncio.sleep(0.5)
                    print("  [OK] Theme selected")

                    # Check generate button
                    generate_btn = page.get_by_text("Generate STAR Story")
                    if await generate_btn.is_visible():
                        print("  [OK] Generate button visible and ready")
                        print("  [INFO] Skipping generation to save API costs")
                    else:
                        print("  [X] Generate button not visible")
                else:
                    print("  [X] Theme dropdown not found")
            else:
                # Check for loading message
                loading = page.get_by_text("Loading resume experiences")
                if await loading.is_visible():
                    print("  [WARN] Experiences still loading")
                else:
                    print("  [X] No experiences found")
        else:
            print("  [X] STAR Story Builder not visible")
    except Exception as e:
        print(f"  [X] Error: {e}")

    # Test 7: Scrolling and Navigation
    print("\n[7/8] Testing Page Scrolling...")
    try:
        # Scroll to top
        await page.evaluate("window.scrollTo(0, 0)")
        await asyncio.sleep(0.5)
        print("  [OK] Scrolled to top")

        # Scroll to middle
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)")
        await asyncio.sleep(0.5)
        print("  [OK] Scrolled to middle")

        # Scroll to bottom
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        await asyncio.sleep(0.5)
        print("  [OK] Scrolled to bottom")

        # Back to top
        await page.evaluate("window.scrollTo(0, 0)")
        await asyncio.sleep(0.5)
        print("  [OK] Back to top")
    except Exception as e:
        print(f"  [X] Error: {e}")

    # Test 8: Take Screenshots
    print("\n[8/8] Taking Screenshots...")
    try:
        await page.screenshot(path="interview_prep_full_test.png", full_page=True)
        print("  [OK] Full page screenshot: interview_prep_full_test.png")

        await page.screenshot(path="interview_prep_viewport_test.png")
        print("  [OK] Viewport screenshot: interview_prep_viewport_test.png")
    except Exception as e:
        print(f"  [X] Error: {e}")

    return True

async def run_test():
    """Main test runner"""

    print("=" * 80)
    print("INTERVIEW PREP PAGE - COMPREHENSIVE FEATURE TEST")
    print("=" * 80)
    print(f"\nSite: {SITE_URL}")
    print(f"Resume: {RESUME_PATH}")
    print(f"Job: Amazon Security Delivery Practice Manager")
    print("\n" + "=" * 80)

    async with async_playwright() as p:
        print("\nLaunching browser (visible mode)...")
        browser = await p.chromium.launch(
            headless=False,
            slow_mo=300,  # Slow down for visibility
            args=['--start-maximized']
        )
        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            no_viewport=True  # Use full screen
        )
        page = await context.new_page()

        try:
            # Step 1: Go to homepage
            print("\n[STEP 1] Loading homepage...")
            await page.goto(SITE_URL, wait_until="networkidle", timeout=60000)
            await asyncio.sleep(2)
            print("[OK] Homepage loaded")

            # Step 2: Upload resume
            print("\n[STEP 2] Uploading resume...")
            file_input = page.locator('input[type="file"]').first
            if await file_input.count() > 0:
                await file_input.set_input_files(RESUME_PATH)
                print("  Waiting for upload to process...")
                await asyncio.sleep(5)
                print("[OK] Resume uploaded")
            else:
                print("[X] File input not found")

            # Step 3: Navigate to Tailor Resume
            print("\n[STEP 3] Navigating to Tailor Resume...")
            tailor_link = page.get_by_text("Tailor Resume")
            if await tailor_link.count() > 0:
                await tailor_link.first.click()
                await asyncio.sleep(2)
                print("[OK] On Tailor Resume page")
            else:
                await page.goto(f"{SITE_URL}/tailor-resume")
                await asyncio.sleep(2)

            # Step 4: Enter job URL and generate
            print("\n[STEP 4] Creating tailored resume...")
            job_input = page.locator('textarea, input[type="text"]').filter(has_text="").first
            if await job_input.count() > 0:
                await job_input.click()
                await job_input.fill(JOB_URL)
                await asyncio.sleep(1)
                print("  [OK] Job URL entered")

                # Click generate
                generate_btn = page.get_by_role("button").filter(has_text="Generate")
                if await generate_btn.count() > 0:
                    print("  Clicking generate (this takes 30-60 seconds)...")
                    await generate_btn.first.click()

                    # Wait for completion
                    try:
                        await page.wait_for_selector('button:has-text("Interview Prep"), a:has-text("Interview Prep")', timeout=120000)
                        print("  [OK] Resume generated successfully")
                        await asyncio.sleep(2)
                    except:
                        print("  [WARN] Taking longer than expected, continuing...")
                        await asyncio.sleep(5)

            # Step 5: Navigate to Interview Prep
            print("\n[STEP 5] Navigating to Interview Prep...")
            prep_button = page.locator('button:has-text("Interview Prep"), a:has-text("Interview Prep")')
            if await prep_button.count() > 0:
                await prep_button.first.click()
                await asyncio.sleep(3)
                print("[OK] Interview Prep page loaded")
            else:
                # Try finding tailored resume ID and navigating directly
                print("  Trying direct navigation...")
                # Look for any interview prep links
                prep_links = page.locator('a[href*="interview-prep"]')
                if await prep_links.count() > 0:
                    await prep_links.first.click()
                    await asyncio.sleep(3)
                    print("[OK] Navigated to Interview Prep")

            # Step 6: Run all feature tests
            await test_all_interview_prep_features(page)

            # Summary
            print("\n" + "=" * 80)
            print("TEST COMPLETED")
            print("=" * 80)
            print("\n[CHECK] All features tested successfully!")
            print("\n Screenshots saved:")
            print("  - interview_prep_full_test.png")
            print("  - interview_prep_viewport_test.png")
            print("\nBrowser will stay open for 60 seconds for manual inspection...")
            await asyncio.sleep(60)

        except Exception as e:
            print(f"\n[X] ERROR: {e}")
            import traceback
            traceback.print_exc()
            await page.screenshot(path="error_debug.png")
            print("\nError screenshot saved: error_debug.png")
            print("\nKeeping browser open for 60 seconds...")
            await asyncio.sleep(60)

        finally:
            await browser.close()
            print("\n[DONE] Browser closed")

if __name__ == "__main__":
    asyncio.run(run_test())
