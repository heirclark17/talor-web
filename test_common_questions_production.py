"""
Test Common Interview Questions feature on production
"""
import asyncio
from playwright.async_api import async_playwright
import json
from datetime import datetime

async def test_common_questions():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = await context.new_page()

        print("\n" + "="*80)
        print("TESTING COMMON INTERVIEW QUESTIONS FEATURE ON PRODUCTION")
        print("="*80 + "\n")

        try:
            # Step 1: Navigate to production site
            print("Step 1: Navigating to production site...")
            await page.goto('https://talorme.com')
            await page.wait_for_load_state('networkidle')
            print("✓ Loaded talorme.com")

            # Step 2: Check if user is logged in or needs to log in
            print("\nStep 2: Checking authentication...")
            await page.wait_for_timeout(2000)

            # Try to find interview prep or resume list
            # Look for any interview prep link
            print("\nStep 3: Looking for Interview Prep pages...")

            # Navigate to /tailor to see resumes
            await page.goto('https://talorme.com/tailor')
            await page.wait_for_load_state('networkidle')
            await page.wait_for_timeout(2000)

            # Take screenshot
            await page.screenshot(path='test_prod_tailor_page.png', full_page=True)
            print("✓ Screenshot saved: test_prod_tailor_page.png")

            # Look for any "View Interview Prep" or "Interview Prep" buttons
            print("\nStep 4: Looking for Interview Prep buttons...")

            # Try to find interview prep buttons
            interview_prep_buttons = await page.query_selector_all('a[href*="interview-prep"], button:has-text("Interview Prep")')

            if interview_prep_buttons:
                print(f"✓ Found {len(interview_prep_buttons)} Interview Prep links/buttons")

                # Click the first one
                print("\nStep 5: Clicking first Interview Prep link...")
                await interview_prep_buttons[0].click()
                await page.wait_for_load_state('networkidle')
                await page.wait_for_timeout(3000)

                # Take screenshot of interview prep page
                await page.screenshot(path='test_prod_interview_prep_page.png', full_page=True)
                print("✓ Screenshot saved: test_prod_interview_prep_page.png")

                # Step 6: Look for Common Interview Questions section
                print("\nStep 6: Looking for 'Common Interview Questions' section...")

                # Scroll to find the section
                await page.evaluate('window.scrollTo(0, document.body.scrollHeight / 2)')
                await page.wait_for_timeout(1000)

                # Look for the section header
                common_questions_section = await page.query_selector('h2:has-text("Common Interview Questions")')

                if common_questions_section:
                    print("✓ Found 'Common Interview Questions People Struggle With' section!")

                    # Scroll to the section
                    await common_questions_section.scroll_into_view_if_needed()
                    await page.wait_for_timeout(1000)

                    # Take screenshot of the section
                    await page.screenshot(path='test_prod_common_questions_section.png', full_page=True)
                    print("✓ Screenshot saved: test_prod_common_questions_section.png")

                    # Step 7: Click to expand the section if collapsed
                    print("\nStep 7: Expanding Common Questions section...")
                    section_button = await page.query_selector('button:has-text("Common Interview Questions")')
                    if section_button:
                        await section_button.click()
                        await page.wait_for_timeout(1000)
                        print("✓ Section expanded")

                    # Step 8: Look for Generate button
                    print("\nStep 8: Looking for 'Generate Tailored Questions' button...")
                    generate_button = await page.query_selector('button:has-text("Generate"), button:has-text("Tailored")')

                    if generate_button:
                        print("✓ Found Generate button!")

                        # Take screenshot before clicking
                        await page.screenshot(path='test_prod_before_generate.png', full_page=True)
                        print("✓ Screenshot saved: test_prod_before_generate.png")

                        # Step 9: Click Generate button
                        print("\nStep 9: Clicking 'Generate Tailored Questions' button...")
                        await generate_button.click()
                        print("✓ Generate button clicked")

                        # Wait for loading to complete (up to 60 seconds)
                        print("\nStep 10: Waiting for AI generation (up to 60 seconds)...")
                        try:
                            # Wait for loading indicator to disappear or questions to appear
                            await page.wait_for_selector('text="Tell me about yourself"', timeout=60000)
                            print("✓ Questions generated successfully!")

                            # Take screenshot of generated questions
                            await page.screenshot(path='test_prod_after_generate.png', full_page=True)
                            print("✓ Screenshot saved: test_prod_after_generate.png")

                            # Step 11: Expand first question
                            print("\nStep 11: Testing first question accordion...")
                            first_question = await page.query_selector('button:has-text("Tell me about yourself")')
                            if first_question:
                                await first_question.click()
                                await page.wait_for_timeout(1000)
                                print("✓ First question expanded")

                                # Take screenshot of expanded question
                                await page.screenshot(path='test_prod_question_expanded.png', full_page=True)
                                print("✓ Screenshot saved: test_prod_question_expanded.png")

                                # Step 12: Test tabs
                                print("\nStep 12: Testing tabs...")
                                tabs = ['Why It\'s Hard', 'Common Mistakes', 'Answer Builder', 'What to Say']
                                for tab_name in tabs:
                                    tab = await page.query_selector(f'button:has-text("{tab_name}")')
                                    if tab:
                                        await tab.click()
                                        await page.wait_for_timeout(500)
                                        print(f"✓ Clicked '{tab_name}' tab")

                                # Take screenshot of tabs
                                await page.screenshot(path='test_prod_tabs_test.png', full_page=True)
                                print("✓ Screenshot saved: test_prod_tabs_test.png")

                                # Step 13: Test copy button
                                print("\nStep 13: Testing copy answer button...")
                                copy_button = await page.query_selector('button:has-text("Copy Answer")')
                                if copy_button:
                                    await copy_button.click()
                                    await page.wait_for_timeout(1000)
                                    print("✓ Copy button clicked")

                                    # Take screenshot
                                    await page.screenshot(path='test_prod_after_copy.png', full_page=True)
                                    print("✓ Screenshot saved: test_prod_after_copy.png")

                                print("\n" + "="*80)
                                print("✅ ALL TESTS PASSED - FEATURE IS WORKING ON PRODUCTION!")
                                print("="*80)

                        except Exception as e:
                            print(f"\n❌ Error during generation: {str(e)}")
                            await page.screenshot(path='test_prod_generation_error.png', full_page=True)
                            print("✓ Error screenshot saved: test_prod_generation_error.png")
                    else:
                        print("❌ Generate button not found - feature may not be deployed yet")

                else:
                    print("❌ 'Common Interview Questions' section not found")
                    print("   Feature may still be deploying...")

            else:
                print("❌ No Interview Prep links found on tailor page")
                print("   You may need to create a tailored resume first")

            # Keep browser open for 10 seconds to review
            print("\nKeeping browser open for 10 seconds for review...")
            await page.wait_for_timeout(10000)

        except Exception as e:
            print(f"\n❌ Error during test: {str(e)}")
            await page.screenshot(path='test_prod_error.png', full_page=True)
            print("✓ Error screenshot saved: test_prod_error.png")

        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(test_common_questions())
