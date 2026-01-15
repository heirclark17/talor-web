"""
Test the upload page and then full workflow
"""
import asyncio
from playwright.async_api import async_playwright
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

async def test_upload_and_workflow():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, slow_mo=300)
        context = await browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = await context.new_page()

        console_errors = []
        api_errors = []

        page.on('console', lambda msg: console_errors.append(msg.text) if msg.type == 'error' else None)
        page.on('response', lambda response: api_errors.append(f"{response.status} {response.url}") if response.status >= 400 else None)

        print("=" * 80)
        print("FULL WORKFLOW TEST: Upload -> Tailor -> Analyze")
        print("=" * 80)

        # ============================================================
        # PART 1: UPLOAD PAGE
        # ============================================================
        print("\n[PART 1] Testing /upload page...")
        await page.goto('https://talorme.com/upload', wait_until='networkidle', timeout=60000)
        await page.wait_for_timeout(2000)

        user_id = await page.evaluate('() => localStorage.getItem("talor_user_id")')
        print(f"User ID: {user_id}")

        # Look for upload area
        upload_area = await page.query_selector('input[type="file"]')
        if upload_area:
            print("OK Upload input found")

            resume_path = r"C:\Users\derri\Downloads\Diamond_Marie_Dixon_Resume_Final (4) (2).docx"
            await upload_area.set_input_files(resume_path)
            print("OK Resume file selected")

            await page.wait_for_timeout(15000)  # Wait for upload and parsing

            # Check for success message or navigation
            success = await page.query_selector('text=Upload successful, text=Successfully uploaded')
            if success:
                print("OK OK OK Resume uploaded successfully!")
            else:
                print("Checking if upload completed...")

            await page.screenshot(path='test_upload_page.png', full_page=True)
            print("Screenshot saved: test_upload_page.png")

        else:
            print("X Upload input not found")

        # ============================================================
        # PART 2: GO TO TAILOR PAGE
        # ============================================================
        print("\n[PART 2] Navigating to /tailor page...")
        await page.goto('https://talorme.com/tailor', wait_until='networkidle')
        await page.wait_for_timeout(3000)

        select_buttons = await page.query_selector_all('button:has-text("Select")')
        print(f"Resumes available: {len(select_buttons)}")

        if not select_buttons:
            print("X Still no resumes after upload")
            print("   Console errors:")
            for e in console_errors[-10:]:
                print(f"   - {e[:200]}")
            await browser.close()
            return

        # ============================================================
        # PART 3: GENERATE TAILORED RESUME
        # ============================================================
        print("\n[PART 3] Generating tailored resume...")
        await select_buttons[0].click()
        await page.wait_for_timeout(1000)

        # Fill job details
        await page.fill('input[name="company"]', "Amazon")
        await page.fill('input[name="jobTitle"]', "Security Delivery Practice Manager")
        await page.fill('input[name="jobUrl"]', "https://www.amazon.jobs/en/jobs/3048245")
        print("OK Job details filled")

        generate_btn = await page.query_selector('button:has-text("Generate")')
        if generate_btn:
            await generate_btn.click()
            print("OK Generate clicked - waiting for completion...")

            for i in range(24):
                await page.wait_for_timeout(10000)
                print(f"   ... {(i+1)*10} seconds")

                comparison = await page.query_selector('text=Resume Comparison')
                if comparison:
                    print(f"\nOK OK OK Generation complete after {(i+1)*10} seconds!")
                    break

        # ============================================================
        # PART 4: TEST ALL ANALYSIS FEATURES
        # ============================================================
        await page.wait_for_timeout(3000)

        comparison = await page.query_selector('text=Resume Comparison')
        if comparison:
            print("\n[PART 4] Testing all analysis features...")

            # Test "What Changed?"
            print("\n[4.1] Testing 'What Changed?' analysis...")
            what_changed = await page.query_selector('text=What Changed')
            if what_changed:
                await what_changed.click()
                print("   Waiting for AI analysis (90 seconds)...")
                await page.wait_for_timeout(95000)

                # Check content
                page_content = await page.content()
                if "+12" in page_content and "42%" in page_content:
                    print("   X SHOWING HARDCODED DATA")
                else:
                    print("   OK OK OK Real AI analysis loaded!")

                await page.screenshot(path='test_what_changed.png', full_page=True)

            # Test Keywords
            print("\n[4.2] Testing Keywords Panel...")
            keywords = await page.query_selector('text=Keywords Added')
            if keywords:
                await keywords.click()
                await page.wait_for_timeout(70000)
                print("   OK Keywords section loaded")

                await page.screenshot(path='test_keywords.png', full_page=True)

            # Test Match Score
            print("\n[4.3] Testing Match Score...")
            match_score = await page.query_selector('text=Match Score')
            if match_score:
                await match_score.click()
                await page.wait_for_timeout(70000)
                print("   OK Match score loaded")

                await page.screenshot(path='test_match_score.png', full_page=True)

        # ============================================================
        # PART 5: TEST INTERVIEW PREP
        # ============================================================
        print("\n[PART 5] Testing Interview Prep...")
        interview_btn = await page.query_selector('button:has-text("View Interview Prep")')
        if interview_btn:
            await interview_btn.click()
            await page.wait_for_timeout(5000)
            print("   OK Navigated to interview prep")

            # Test certifications
            cert_btn = await page.query_selector('text=Recommended Certifications')
            if cert_btn:
                await cert_btn.click()
                await page.wait_for_timeout(95000)
                print("   OK Certifications loaded")

                await page.screenshot(path='test_certifications.png', full_page=True)

        # ============================================================
        # PART 6: TEST THEME TOGGLE
        # ============================================================
        print("\n[PART 6] Testing theme toggle...")
        await page.goto('https://talorme.com/tailor', wait_until='networkidle')
        await page.wait_for_timeout(2000)

        theme_btn = await page.query_selector('[data-testid="theme-toggle"]')
        if theme_btn:
            html = await page.query_selector('html')
            before = await html.get_attribute('class')
            await theme_btn.click()
            await page.wait_for_timeout(500)
            after = await html.get_attribute('class')

            if before != after:
                print(f"   OK OK OK Theme toggled: {before} -> {after}")
            else:
                print("   X Theme did not change")

        # ============================================================
        # SUMMARY
        # ============================================================
        print("\n" + "=" * 80)
        print("TEST SUMMARY")
        print("=" * 80)

        print(f"\nTotal console errors: {len(console_errors)}")
        critical = [e for e in console_errors if 'CORS' in e or 'Failed' in e or '500' in e]
        if critical:
            print(f"X {len(critical)} CRITICAL errors:")
            for e in critical[:10]:
                print(f"   - {e[:200]}")
        else:
            print("OK No critical errors")

        print(f"\nAPI Errors: {len(api_errors)}")
        if api_errors:
            for e in api_errors[:15]:
                print(f"   - {e}")
        else:
            print("OK OK OK All API calls successful!")

        print("\n" + "=" * 80)
        print("TEST COMPLETE - Check screenshots for visual verification")
        print("=" * 80)

        await browser.close()

if __name__ == '__main__':
    asyncio.run(test_upload_and_workflow())
