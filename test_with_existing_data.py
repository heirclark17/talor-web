"""
Test all pages with existing production data
Uses the user's actual user_id with existing tailored resumes
"""
import asyncio
from playwright.async_api import async_playwright
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

async def test_with_existing_data():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, slow_mo=300)
        context = await browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = await context.new_page()

        console_errors = []
        api_errors = []

        page.on('console', lambda msg: console_errors.append(msg.text) if msg.type == 'error' else None)
        page.on('response', lambda response: api_errors.append(f"{response.status} {response.url}") if response.status >= 400 else None)

        print("=" * 80)
        print("TESTING WITH EXISTING PRODUCTION DATA")
        print("=" * 80)

        # Set the user's actual user ID
        USER_ID = "user_090a1e7e-e104-495d-bac8-e63056bcc477"

        await page.goto('https://talorme.com/tailor', wait_until='networkidle', timeout=60000)
        await page.wait_for_timeout(2000)

        # Set user ID in localStorage
        await page.evaluate(f'() => localStorage.setItem("talor_user_id", "{USER_ID}")')
        print(f"Set user ID: {USER_ID}")

        # Reload to apply user ID
        await page.reload(wait_until='networkidle')
        await page.wait_for_timeout(3000)

        # ============================================================
        # PART 1: CHECK FOR EXISTING RESUMES
        # ============================================================
        print("\n[PART 1] Checking for existing resumes...")

        select_buttons = await page.query_selector_all('button:has-text("Select")')
        print(f"Base resumes found: {len(select_buttons)}")

        if not select_buttons:
            print("X No resumes found - you need to upload a resume first")
            print("   Go to https://talorme.com/upload to upload a resume")
            await browser.close()
            return

        # ============================================================
        # PART 2: GENERATE NEW TAILORED RESUME
        # ============================================================
        print("\n[PART 2] Generating tailored resume...")

        await select_buttons[0].click()
        await page.wait_for_timeout(1000)

        # Fill job details
        company_input = await page.query_selector('input[placeholder*="Company"], input[name="company"]')
        if company_input:
            await company_input.clear()
            await company_input.fill("Microsoft")

        title_input = await page.query_selector('input[placeholder*="Title"], input[name="jobTitle"]')
        if title_input:
            await title_input.clear()
            await title_input.fill("Cybersecurity Program Manager")

        url_input = await page.query_selector('input[placeholder*="URL"], input[name="jobUrl"]')
        if url_input:
            await url_input.clear()
            await url_input.fill("https://careers.microsoft.com/us/en/job/1788096")

        print("OK Job details filled")

        # Generate
        generate_btn = await page.query_selector('button:has-text("Generate")')
        if generate_btn:
            await generate_btn.click()
            print("OK Generate clicked - waiting for completion...")

            # Wait up to 4 minutes for generation
            for i in range(24):
                await page.wait_for_timeout(10000)
                print(f"   ... {(i+1)*10} seconds")

                comparison = await page.query_selector('text=Resume Comparison')
                if comparison:
                    print(f"\nOK OK OK Generation complete after {(i+1)*10} seconds!")
                    break

                error_msg = await page.query_selector('text=Error, text=Failed')
                if error_msg:
                    error_text = await error_msg.inner_text()
                    print(f"\nX Generation failed: {error_text}")
                    break

        # ============================================================
        # PART 3: TEST "WHAT CHANGED?" ANALYSIS
        # ============================================================
        print("\n[PART 3] Testing 'What Changed?' AI analysis...")
        await page.wait_for_timeout(2000)

        what_changed = await page.query_selector('text=What Changed')
        if what_changed:
            await what_changed.click()
            print("OK Clicked 'What Changed?' - waiting for AI analysis...")
            await page.wait_for_timeout(90000)  # 90 seconds for AI

            # Check for analysis content
            analysis_section = await page.query_selector('[data-testid="resume-analysis"]')
            if analysis_section:
                text = await analysis_section.inner_text()

                # Check if showing hardcoded data
                if "+12" in text and "42%" in text and "95" in text:
                    print("X X X STILL SHOWING HARDCODED DATA!")
                    print("   This means the API call failed or returned hardcoded fallback")
                    print(f"   Content: {text[:300]}")
                else:
                    print("OK OK OK SHOWING REAL AI ANALYSIS!")
                    print(f"   Content preview: {text[:300]}")
            else:
                print("X Analysis section not found")

                # Check for loading state
                loading = await page.query_selector('text=Loading, text=Analyzing')
                if loading:
                    print("   Still loading... waiting more...")
                    await page.wait_for_timeout(60000)

        # ============================================================
        # PART 4: TEST KEYWORDS PANEL
        # ============================================================
        print("\n[PART 4] Testing Keywords Panel...")

        keywords_btn = await page.query_selector('text=Keywords Added')
        if keywords_btn:
            await keywords_btn.click()
            print("OK Clicked 'Keywords' - waiting for AI analysis...")
            await page.wait_for_timeout(60000)

            keyword_panel = await page.query_selector('[data-testid="keyword-panel"]')
            if keyword_panel:
                text = await keyword_panel.inner_text()
                print(f"OK OK OK Keywords loaded!")
                print(f"   Preview: {text[:200]}")
            else:
                print("X Keyword panel not found")

        # ============================================================
        # PART 5: TEST MATCH SCORE
        # ============================================================
        print("\n[PART 5] Testing Match Score...")

        match_score_btn = await page.query_selector('text=Match Score')
        if match_score_btn:
            await match_score_btn.click()
            print("OK Clicked 'Match Score' - waiting for AI calculation...")
            await page.wait_for_timeout(60000)

            match_score = await page.query_selector('[data-testid="match-score"]')
            if match_score:
                text = await match_score.inner_text()
                print(f"OK OK OK Match score calculated!")
                print(f"   Score: {text[:100]}")
            else:
                print("X Match score not found")

        # Screenshot
        await page.screenshot(path='test_all_features.png', full_page=True)
        print("\nScreenshot saved: test_all_features.png")

        # ============================================================
        # PART 6: TEST INTERVIEW PREP
        # ============================================================
        print("\n[PART 6] Testing Interview Prep page...")

        interview_btn = await page.query_selector('button:has-text("View Interview Prep")')
        if interview_btn:
            await interview_btn.click()
            await page.wait_for_timeout(3000)
            print("OK Navigated to interview prep")

            # Test certifications
            cert_section = await page.query_selector('text=Recommended Certifications')
            if cert_section:
                await cert_section.click()
                print("OK Clicked 'Certifications' - waiting for AI recommendations...")
                await page.wait_for_timeout(90000)

                cert_component = await page.query_selector('[data-testid="certification-recommendations"]')
                if cert_component:
                    text = await cert_component.inner_text()
                    print(f"OK OK OK Certifications loaded!")
                    print(f"   Preview: {text[:200]}")
                else:
                    print("X Certification component not found")

            await page.screenshot(path='test_interview_prep_full.png', full_page=True)
            print("Screenshot saved: test_interview_prep_full.png")

        # ============================================================
        # PART 7: TEST DOWNLOADS
        # ============================================================
        print("\n[PART 7] Testing download functionality...")

        # Go back to tailor
        await page.goto('https://talorme.com/tailor', wait_until='networkidle')
        await page.wait_for_timeout(3000)

        comparison = await page.query_selector('text=Resume Comparison')
        if comparison:
            print("OK Comparison view loaded")

            # Try DOCX download
            download_docx = await page.query_selector('button:has-text("Download DOCX")')
            if download_docx:
                print("OK DOCX download button found")
                # Note: Not clicking to avoid actual download in test

            # Try PDF download
            download_pdf = await page.query_selector('button:has-text("Download PDF")')
            if download_pdf:
                print("OK PDF download button found")

        # ============================================================
        # SUMMARY
        # ============================================================
        print("\n" + "=" * 80)
        print("TEST SUMMARY")
        print("=" * 80)

        print(f"\nConsole Errors: {len(console_errors)}")
        critical = [e for e in console_errors if 'CORS' in e or 'Failed to fetch' in e or '500' in e or '404' in e]
        if critical:
            print(f"X {len(critical)} CRITICAL errors:")
            for e in critical[:10]:
                print(f"   - {e[:200]}")
        else:
            print("OK No critical console errors")

        print(f"\nAPI Errors: {len(api_errors)}")
        if api_errors:
            print("X API errors detected:")
            for e in api_errors[:15]:
                print(f"   - {e}")
        else:
            print("OK OK OK All API calls successful!")

        print("\n" + "=" * 80)
        await browser.close()

if __name__ == '__main__':
    asyncio.run(test_with_existing_data())
