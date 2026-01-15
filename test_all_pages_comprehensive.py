"""
Comprehensive frontend test - ALL pages and features
Tests with real resume upload and AI generation
"""
import asyncio
from playwright.async_api import async_playwright
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

async def test_all_pages():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, slow_mo=500)
        context = await browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = await context.new_page()

        console_errors = []
        api_errors = []

        page.on('console', lambda msg: console_errors.append(msg.text) if msg.type == 'error' else None)
        page.on('response', lambda response: api_errors.append(f"{response.status} {response.url}") if response.status >= 400 else None)

        print("=" * 80)
        print("COMPREHENSIVE FRONTEND TEST - ALL PAGES")
        print("=" * 80)

        # ============================================================
        # PART 1: /tailor PAGE - UPLOAD & GENERATION
        # ============================================================
        print("\n[PART 1] Testing /tailor page...")
        await page.goto('https://talorme.com/tailor', wait_until='networkidle', timeout=60000)
        await page.wait_for_timeout(2000)

        user_id = await page.evaluate('() => localStorage.getItem("talor_user_id")')
        print(f"User ID: {user_id}")

        # Check for theme toggle
        theme_toggle = await page.query_selector('[data-testid="theme-toggle"]')
        print(f"Theme toggle: {'OK FOUND' if theme_toggle else 'X NOT FOUND'}")

        # Check for resumes
        select_buttons = await page.query_selector_all('button:has-text("Select")')
        print(f"Base resumes available: {len(select_buttons)}")

        if not select_buttons:
            print("\n[1.1] No resumes found - uploading new one...")

            # Look for upload button
            upload_area = await page.query_selector('input[type="file"]')
            if upload_area:
                resume_path = r"C:\Users\derri\Downloads\Diamond_Marie_Dixon_Resume_Final (4) (2).docx"
                await upload_area.set_input_files(resume_path)
                print("OK Resume file selected")

                await page.wait_for_timeout(3000)

                # Check if upload succeeded
                select_buttons = await page.query_selector_all('button:has-text("Select")')
                print(f"Resumes after upload: {len(select_buttons)}")
            else:
                print("X Upload input not found")

        # Select first resume
        if select_buttons:
            print("\n[1.2] Selecting resume and filling job details...")
            await select_buttons[0].click()
            await page.wait_for_timeout(1000)

            # Fill job details
            company_input = await page.query_selector('input[placeholder*="Company"], input[name="company"]')
            if company_input:
                await company_input.fill("Amazon")
                print("OK Company filled")

            title_input = await page.query_selector('input[placeholder*="Title"], input[name="jobTitle"]')
            if title_input:
                await title_input.fill("Security Delivery Practice Manager")
                print("OK Job title filled")

            url_input = await page.query_selector('input[placeholder*="URL"], input[name="jobUrl"]')
            if url_input:
                await url_input.fill("https://www.amazon.jobs/en/jobs/3048245/security-delivery-practice-manager")
                print("OK Job URL filled")

            # Generate tailored resume
            print("\n[1.3] Starting generation (waiting up to 3 minutes)...")
            generate_btn = await page.query_selector('button:has-text("Generate")')
            if generate_btn:
                await generate_btn.click()
                print("OK Generate clicked")

                # Wait for generation with progress updates
                for i in range(18):  # 180 seconds = 3 minutes
                    await page.wait_for_timeout(10000)
                    print(f"   ... {(i+1)*10} seconds elapsed")

                    # Check for comparison view
                    comparison = await page.query_selector('text=Resume Comparison')
                    if comparison:
                        print(f"\nOK OK OK GENERATION COMPLETE after {(i+1)*10} seconds!")
                        break

                    # Check for errors
                    error_msg = await page.query_selector('text=Error, text=Failed')
                    if error_msg:
                        error_text = await error_msg.inner_text()
                        print(f"\nX Generation failed: {error_text}")
                        break

        # ============================================================
        # PART 2: COMPARISON VIEW & ANALYSIS FEATURES
        # ============================================================
        print("\n[PART 2] Testing comparison view and analysis...")
        await page.wait_for_timeout(3000)

        comparison_view = await page.query_selector('text=Resume Comparison')
        if comparison_view:
            print("OK OK OK Comparison view loaded!")

            # Test "What Changed?" section
            print("\n[2.1] Testing 'What Changed?' analysis...")
            what_changed = await page.query_selector('text=What Changed')
            if what_changed:
                await what_changed.click()
                await page.wait_for_timeout(5000)

                # Look for the analysis data (NOT hardcoded values)
                analysis_content = await page.query_selector('[data-testid="resume-analysis"]')
                if analysis_content:
                    text = await analysis_content.inner_text()
                    # Check if it's NOT showing hardcoded data
                    if "+12" in text and "42%" in text and "95/10" in text:
                        print("X STILL SHOWING HARDCODED DATA!")
                        print(f"   Content: {text[:200]}")
                    else:
                        print("OK OK OK Showing REAL AI-generated analysis!")
                        print(f"   Content preview: {text[:200]}")
                else:
                    print("X Analysis content not found")

            # Test Keywords Panel
            print("\n[2.2] Testing Keywords Panel...")
            keywords_section = await page.query_selector('text=Keywords Added')
            if keywords_section:
                await keywords_section.click()
                await page.wait_for_timeout(5000)

                keyword_panel = await page.query_selector('[data-testid="keyword-panel"]')
                if keyword_panel:
                    text = await keyword_panel.inner_text()
                    print(f"OK OK OK Keywords loaded!")
                    print(f"   Content preview: {text[:200]}")
                else:
                    print("X Keyword panel not found")

            # Test Match Score
            print("\n[2.3] Testing Match Score...")
            match_score_section = await page.query_selector('text=Match Score')
            if match_score_section:
                await match_score_section.click()
                await page.wait_for_timeout(5000)

                match_score = await page.query_selector('[data-testid="match-score"]')
                if match_score:
                    text = await match_score.inner_text()
                    print(f"OK OK OK Match score loaded!")
                    print(f"   Content: {text[:200]}")
                else:
                    print("X Match score not found")

            # Test Section Navigation
            print("\n[2.4] Testing section navigation buttons...")
            section_buttons = await page.query_selector_all('button:has-text("Summary"), button:has-text("Experience"), button:has-text("Skills")')
            if section_buttons:
                print(f"OK Found {len(section_buttons)} section buttons")

                # Click Summary button
                summary_btn = await page.query_selector('button:has-text("Summary")')
                if summary_btn:
                    await summary_btn.click()
                    await page.wait_for_timeout(1000)
                    print("OK Summary navigation works")

            # Test Download Buttons
            print("\n[2.5] Testing download buttons...")
            download_docx = await page.query_selector('button:has-text("Download DOCX")')
            download_pdf = await page.query_selector('button:has-text("Download PDF")')

            print(f"Download DOCX button: {'OK FOUND' if download_docx else 'X NOT FOUND'}")
            print(f"Download PDF button: {'OK FOUND' if download_pdf else 'X NOT FOUND'}")

            # Screenshot comparison view
            await page.screenshot(path='test_comparison_view.png', full_page=True)
            print("\nScreenshot saved: test_comparison_view.png")

        # ============================================================
        # PART 3: INTERVIEW PREP PAGE
        # ============================================================
        print("\n[PART 3] Testing /interview-prep page...")

        # Click "View Interview Prep" button
        interview_btn = await page.query_selector('button:has-text("View Interview Prep")')
        if interview_btn:
            await interview_btn.click()
            await page.wait_for_timeout(3000)
            print("OK Navigated to interview prep")

            # Check for interview prep sections
            print("\n[3.1] Checking interview prep sections...")

            common_questions = await page.query_selector('text=Common Interview Questions')
            behavioral = await page.query_selector('text=Behavioral Questions')
            technical = await page.query_selector('text=Technical Questions')
            certifications = await page.query_selector('text=Recommended Certifications')

            print(f"Common Questions: {'OK FOUND' if common_questions else 'X NOT FOUND'}")
            print(f"Behavioral Questions: {'OK FOUND' if behavioral else 'X NOT FOUND'}")
            print(f"Technical Questions: {'OK FOUND' if technical else 'X NOT FOUND'}")
            print(f"Certifications: {'OK FOUND' if certifications else 'X NOT FOUND'}")

            # Test certifications section
            if certifications:
                print("\n[3.2] Testing certifications...")
                await certifications.click()
                await page.wait_for_timeout(8000)  # AI generation time

                cert_component = await page.query_selector('[data-testid="certification-recommendations"]')
                if cert_component:
                    text = await cert_component.inner_text()
                    print("OK OK OK Certifications loaded!")
                    print(f"   Content preview: {text[:200]}")
                else:
                    print("X Certification component not found")

            # Screenshot interview prep
            await page.screenshot(path='test_interview_prep.png', full_page=True)
            print("\nScreenshot saved: test_interview_prep.png")

        # ============================================================
        # PART 4: NAVIGATION & THEME TOGGLE
        # ============================================================
        print("\n[PART 4] Testing navigation and theme...")

        # Go back to tailor page
        await page.goto('https://talorme.com/tailor', wait_until='networkidle')
        await page.wait_for_timeout(2000)
        print("OK Navigated back to /tailor")

        # Check if last tailored resume is still visible (persistence)
        comparison_after_nav = await page.query_selector('text=Resume Comparison')
        if comparison_after_nav:
            print("OK OK OK Resume persistence working! Last tailored resume still visible")
        else:
            print("X Resume persistence NOT working")

        # Test theme toggle
        print("\n[4.1] Testing theme toggle...")
        theme_btn = await page.query_selector('[data-testid="theme-toggle"]')
        if theme_btn:
            # Get current theme
            html = await page.query_selector('html')
            current_theme = await html.get_attribute('class')
            print(f"Current theme: {current_theme}")

            # Toggle theme
            await theme_btn.click()
            await page.wait_for_timeout(500)

            new_theme = await html.get_attribute('class')
            print(f"New theme: {new_theme}")

            if current_theme != new_theme:
                print("OK OK OK Theme toggle works!")
            else:
                print("X Theme did not change")

        # Test "Start New Resume" button
        print("\n[4.2] Testing 'Start New Resume' button...")
        reset_btn = await page.query_selector('button:has-text("Start New Resume")')
        if reset_btn:
            await reset_btn.click()
            await page.wait_for_timeout(1000)

            # Check if form is reset
            comparison_after_reset = await page.query_selector('text=Resume Comparison')
            if not comparison_after_reset:
                print("OK OK OK Reset button works! Form cleared")
            else:
                print("X Reset button did not clear form")

        # ============================================================
        # SUMMARY
        # ============================================================
        print("\n" + "=" * 80)
        print("TEST SUMMARY")
        print("=" * 80)

        print(f"\nConsole Errors: {len(console_errors)}")
        if console_errors:
            critical = [e for e in console_errors if 'CORS' in e or 'Failed' in e or '500' in e]
            if critical:
                print(f"X {len(critical)} CRITICAL errors:")
                for e in critical[:5]:
                    print(f"   - {e[:150]}")
            else:
                print("OK No critical console errors")
        else:
            print("OK OK OK No console errors!")

        print(f"\nAPI Errors: {len(api_errors)}")
        if api_errors:
            print("X API errors detected:")
            for e in api_errors[:10]:
                print(f"   - {e}")
        else:
            print("OK OK OK All API calls successful!")

        print("\n" + "=" * 80)
        print("COMPREHENSIVE TEST COMPLETE")
        print("=" * 80)

        await browser.close()

if __name__ == '__main__':
    asyncio.run(test_all_pages())
