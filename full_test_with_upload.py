"""
Full end-to-end test with file upload
Uploads real resume, generates tailored version, tests all endpoints
"""
import asyncio
from playwright.async_api import async_playwright
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

async def full_test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, slow_mo=500)
        context = await browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = await context.new_page()

        # Capture console messages
        console_errors = []
        def handle_console(msg):
            if msg.type == 'error' or 'Error' in msg.text or 'CORS' in msg.text:
                console_errors.append(msg.text)
                print(f"[CONSOLE ERROR] {msg.text[:200]}")

        page.on('console', handle_console)

        # Capture API responses for debugging
        api_errors = []
        async def handle_response(response):
            if 'api' in response.url and not response.ok:
                try:
                    body = await response.text()
                    api_errors.append({
                        'url': response.url,
                        'status': response.status,
                        'body': body
                    })
                    print(f"[API ERROR] {response.status} {response.url}")
                    print(f"  Body: {body[:500]}")
                except:
                    pass

        page.on('response', handle_response)

        print("=" * 80)
        print("FULL END-TO-END TEST WITH FILE UPLOAD")
        print("=" * 80)

        # STEP 1: Upload resume
        print("\n[STEP 1] Uploading resume...")
        await page.goto('https://talorme.com/upload', wait_until='networkidle', timeout=60000)
        await page.wait_for_timeout(2000)

        resume_path = r"C:\Users\derri\Downloads\Diamond_Marie_Dixon_Resume_Final (4) (2).docx"

        file_input = await page.query_selector('input[type="file"]')
        if file_input:
            await file_input.set_input_files(resume_path)
            print("✓ File selected, waiting for upload...")

            try:
                await page.wait_for_selector('text=successfully, text=Success', timeout=30000)
                print("✓✓✓ RESUME UPLOADED SUCCESSFULLY!")
                await page.wait_for_timeout(3000)
            except:
                print("⚠️  Upload may have failed or timed out")
                await page.screenshot(path='upload_error.png')
        else:
            print("❌ File input not found")
            await browser.close()
            return

        # STEP 2: Navigate to tailor page
        print("\n[STEP 2] Navigating to /tailor page...")
        await page.goto('https://talorme.com/tailor', wait_until='networkidle', timeout=60000)
        await page.wait_for_timeout(3000)

        # Get user ID
        user_id = await page.evaluate('() => localStorage.getItem("talor_user_id")')
        print(f"User ID: {user_id}")

        # Check for resumes
        select_buttons = await page.query_selector_all('button:has-text("Select")')
        print(f"Found {len(select_buttons)} base resume(s)")

        if not select_buttons:
            print("❌ No resumes found after upload")
            await browser.close()
            return

        # STEP 3: Select resume and fill job details
        print("\n[STEP 3] Selecting resume and filling job details...")
        await select_buttons[0].click()
        await page.wait_for_timeout(1000)
        print("✓ Resume selected")

        # Fill company
        company_input = await page.query_selector('input[placeholder*="Company"], input[name="company"]')
        if company_input:
            await company_input.fill("Amazon")
            print("✓ Company: Amazon")

        # Fill title
        title_input = await page.query_selector('input[placeholder*="Title"], input[name="jobTitle"]')
        if title_input:
            await title_input.fill("Security Delivery Practice Manager")
            print("✓ Title: Security Delivery Practice Manager")

        # Fill URL
        url_input = await page.query_selector('input[placeholder*="URL"], input[name="jobUrl"]')
        if url_input:
            await url_input.fill("https://www.amazon.jobs/en/jobs/3048245/security-delivery-practice-manager")
            print("✓ URL: https://www.amazon.jobs/en/jobs/3048245/...")

        # STEP 4: Generate tailored resume
        print("\n[STEP 4] Generating tailored resume (THIS WILL TAKE 60-90 SECONDS)...")
        generate_btn = await page.query_selector('button:has-text("Generate")')
        if generate_btn:
            await generate_btn.click()
            print("✓ Clicked generate button")
            print("⏳ Waiting for AI to analyze and tailor resume...")

            try:
                await page.wait_for_selector('text=Success, text=Error', timeout=120000)

                success = await page.query_selector('text=Success')
                if success:
                    print("✓✓✓ RESUME GENERATED SUCCESSFULLY!")
                    await page.wait_for_timeout(5000)

                    # Take screenshot of comparison view
                    await page.screenshot(path='generation_success.png', full_page=True)
                    print("📸 Screenshot: generation_success.png")

                    # STEP 5: Check analysis components
                    print("\n[STEP 5] Checking analysis components...")

                    # Wait a bit for analysis to load
                    await page.wait_for_timeout(3000)

                    match_score = await page.query_selector('[data-testid="match-score"]')
                    print(f"Match Score: {'✓ FOUND' if match_score else '✗ NOT FOUND'}")

                    resume_analysis = await page.query_selector('[data-testid="resume-analysis"]')
                    print(f"Resume Analysis: {'✓ FOUND' if resume_analysis else '✗ NOT FOUND'}")

                    keyword_panel = await page.query_selector('[data-testid="keyword-panel"]')
                    print(f"Keyword Panel: {'✓ FOUND' if keyword_panel else '✗ NOT FOUND'}")

                    # STEP 6: Test Interview Prep
                    print("\n[STEP 6] Testing Interview Prep...")
                    interview_btn = await page.query_selector('button:has-text("View Interview Prep")')
                    if interview_btn:
                        await interview_btn.click()
                        await page.wait_for_timeout(5000)
                        print("✓ Navigated to Interview Prep")

                        # Check for certifications section
                        cert_section = await page.query_selector('text=Recommended Certifications')
                        if cert_section:
                            print("✓ Certifications section found")
                            await cert_section.click()
                            await page.wait_for_timeout(5000)

                            cert_component = await page.query_selector('[data-testid="certification-recommendations"]')
                            if cert_component:
                                print("✓✓✓ CERTIFICATIONS LOADED!")
                            else:
                                print("✗ Certifications component not loaded")

                        await page.screenshot(path='interview_prep_page.png', full_page=True)
                        print("📸 Screenshot: interview_prep_page.png")

                else:
                    print("❌ Generation failed")
                    error_elem = await page.query_selector('text=Error')
                    if error_elem:
                        error_text = await error_elem.inner_text()
                        print(f"Error message: {error_text}")

            except Exception as e:
                print(f"❌ Generation timeout or error: {e}")
                await page.screenshot(path='generation_error.png', full_page=True)

        # STEP 7: Analyze API errors
        print("\n" + "=" * 80)
        print("API ERROR ANALYSIS")
        print("=" * 80)

        if api_errors:
            print(f"\n❌ Found {len(api_errors)} API errors:\n")
            for error in api_errors:
                print(f"URL: {error['url']}")
                print(f"Status: {error['status']}")
                print(f"Response: {error['body'][:500]}")
                print("-" * 80)
        else:
            print("\n✅ No API errors detected!")

        # STEP 8: Analyze console errors
        print("\n" + "=" * 80)
        print("CONSOLE ERROR ANALYSIS")
        print("=" * 80)

        critical_errors = [e for e in console_errors if 'CORS' in e or 'Failed' in e or '500' in e or '404' in e]
        if critical_errors:
            print(f"\n❌ Found {len(critical_errors)} critical console errors:\n")
            for error in critical_errors[:10]:
                print(f"  - {error[:200]}")
        else:
            print("\n✅ No critical console errors!")

        print("\n" + "=" * 80)
        print("TEST COMPLETE")
        print("=" * 80)

        await browser.close()

if __name__ == '__main__':
    asyncio.run(full_test())
