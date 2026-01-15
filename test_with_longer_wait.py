"""
Extended test with longer wait time for AI generation
"""
import asyncio
from playwright.async_api import async_playwright
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

async def test_with_patience():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, slow_mo=300)
        context = await browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = await context.new_page()

        console_errors = []
        page.on('console', lambda msg: console_errors.append(msg.text) if msg.type == 'error' else None)

        print("=" * 80)
        print("EXTENDED TEST - WAITING UP TO 3 MINUTES FOR GENERATION")
        print("=" * 80)

        # Navigate to tailor
        print("\n[1] Going to /tailor page...")
        await page.goto('https://talorme.com/tailor', wait_until='networkidle', timeout=60000)
        await page.wait_for_timeout(3000)

        user_id = await page.evaluate('() => localStorage.getItem("talor_user_id")')
        print(f"User ID: {user_id}")

        # Check for resumes
        select_buttons = await page.query_selector_all('button:has-text("Select")')
        print(f"Base resumes available: {len(select_buttons)}")

        if not select_buttons:
            print("\n❌ No resumes. Upload one at https://talorme.com/upload")
            await browser.close()
            return

        # Select resume
        print("\n[2] Selecting resume and filling job details...")
        await select_buttons[0].click()
        await page.wait_for_timeout(1000)

        # Fill form
        company_input = await page.query_selector('input[placeholder*="Company"], input[name="company"]')
        if company_input:
            await company_input.fill("Amazon")

        title_input = await page.query_selector('input[placeholder*="Title"], input[name="jobTitle"]')
        if title_input:
            await title_input.fill("Security Delivery Practice Manager")

        url_input = await page.query_selector('input[placeholder*="URL"], input[name="jobUrl"]')
        if url_input:
            await url_input.fill("https://www.amazon.jobs/en/jobs/3048245/security-delivery-practice-manager")

        print("✓ Form filled")

        # Generate
        print("\n[3] Starting generation (waiting up to 3 minutes)...")
        generate_btn = await page.query_selector('button:has-text("Generate")')
        if generate_btn:
            await generate_btn.click()
            print("✓ Generate clicked")

            # Wait longer - 180 seconds (3 minutes)
            print("⏳ Waiting patiently for AI to complete...")

            for i in range(18):  # 18 x 10 seconds = 180 seconds
                await page.wait_for_timeout(10000)
                print(f"   ... {(i+1)*10} seconds elapsed")

                # Check if comparison view appeared
                comparison = await page.query_selector('text=Resume Comparison')
                if comparison:
                    print(f"\n✓✓✓ SUCCESS after {(i+1)*10} seconds!")
                    break

                # Check for error
                error_msg = await page.query_selector('text=Error, text=Failed')
                if error_msg:
                    error_text = await error_msg.inner_text()
                    print(f"\n❌ Generation failed: {error_text}")
                    break

            # Final check
            await page.wait_for_timeout(3000)

            print("\n[4] Checking final state...")

            # Check for comparison view
            comparison = await page.query_selector('text=Resume Comparison')
            if comparison:
                print("✓✓✓ COMPARISON VIEW ACTIVE!")

                # Check for analysis components
                print("\n[5] Checking analysis components...")

                what_changed = await page.query_selector('text=What Changed')
                print(f"What Changed: {'✓ FOUND' if what_changed else '✗ NOT FOUND'}")

                match_score = await page.query_selector('[data-testid="match-score"]')
                print(f"Match Score: {'✓ FOUND' if match_score else '✗ NOT FOUND'}")

                analysis = await page.query_selector('[data-testid="resume-analysis"]')
                print(f"Resume Analysis: {'✓ FOUND' if analysis else '✗ NOT FOUND'}")

                keywords = await page.query_selector('[data-testid="keyword-panel"]')
                print(f"Keyword Panel: {'✓ FOUND' if keywords else '✗ NOT FOUND'}")

                # Test interview prep
                print("\n[6] Testing Interview Prep...")
                interview_btn = await page.query_selector('button:has-text("View Interview Prep")')
                if interview_btn:
                    await interview_btn.click()
                    await page.wait_for_timeout(5000)
                    print("✓ Navigated to Interview Prep")

                    # Check certifications
                    cert_section = await page.query_selector('text=Recommended Certifications')
                    if cert_section:
                        await cert_section.click()
                        await page.wait_for_timeout(5000)

                        cert_component = await page.query_selector('[data-testid="certification-recommendations"]')
                        print(f"Certifications: {'✓✓✓ LOADED!' if cert_component else '✗ NOT LOADED'}")

                await page.screenshot(path='final_test_success.png', full_page=True)
                print("\n📸 Screenshot: final_test_success.png")

            else:
                print("⚠️  Generation may still be in progress or failed silently")
                await page.screenshot(path='final_test_timeout.png', full_page=True)

        # Console error check
        print("\n[7] Console Error Summary:")
        critical = [e for e in console_errors if 'CORS' in e or 'Failed' in e or '500' in e]
        if critical:
            print(f"❌ {len(critical)} critical errors:")
            for e in critical[:5]:
                print(f"   - {e[:150]}")
        else:
            print("✅ No critical console errors!")

        print("\n" + "=" * 80)
        print("TEST COMPLETE")
        print("=" * 80)

        await browser.close()

if __name__ == '__main__':
    asyncio.run(test_with_patience())
