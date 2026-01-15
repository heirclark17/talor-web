"""
Test that the fixed resume analysis endpoints work correctly
"""
import asyncio
from playwright.async_api import async_playwright
import json

async def test_fixed_endpoints():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = await context.new_page()

        console_errors = []
        page.on('console', lambda msg: console_errors.append(msg.text) if msg.type == 'error' else None)

        print("=" * 80)
        print("TESTING FIXED ENDPOINTS")
        print("=" * 80)

        # Navigate to tailor page
        print("\n[1] Navigating to /tailor...")
        await page.goto('https://talorme.com/tailor', wait_until='networkidle', timeout=60000)
        await page.wait_for_timeout(3000)

        user_id = await page.evaluate('() => localStorage.getItem("talor_user_id")')
        print(f"User ID: {user_id}")

        # Check for resumes
        select_buttons = await page.query_selector_all('button:has-text("Select")')
        print(f"\n[2] Found {len(select_buttons)} resumes")

        if not select_buttons:
            print("❌ No resumes available. Please upload a resume first.")
            await browser.close()
            return

        # Select first resume
        await select_buttons[0].click()
        await page.wait_for_timeout(1000)
        print("✓ Selected resume")

        # Fill job details
        company_input = await page.query_selector('input[placeholder*="Company"]')
        if company_input:
            await company_input.fill("Test Company Inc")

        title_input = await page.query_selector('input[placeholder*="Title"]')
        if title_input:
            await title_input.fill("Senior Test Engineer")

        url_input = await page.query_selector('input[placeholder*="URL"]')
        if url_input:
            await url_input.fill("https://example.com/job/12345")

        print("✓ Filled job details")

        # Click generate
        print("\n[3] Generating tailored resume (this will take 60-90 seconds)...")
        generate_btn = await page.query_selector('button:has-text("Generate")')
        if generate_btn:
            await generate_btn.click()

            try:
                # Wait for success or error
                await page.wait_for_selector('text=Success, text=Error', timeout=120000)
                print("✓ Generation completed!")

                # Wait for analysis to load
                await page.wait_for_timeout(5000)

                # Check console errors
                print("\n[4] Console errors:")
                if console_errors:
                    for error in console_errors:
                        if 'CORS' in error or 'Failed' in error or '404' in error or '500' in error:
                            print(f"  ❌ {error}")
                else:
                    print("  ✓ No console errors!")

                # Check if analysis components loaded
                print("\n[5] Checking analysis components...")

                # Check What Changed section
                what_changed = await page.query_selector('text=What Changed')
                if what_changed:
                    print("  ✓ What Changed section found")

                # Check for loading or data
                match_score_elem = await page.query_selector('[data-testid="match-score"]')
                if match_score_elem:
                    print("  ✓ Match Score component found")
                    text = await match_score_elem.inner_text()
                    print(f"     {text[:100]}")

                analysis_elem = await page.query_selector('[data-testid="resume-analysis"]')
                if analysis_elem:
                    print("  ✓ Resume Analysis component found")

                keyword_elem = await page.query_selector('[data-testid="keyword-panel"]')
                if keyword_elem:
                    print("  ✓ Keyword Panel component found")

                # Test download button
                print("\n[6] Testing download button...")
                download_btn = await page.query_selector('button:has-text("Download")')
                if download_btn:
                    async with page.expect_download() as download_info:
                        await download_btn.click()
                        download = await download_info.value
                        print(f"  ✓ Download started: {download.suggested_filename}")

                # Take screenshot
                await page.screenshot(path='test_success.png', full_page=True)
                print("\n📸 Screenshot saved: test_success.png")

            except Exception as e:
                print(f"\n❌ Error: {e}")
                await page.screenshot(path='test_error.png', full_page=True)
                print("📸 Error screenshot saved: test_error.png")

        print("\n" + "=" * 80)
        print("TEST COMPLETE")
        print("=" * 80)

        await browser.close()

if __name__ == '__main__':
    asyncio.run(test_fixed_endpoints())
