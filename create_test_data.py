"""
Create test data and verify all features work end-to-end
"""
import asyncio
from playwright.async_api import async_playwright
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

async def create_and_test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, slow_mo=300)
        context = await browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = await context.new_page()

        api_calls = []
        page.on('request', lambda req: api_calls.append(req.url) if 'api' in req.url else None)

        print("=" * 80)
        print("CREATING TEST DATA AND VERIFYING ALL FEATURES")
        print("=" * 80)

        # Step 1: Go to homepage and upload resume
        print("\n[1] Uploading base resume...")
        await page.goto('https://talorme.com', wait_until='networkidle')
        await page.wait_for_timeout(2000)

        # Look for file upload
        file_input = await page.query_selector('input[type="file"]')
        if file_input:
            print("✓ Found file upload input")

            # Create a simple test resume file
            test_resume = """
JOHN DOE
john.doe@email.com | 555-0123

PROFESSIONAL SUMMARY
Senior Security Engineer with 10+ years experience in cybersecurity, cloud security, and compliance.

SKILLS
- Cloud Security (AWS, Azure, GCP)
- NIST Cybersecurity Framework
- ISO 27001, SOC 2
- Python, Security Automation
- Vulnerability Management
- SIEM Tools

EXPERIENCE
Senior Security Engineer | Tech Corp | 2020-Present
- Led security architecture for cloud migration
- Implemented NIST CSF controls
- Reduced security incidents by 45%

Security Engineer | Previous Corp | 2015-2020
- Managed vulnerability scanning program
- Achieved SOC 2 Type II certification
- Built security automation tools

EDUCATION
BS Computer Science | University | 2015

CERTIFICATIONS
- CISSP
- AWS Certified Security Specialty
"""
            # Write to temp file
            import tempfile
            import os
            with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
                f.write(test_resume)
                temp_file = f.name

            await file_input.set_input_files(temp_file)
            print("✓ File uploaded")
            await page.wait_for_timeout(3000)

            # Clean up
            os.unlink(temp_file)
        else:
            print("✗ File upload not found - checking if already on /tailor page")

        # Step 2: Navigate to tailor page
        print("\n[2] Navigating to /tailor page...")
        await page.goto('https://talorme.com/tailor', wait_until='networkidle')
        await page.wait_for_timeout(2000)

        # Check if we have resumes
        select_buttons = await page.query_selector_all('button:has-text("Select")')
        print(f"Found {len(select_buttons)} base resumes available")

        if select_buttons:
            print("\n[3] Selecting first resume...")
            await select_buttons[0].click()
            await page.wait_for_timeout(1000)
            print("✓ Resume selected")

            # Step 4: Fill job details
            print("\n[4] Filling job details...")

            # Company
            company_input = await page.query_selector('input[placeholder*="Company"]')
            if company_input:
                await company_input.fill("Amazon Web Services")
                print("✓ Company: Amazon Web Services")

            # Job Title
            title_input = await page.query_selector('input[placeholder*="Job Title"]')
            if title_input:
                await title_input.fill("Senior Security Engineer")
                print("✓ Title: Senior Security Engineer")

            # Job URL
            url_input = await page.query_selector('input[placeholder*="URL"]')
            if url_input:
                await url_input.fill("https://amazon.jobs/security")
                print("✓ URL: https://amazon.jobs/security")

            # Step 5: Generate tailored resume
            print("\n[5] Generating tailored resume...")
            generate_button = await page.query_selector('button:has-text("Generate Tailored Resume")')

            if generate_button:
                await generate_button.click()
                print("✓ Clicked generate button")

                # Wait for generation (this can take 10-30 seconds)
                print("⏳ Waiting for AI to generate resume (30-60 seconds)...")

                try:
                    # Wait for success message or result
                    await page.wait_for_selector('text=Success', timeout=90000)
                    print("✓ Resume generated successfully!")
                    await page.wait_for_timeout(5000)

                    # Step 6: Check for analysis components
                    print("\n[6] Checking for analysis components...")

                    match_score = await page.query_selector('[data-testid="match-score"]')
                    print(f"Match Score: {'✓ FOUND' if match_score else '✗ NOT FOUND'}")

                    resume_analysis = await page.query_selector('[data-testid="resume-analysis"]')
                    print(f"Resume Analysis: {'✓ FOUND' if resume_analysis else '✗ NOT FOUND'}")

                    keyword_panel = await page.query_selector('[data-testid="keyword-panel"]')
                    print(f"Keyword Panel: {'✓ FOUND' if keyword_panel else '✗ NOT FOUND'}")

                    # Take screenshot of success
                    await page.screenshot(path='with_analysis_components.png', full_page=True)
                    print("📸 Screenshot: with_analysis_components.png")

                    # Step 7: Click "View Interview Prep"
                    print("\n[7] Navigating to Interview Prep...")
                    interview_button = await page.query_selector('button:has-text("View Interview Prep")')
                    if interview_button:
                        await interview_button.click()
                        await page.wait_for_timeout(5000)
                        print("✓ On interview prep page")

                        # Step 8: Check certifications
                        print("\n[8] Testing certifications section...")
                        cert_header = await page.query_selector('text=Recommended Certifications')
                        if cert_header:
                            print("✓ Certifications section found")
                            await cert_header.click()
                            await page.wait_for_timeout(5000)

                            cert_component = await page.query_selector('[data-testid="certification-recommendations"]')
                            if cert_component:
                                print("✓ Certification recommendations loaded!")

                                # Check for certification cards
                                cert_cards = await page.query_selector_all('[data-testid*="cert-card"]')
                                print(f"✓ Found {len(cert_cards)} certification cards")
                            else:
                                print("✗ Certifications not loaded")

                                # Check for error messages
                                error = await page.query_selector('text=Error')
                                if error:
                                    error_text = await error.inner_text()
                                    print(f"Error message: {error_text}")
                        else:
                            print("✗ Certifications section not found")

                except Exception as e:
                    print(f"✗ Generation failed or timed out: {e}")

                    # Check for error messages
                    error_div = await page.query_selector('.border-red-500')
                    if error_div:
                        error_text = await error_div.inner_text()
                        print(f"Error shown: {error_text}")
            else:
                print("✗ Generate button not found")
        else:
            print("\n✗ No base resumes available - need to upload one first")
            print("Go to talorme.com and upload a resume, then run this test again")

        # Show API calls made
        print("\n[9] API Calls Made:")
        analysis_calls = [url for url in api_calls if 'resume-analysis' in url or 'certifications' in url]
        if analysis_calls:
            for url in analysis_calls:
                print(f"  ✓ {url}")
        else:
            print("  ⚠️  No analysis API calls made")

        print("\n" + "=" * 80)
        print("TEST COMPLETE")
        print("=" * 80)

        await browser.close()

if __name__ == '__main__':
    asyncio.run(create_and_test())
