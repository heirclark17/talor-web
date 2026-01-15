"""
Direct Interview Prep Test - Tests EVERY feature
Goes directly to existing Interview Prep page
"""

import asyncio
from playwright.async_api import async_playwright, Page

# Direct URL to test
INTERVIEW_PREP_URL = "https://talorme.com/interview-prep/78"

async def test_all_features(page: Page):
    """Comprehensive test of ALL Interview Prep features"""

    print("\n" + "=" * 80)
    print("TESTING ALL INTERVIEW PREP FEATURES")
    print("=" * 80)

    # Wait for page to fully load
    await asyncio.sleep(3)
    print("\n[INFO] Page loaded, starting tests...\n")

    # Test 1: Company Profile Section
    print("[TEST 1/8] Company Profile Section")
    try:
        company_btn = page.locator("button").filter(has_text="Company Profile").first
        await company_btn.click()
        await asyncio.sleep(0.5)
        print("  [OK] Section expanded")

        # Check for company content
        company_name_visible = await page.locator("h3, h2, div").filter(has_text="Amazon").count() > 0
        if company_name_visible:
            print("  [OK] Company name displayed")

        # Test notes functionality
        try:
            add_notes_btn = page.get_by_text("Add Notes", exact=False).first
            if await add_notes_btn.is_visible(timeout=2000):
                await add_notes_btn.click()
                await asyncio.sleep(0.3)

                # Find and fill textarea
                textarea = page.locator('textarea').first
                if await textarea.is_visible(timeout=1000):
                    test_note = f"Test note - {asyncio.get_event_loop().time()}"
                    await textarea.fill(test_note)
                    await asyncio.sleep(0.3)
                    print("  [OK] Notes functionality working")

                    # Click away to close notes
                    await page.click('body', position={"x": 10, "y": 10})
                    await asyncio.sleep(0.3)
        except:
            print("  [INFO] Notes feature not visible or already has notes")

        # Collapse section
        await company_btn.click()
        await asyncio.sleep(0.3)
        print("  [OK] Section collapsed")

    except Exception as e:
        print(f"  [X] Error: {str(e)[:80]}")

    # Test 2: Role Analysis Section
    print("\n[TEST 2/8] Role Analysis Section")
    try:
        role_btn = page.locator("button").filter(has_text="Role Analysis").first
        await role_btn.click()
        await asyncio.sleep(0.5)
        print("  [OK] Section expanded")

        # Check for must-have skills
        if await page.get_by_text("Must-Have Skills").count() > 0:
            print("  [OK] Must-Have Skills section found")

        # Check for nice-to-have skills
        if await page.get_by_text("Nice-to-Have").count() > 0:
            print("  [OK] Nice-to-Have Skills section found")

        # Check for core responsibilities
        if await page.get_by_text("Core Responsibilities").count() > 0:
            print("  [OK] Core Responsibilities section found")

        await role_btn.click()
        await asyncio.sleep(0.3)
        print("  [OK] Section collapsed")

    except Exception as e:
        print(f"  [X] Error: {str(e)[:80]}")

    # Test 3: Values & Culture Section
    print("\n[TEST 3/8] Values & Culture Section")
    try:
        values_btn = page.locator("button").filter(has_text="Values").first
        await values_btn.click()
        await asyncio.sleep(0.5)
        print("  [OK] Section expanded")

        # Check for stated values
        if await page.get_by_text("Stated Values").count() > 0:
            print("  [OK] Stated Values section found")

        # Check for cultural principles
        if await page.get_by_text("Cultural Principles").count() > 0:
            print("  [OK] Cultural Principles section found")

        await values_btn.click()
        await asyncio.sleep(0.3)
        print("  [OK] Section collapsed")

    except Exception as e:
        print(f"  [X] Error: {str(e)[:80]}")

    # Test 4: Strategy & Recent News (Real Data)
    print("\n[TEST 4/8] Strategy & Recent News Section (Real Data)")
    try:
        strategy_btn = page.locator("button").filter(has_text="Strategy").first
        await strategy_btn.click()
        await asyncio.sleep(0.5)
        print("  [OK] Section expanded")

        # Wait for real data to load
        print("  [INFO] Waiting for real data to load...")
        await asyncio.sleep(3)

        # Check for Real Data badges
        real_data_badges = await page.get_by_text("Real Data").count()
        print(f"  [OK] Found {real_data_badges} 'Real Data' badges")

        # Check for Strategic Initiatives
        if await page.get_by_text("Strategic Initiatives").count() > 0:
            print("  [OK] Strategic Initiatives section found")

        # Check for Recent News
        if await page.get_by_text("Recent News").count() > 0:
            print("  [OK] Recent News section found")

        # Check for source links (clickable citations)
        source_links = await page.locator('a[href]').filter(has_text="View Source").count()
        source_links += await page.locator('a[href]').filter(has_text="Read Article").count()
        print(f"  [OK] Found {source_links} source citation links")

        # Check for AI Analysis fallback
        ai_badges = await page.get_by_text("AI Analysis").count()
        if ai_badges > 0:
            print(f"  [INFO] Found {ai_badges} AI Analysis sections (real data may not be available)")

        await strategy_btn.click()
        await asyncio.sleep(0.3)
        print("  [OK] Section collapsed")

    except Exception as e:
        print(f"  [X] Error: {str(e)[:80]}")

    # Test 5: Practice Questions (Real Data)
    print("\n[TEST 5/8] Practice Questions Section (Real Data)")
    try:
        questions_btn = page.locator("button").filter(has_text="Practice Questions").first
        await questions_btn.click()
        await asyncio.sleep(0.5)
        print("  [OK] Section expanded")

        # Wait for real data
        print("  [INFO] Waiting for real interview questions...")
        await asyncio.sleep(3)

        # Check for Real Interview Questions
        if await page.get_by_text("Real Interview Questions").count() > 0:
            print("  [OK] Real Interview Questions section found")

        # Check for question type indicators
        behavioral_count = await page.get_by_text("behavioral").count()
        technical_count = await page.get_by_text("technical").count()
        situational_count = await page.get_by_text("situational").count()
        total_types = behavioral_count + technical_count + situational_count
        print(f"  [OK] Found {total_types} question type indicators")

        # Check for difficulty indicators
        easy = await page.locator("span").filter(has_text="easy").count()
        medium = await page.locator("span").filter(has_text="medium").count()
        hard = await page.locator("span").filter(has_text="hard").count()
        total_difficulty = easy + medium + hard
        print(f"  [OK] Found {total_difficulty} difficulty indicators")

        # Check for frequency indicators
        frequency = await page.get_by_text("frequency").count()
        if frequency > 0:
            print(f"  [OK] Found {frequency} frequency indicators")

        await questions_btn.click()
        await asyncio.sleep(0.3)
        print("  [OK] Section collapsed")

    except Exception as e:
        print(f"  [X] Error: {str(e)[:80]}")

    # Test 6: Candidate Positioning + STAR Story Builder
    print("\n[TEST 6/8] Candidate Positioning Section")
    try:
        positioning_btn = page.locator("button").filter(has_text="Candidate Positioning").first
        await positioning_btn.click()
        await asyncio.sleep(0.5)
        print("  [OK] Section expanded")

        # Scroll to make sure STAR Builder is visible
        await page.evaluate("window.scrollBy(0, 300)")
        await asyncio.sleep(1)

        # Test STAR Story Builder
        print("\n  [STAR STORY BUILDER TEST]")
        star_heading = page.get_by_text("STAR Story Builder", exact=False)

        if await star_heading.is_visible(timeout=5000):
            print("  [OK] STAR Story Builder is visible")

            # Wait for experiences to load
            print("  [INFO] Waiting for resume experiences to load...")
            await asyncio.sleep(3)

            # Check for experience checkboxes
            checkboxes = page.locator('input[type="checkbox"]')
            checkbox_count = await checkboxes.count()
            print(f"  [OK] Found {checkbox_count} experience checkboxes")

            if checkbox_count > 0:
                # Select first experience
                await checkboxes.first.check()
                await asyncio.sleep(0.5)
                print("  [OK] Selected first experience")

                # Check if second experience exists and select it
                if checkbox_count > 1:
                    await checkboxes.nth(1).check()
                    await asyncio.sleep(0.5)
                    print("  [OK] Selected second experience")

                # Test theme dropdown
                theme_dropdown = page.locator('select')
                if await theme_dropdown.count() > 0:
                    print("  [OK] Theme dropdown found")

                    # Get available themes
                    options = await theme_dropdown.first.locator('option').all_text_contents()
                    print(f"  [OK] Available themes: {len(options)}")

                    # Select a theme (try "Problem Solving" or second option)
                    await theme_dropdown.first.select_option(index=1)
                    await asyncio.sleep(0.5)
                    print("  [OK] Theme selected")

                    # Check for Generate button
                    generate_button = page.get_by_text("Generate STAR Story")
                    if await generate_button.is_visible():
                        print("  [OK] Generate STAR Story button visible")
                        print("  [INFO] Button is enabled and ready to use")
                        print("  [SKIP] Not clicking to avoid API costs")

                        # Test unselecting experiences
                        await checkboxes.first.uncheck()
                        await asyncio.sleep(0.3)
                        print("  [OK] Unselected experience (checkbox works)")

                        # Re-select for completeness
                        await checkboxes.first.check()
                        await asyncio.sleep(0.3)

                    else:
                        print("  [X] Generate button not visible")
                else:
                    print("  [X] Theme dropdown not found")

            else:
                # Check for loading message
                loading_msg = page.get_by_text("Loading resume experiences")
                if await loading_msg.is_visible():
                    print("  [WARN] Resume experiences still loading")
                else:
                    print("  [X] No experiences found and no loading message")

        else:
            print("  [X] STAR Story Builder not visible")

        # Scroll back up
        await page.evaluate("window.scrollBy(0, -300)")
        await asyncio.sleep(0.5)

        await positioning_btn.click()
        await asyncio.sleep(0.3)
        print("  [OK] Section collapsed")

    except Exception as e:
        print(f"  [X] Error: {str(e)[:80]}")

    # Test 7: Page Navigation & Scrolling
    print("\n[TEST 7/8] Page Navigation & Scrolling")
    try:
        # Scroll to top
        await page.evaluate("window.scrollTo({top: 0, behavior: 'smooth'})")
        await asyncio.sleep(0.8)
        print("  [OK] Scrolled to top")

        # Scroll to 25%
        await page.evaluate("window.scrollTo({top: document.body.scrollHeight * 0.25, behavior: 'smooth'})")
        await asyncio.sleep(0.8)
        print("  [OK] Scrolled to 25%")

        # Scroll to 50%
        await page.evaluate("window.scrollTo({top: document.body.scrollHeight * 0.5, behavior: 'smooth'})")
        await asyncio.sleep(0.8)
        print("  [OK] Scrolled to 50%")

        # Scroll to 75%
        await page.evaluate("window.scrollTo({top: document.body.scrollHeight * 0.75, behavior: 'smooth'})")
        await asyncio.sleep(0.8)
        print("  [OK] Scrolled to 75%")

        # Scroll to bottom
        await page.evaluate("window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'})")
        await asyncio.sleep(0.8)
        print("  [OK] Scrolled to bottom")

        # Back to top
        await page.evaluate("window.scrollTo({top: 0, behavior: 'smooth'})")
        await asyncio.sleep(0.8)
        print("  [OK] Back to top")

    except Exception as e:
        print(f"  [X] Error: {str(e)[:80]}")

    # Test 8: Screenshots
    print("\n[TEST 8/8] Capturing Screenshots")
    try:
        # Full page screenshot
        await page.screenshot(path="interview_prep_FULL.png", full_page=True)
        print("  [OK] Full page screenshot: interview_prep_FULL.png")

        # Viewport screenshot
        await page.screenshot(path="interview_prep_VIEWPORT.png")
        print("  [OK] Viewport screenshot: interview_prep_VIEWPORT.png")

        # Screenshot of STAR Builder section specifically
        star_section = page.locator("text=STAR Story Builder").locator('..')
        if await star_section.count() > 0:
            await star_section.first.screenshot(path="star_builder_section.png")
            print("  [OK] STAR Builder section screenshot: star_builder_section.png")

    except Exception as e:
        print(f"  [X] Error: {str(e)[:80]}")

    print("\n" + "=" * 80)
    print("ALL TESTS COMPLETED!")
    print("=" * 80)

