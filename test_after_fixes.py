"""
Test after all fixes are deployed
"""
import asyncio
from playwright.async_api import async_playwright

async def test_features():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()

        try:
            print("=" * 80)
            print("TESTING TALORME.COM AFTER FIXES")
            print("=" * 80)

            # Test 1: Homepage and Interview Prep link in header
            print("\n[TEST 1] Homepage and Navigation")
            await page.goto("https://talorme.com", wait_until="domcontentloaded")
            await asyncio.sleep(2)
            print("  [OK] Homepage loaded")

            # Look for Interview Prep link (note: it's only visible on non-landing pages)
            await page.goto("https://talorme.com/upload", wait_until="domcontentloaded")
            await asyncio.sleep(2)

            interview_prep_link = page.locator('a:has-text("Interview Prep")')
            count = await interview_prep_link.count()
            print(f"  Interview Prep link in header: {'Found' if count > 0 else 'Not found'}")

            # Test 2: Interview Prep List Page
            print("\n[TEST 2] Interview Prep List Page")
            await page.goto("https://talorme.com/interview-preps", wait_until="domcontentloaded")
            await asyncio.sleep(2)
            print("  [OK] Navigated to /interview-preps")

            # Check page title
            title = await page.locator('h1').first.inner_text()
            print(f"  Page title: {title}")

            # Test 3: Interview Prep Page (ID 78)
            print("\n[TEST 3] Interview Prep Page - ID 78")
            await page.goto("https://talorme.com/interview-prep/78", wait_until="domcontentloaded")
            await asyncio.sleep(5)  # Wait for data to load
            print("  [OK] Navigated to interview prep page")

            # Check for error message
            error = page.locator('text=Error Loading Interview Prep')
            error_count = await error.count()
            if error_count > 0:
                error_text = await error.first.inner_text()
                print(f"  [ERROR] {error_text}")

                # Get error details if visible
                error_details = page.locator('text=/Unexpected token/')
                if await error_details.count() > 0:
                    details = await error_details.first.inner_text()
                    print(f"  Error details: {details}")
            else:
                print("  [OK] No error message displayed")

            # Check for loading indicator
            loading = page.locator('text=Loading interview prep')
            loading_count = await loading.count()
            if loading_count > 0:
                print("  [INFO] Loading indicator still visible")

            # Check for section buttons
            print("\n[TEST 4] Section Buttons")
            sections = [
                "Company Profile",
                "Role Analysis",
                "Values",
                "Strategy",
                "Practice Questions",
                "Candidate Positioning"
            ]

            for section in sections:
                button = page.locator(f'button:has-text("{section}")')
                count = await button.count()
                status = "Found" if count > 0 else "Not found"
                print(f"  {section}: {status}")

            # Check for STAR Story Builder
            star_builder = page.locator('text=STAR Story Builder')
            star_count = await star_builder.count()
            status = "Found" if star_count > 0 else "Not found"
            print(f"  STAR Story Builder: {status}")

            # Check for Real Data badges
            print("\n[TEST 5] Real Data Features")
            real_data_badges = page.locator('text=Real Data')
            badge_count = await real_data_badges.count()
            print(f"  Real Data badges: {badge_count}")

            # Take screenshots
            print("\n[TEST 6] Screenshots")
            await page.screenshot(path="test_after_fixes_full.png", full_page=True)
            print("  [OK] Full page: test_after_fixes_full.png")

            await page.screenshot(path="test_after_fixes_viewport.png")
            print("  [OK] Viewport: test_after_fixes_viewport.png")

            # Test 4: TailorResume Page Features
            print("\n[TEST 7] TailorResume Page Features")
            await page.goto("https://talorme.com/tailor", wait_until="domcontentloaded")
            await asyncio.sleep(2)
            print("  [OK] Navigated to /tailor")

            # Check for sync scroll toggle
            sync_scroll = page.locator('text=/Sync Scroll/i')
            sync_count = await sync_scroll.count()
            status = "Found" if sync_count > 0 else "Not found"
            print(f"  Sync Scroll feature: {status}")

            print("\n" + "=" * 80)
            print("TESTS COMPLETE")
            print("=" * 80)
            print("\nKeeping browser open for 45 seconds for manual inspection...")
            await asyncio.sleep(45)

        except Exception as e:
            print(f"\n[ERROR] {e}")
            import traceback
            traceback.print_exc()
            await page.screenshot(path="test_error.png")
            await asyncio.sleep(30)

        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(test_features())
