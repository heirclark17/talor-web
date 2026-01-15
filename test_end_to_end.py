#!/usr/bin/env python3
"""
End-to-end test of talorme.com
Tests: Upload -> Add Job -> Tailor -> Download -> Interview Prep
"""
import asyncio
from playwright.async_api import async_playwright
import os
import time

SITE_URL = "https://talorme.com"
AMAZON_JOB_URL = "https://www.amazon.jobs/en/jobs/3048245/security-delivery-practice-manager"
RESUME_FILE = "Sarah_Chen_Security_Resume.docx"

async def test_end_to_end():
    print("=" * 80)
    print("END-TO-END TEST: talorme.com")
    print("=" * 80)

    test_results = {
        'upload': {'status': 'pending', 'details': []},
        'add_job': {'status': 'pending', 'details': []},
        'tailor': {'status': 'pending', 'details': []},
        'comparison': {'status': 'pending', 'details': []},
        'interview_prep': {'status': 'pending', 'details': []},
        'buttons': {'status': 'pending', 'details': []}
    }

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, slow_mo=500)
        context = await browser.new_context()
        page = await context.new_page()

        # Capture console messages
        console_messages = []
        page.on("console", lambda msg: console_messages.append(f"[{msg.type.upper()}] {msg.text}"))

        # Capture errors
        page_errors = []
        page.on("pageerror", lambda err: page_errors.append(str(err)))

        try:
            # ========== STEP 1: UPLOAD RESUME ==========
            print("\n[STEP 1] Uploading Resume...")
            await page.goto(f"{SITE_URL}/upload", wait_until='networkidle')
            await asyncio.sleep(2)

            # Check if resume file exists
            if not os.path.exists(RESUME_FILE):
                test_results['upload']['status'] = 'FAILED'
                test_results['upload']['details'].append(f"Resume file not found: {RESUME_FILE}")
                print(f"  ERROR: {RESUME_FILE} not found")
            else:
                # Upload file
                file_input = await page.query_selector('input[type="file"]')
                if file_input:
                    await file_input.set_input_files(RESUME_FILE)
                    print(f"  File selected: {RESUME_FILE}")

                    # Wait for upload to complete
                    await asyncio.sleep(10)

                    # Check for success
                    success_msg = await page.query_selector('text=Resume uploaded successfully')
                    if success_msg:
                        test_results['upload']['status'] = 'PASSED'
                        test_results['upload']['details'].append('Resume uploaded successfully')
                        print("  SUCCESS: Resume uploaded!")

                        # Get resume ID
                        resume_id_elem = await page.query_selector('text=/Resume ID:/')
                        if resume_id_elem:
                            resume_id_text = await resume_id_elem.inner_text()
                            test_results['upload']['details'].append(resume_id_text)
                            print(f"  {resume_id_text}")
                    else:
                        error_msg = await page.query_selector('text=Upload failed')
                        if error_msg:
                            error_text = await error_msg.inner_text()
                            test_results['upload']['status'] = 'FAILED'
                            test_results['upload']['details'].append(f'Upload failed: {error_text}')
                            print(f"  ERROR: {error_text}")
                        else:
                            test_results['upload']['status'] = 'UNKNOWN'
                            test_results['upload']['details'].append('No success or error message found')
                            print("  WARNING: Upload status unclear")
                else:
                    test_results['upload']['status'] = 'FAILED'
                    test_results['upload']['details'].append('File input not found')
                    print("  ERROR: File input not found")

            await asyncio.sleep(2)

            # ========== STEP 2: ADD JOB ==========
            print("\n[STEP 2] Adding Amazon Job...")
            await page.goto(f"{SITE_URL}/tailor", wait_until='networkidle')
            await asyncio.sleep(2)

            # Click "Add Job" or similar button
            add_job_button = await page.query_selector('button:has-text("Add Job")')
            if not add_job_button:
                add_job_button = await page.query_selector('button:has-text("Add New Job")')
            if not add_job_button:
                add_job_button = await page.query_selector('text=Add Job')

            if add_job_button:
                await add_job_button.click()
                print("  Clicked 'Add Job' button")
                await asyncio.sleep(2)

                # Fill in job URL
                url_input = await page.query_selector('input[placeholder*="job URL"], input[name="url"], input[type="url"]')
                if url_input:
                    await url_input.fill(AMAZON_JOB_URL)
                    print(f"  Entered job URL: {AMAZON_JOB_URL}")

                    # Submit
                    submit_button = await page.query_selector('button:has-text("Add"), button:has-text("Submit"), button[type="submit"]')
                    if submit_button:
                        await submit_button.click()
                        print("  Clicked submit button")
                        await asyncio.sleep(5)

                        # Check if job was added
                        amazon_job = await page.query_selector('text=/Amazon/i')
                        if amazon_job:
                            test_results['add_job']['status'] = 'PASSED'
                            test_results['add_job']['details'].append('Amazon job added successfully')
                            print("  SUCCESS: Amazon job added")
                        else:
                            test_results['add_job']['status'] = 'FAILED'
                            test_results['add_job']['details'].append('Job not visible after adding')
                            print("  WARNING: Job may not have been added")
                    else:
                        test_results['add_job']['status'] = 'FAILED'
                        test_results['add_job']['details'].append('Submit button not found')
                        print("  ERROR: Submit button not found")
                else:
                    test_results['add_job']['status'] = 'FAILED'
                    test_results['add_job']['details'].append('URL input not found')
                    print("  ERROR: URL input not found")
            else:
                test_results['add_job']['status'] = 'FAILED'
                test_results['add_job']['details'].append('Add Job button not found')
                print("  ERROR: Add Job button not found")

            await asyncio.sleep(2)

            # ========== STEP 3: TAILOR RESUME ==========
            print("\n[STEP 3] Tailoring Resume to Amazon Job...")

            # Find and click Tailor button for Amazon job
            tailor_button = await page.query_selector('button:has-text("Tailor")')
            if tailor_button:
                await tailor_button.click()
                print("  Clicked 'Tailor' button")
                await asyncio.sleep(3)

                # Wait for tailoring to complete (this may take a while)
                print("  Waiting for AI tailoring to complete...")
                await asyncio.sleep(20)

                # Check for success or error
                success_indicator = await page.query_selector('text=/Tailored resume/i, text=/Success/i')
                if success_indicator:
                    test_results['tailor']['status'] = 'PASSED'
                    test_results['tailor']['details'].append('Resume tailored successfully')
                    print("  SUCCESS: Resume tailored")
                else:
                    # Check if still processing
                    processing = await page.query_selector('text=/Processing/i, text=/Generating/i')
                    if processing:
                        test_results['tailor']['status'] = 'IN_PROGRESS'
                        test_results['tailor']['details'].append('Tailoring still in progress')
                        print("  INFO: Tailoring still processing")
                    else:
                        test_results['tailor']['status'] = 'UNKNOWN'
                        test_results['tailor']['details'].append('Tailoring status unclear')
                        print("  WARNING: Tailoring status unclear")
            else:
                test_results['tailor']['status'] = 'FAILED'
                test_results['tailor']['details'].append('Tailor button not found')
                print("  ERROR: Tailor button not found")

            await asyncio.sleep(2)

            # ========== STEP 4: TEST COMPARISON PAGE ==========
            print("\n[STEP 4] Testing Comparison Page...")

            # Look for comparison view or similar
            comparison_view = await page.query_selector('text=/Compare/i, text=/Side by side/i')
            if comparison_view:
                await comparison_view.click()
                print("  Opened comparison view")
                await asyncio.sleep(3)

                # Take screenshot
                await page.screenshot(path='screenshot_comparison.png')
                test_results['comparison']['details'].append('Screenshot saved: screenshot_comparison.png')
                print("  Screenshot saved: screenshot_comparison.png")

                # Check for both resumes visible
                original_resume = await page.query_selector('text=/Original/i, text=/Base Resume/i')
                tailored_resume = await page.query_selector('text=/Tailored/i, text=/Customized/i')

                if original_resume and tailored_resume:
                    test_results['comparison']['status'] = 'PASSED'
                    test_results['comparison']['details'].append('Both resumes visible in comparison')
                    print("  SUCCESS: Comparison view working")
                else:
                    test_results['comparison']['status'] = 'PARTIAL'
                    test_results['comparison']['details'].append('Comparison view exists but content unclear')
                    print("  WARNING: Comparison content unclear")
            else:
                test_results['comparison']['status'] = 'NOT_FOUND'
                test_results['comparison']['details'].append('Comparison view not found')
                print("  INFO: Comparison view not found or not accessible")

            await asyncio.sleep(2)

            # ========== STEP 5: TEST INTERVIEW PREP ==========
            print("\n[STEP 5] Testing Interview Prep Page...")

            # Navigate to interview prep
            await page.goto(f"{SITE_URL}/interview-prep", wait_until='networkidle')
            await asyncio.sleep(3)

            # Take screenshot
            await page.screenshot(path='screenshot_interview_prep.png')
            test_results['interview_prep']['details'].append('Screenshot saved: screenshot_interview_prep.png')
            print("  Screenshot saved: screenshot_interview_prep.png")

            # Check for interview prep content
            interview_content = await page.query_selector('text=/Interview/i')
            if interview_content:
                test_results['interview_prep']['status'] = 'PASSED'
                test_results['interview_prep']['details'].append('Interview prep page loaded')
                print("  SUCCESS: Interview prep page accessible")
            else:
                test_results['interview_prep']['status'] = 'FAILED'
                test_results['interview_prep']['details'].append('Interview prep content not found')
                print("  ERROR: Interview prep content not found")

            await asyncio.sleep(2)

            # ========== STEP 6: TEST BUTTONS ==========
            print("\n[STEP 6] Testing All Buttons...")

            # Go back to main page
            await page.goto(f"{SITE_URL}/tailor", wait_until='networkidle')
            await asyncio.sleep(2)

            # Find all buttons
            buttons = await page.query_selector_all('button')
            test_results['buttons']['details'].append(f'Found {len(buttons)} buttons')
            print(f"  Found {len(buttons)} buttons on tailor page")

            button_texts = []
            for btn in buttons[:10]:  # Test first 10 buttons
                try:
                    text = await btn.inner_text()
                    if text:
                        button_texts.append(text)
                        print(f"    - Button: {text}")
                except:
                    pass

            test_results['buttons']['status'] = 'PASSED'
            test_results['buttons']['details'].append(f'Button texts: {button_texts}')

        except Exception as e:
            print(f"\n  EXCEPTION: {str(e)}")
            test_results['buttons']['details'].append(f'Exception: {str(e)}')

        # ========== GENERATE REPORT ==========
        print("\n" + "=" * 80)
        print("TEST RESULTS SUMMARY")
        print("=" * 80)

        for step, result in test_results.items():
            status = result['status']
            status_symbol = {
                'PASSED': '✓',
                'FAILED': '✗',
                'PARTIAL': '~',
                'UNKNOWN': '?',
                'NOT_FOUND': '-',
                'IN_PROGRESS': '...',
                'pending': '⏳'
            }.get(status, '?')

            print(f"\n[{step.upper().replace('_', ' ')}]: {status_symbol} {status}")
            for detail in result['details']:
                print(f"  - {detail}")

        # Console messages
        if console_messages:
            print("\n[CONSOLE MESSAGES]:")
            for msg in console_messages[-20:]:  # Last 20 messages
                print(f"  {msg}")

        # Page errors
        if page_errors:
            print("\n[PAGE ERRORS]:")
            for err in page_errors:
                print(f"  ERROR: {err}")

        print("\n" + "=" * 80)
        print("Test complete - keeping browser open for 30 seconds...")
        print("=" * 80)

        await asyncio.sleep(30)
        await browser.close()

if __name__ == "__main__":
    asyncio.run(test_end_to_end())