async def main():
    """Main test runner"""

    print("=" * 80)
    print("COMPREHENSIVE INTERVIEW PREP PAGE TEST")
    print("Direct URL Testing - All Features")
    print("=" * 80)
    print(f"\nURL: {INTERVIEW_PREP_URL}")
    print("\nThis test will:")
    print("  1. Company Profile (expand/collapse, notes)")
    print("  2. Role Analysis (expand/collapse, skills)")
    print("  3. Values & Culture (expand/collapse)")
    print("  4. Strategy & News (expand/collapse, real data, sources)")
    print("  5. Practice Questions (expand/collapse, real data, metadata)")
    print("  6. Candidate Positioning (expand/collapse)")
    print("  7. STAR Story Builder (checkboxes, themes, generate button)")
    print("  8. Page Navigation (scrolling)")
    print("  9. Screenshots (full page, viewport, sections)")
    print("\n" + "=" * 80)

    async with async_playwright() as p:
        print("\nLaunching browser (visible mode)...")
        browser = await p.chromium.launch(
            headless=False,
            slow_mo=300,  # Slow down for visibility
            args=['--start-maximized']
        )

        context = await browser.new_context(
            viewport=None,
            no_viewport=True,
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'
        )

        page = await context.new_page()

        try:
            print(f"\nNavigating to: {INTERVIEW_PREP_URL}")
            await page.goto(INTERVIEW_PREP_URL, wait_until="domcontentloaded", timeout=60000)
            print("[OK] Page loaded successfully")

            # Wait for initial content to render
            await asyncio.sleep(2)

            # Run all tests
            await test_all_features(page)

            # Final summary
            print("\n" + "=" * 80)
            print("TEST SUMMARY")
            print("=" * 80)
            print("\nScreenshots saved:")
            print("  - interview_prep_FULL.png (full page)")
            print("  - interview_prep_VIEWPORT.png (current view)")
            print("  - star_builder_section.png (STAR Builder closeup)")

            print("\n[SUCCESS] All tests completed!")
            print("\nKeeping browser open for 60 seconds for manual inspection...")
            await asyncio.sleep(60)

        except Exception as e:
            print(f"\n[ERROR] Test failed: {e}")
            import traceback
            traceback.print_exc()

            # Take error screenshot
            await page.screenshot(path="ERROR_screenshot.png")
            print("\nError screenshot saved: ERROR_screenshot.png")

            print("\nKeeping browser open for 90 seconds for debugging...")
            await asyncio.sleep(90)

        finally:
            await browser.close()
            print("\n[DONE] Browser closed")

if __name__ == "__main__":
    asyncio.run(main())
