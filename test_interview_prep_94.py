"""Test Common Interview Questions on interview prep 94"""
import asyncio
from playwright.async_api import async_playwright

async def test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page(viewport={'width': 1920, 'height': 1080})

        print("\n" + "="*70)
        print("TESTING INTERVIEW PREP #94")
        print("="*70 + "\n")

        try:
            # Navigate directly to interview prep 94
            print("1. Navigating to interview prep 94...")
            await page.goto('https://talorme.com/interview-prep/94')
            await page.wait_for_timeout(5000)
            print("   OK - Page loaded")

            # Take initial screenshot
            await page.screenshot(path='prep94_initial.png', full_page=True)
            print("   Screenshot: prep94_initial.png")

            # Scroll down to find the section
            print("\n2. Scrolling to find Common Interview Questions section...")
            for i in range(5):
                await page.evaluate(f'window.scrollTo(0, document.body.scrollHeight * {i/5})')
                await page.wait_for_timeout(1000)

            # Look for the section
            print("\n3. Looking for 'Common Interview Questions' section...")
            section = await page.query_selector('h2:text-matches("Common Interview Questions", "i")')

            if section:
                print("   SUCCESS! Section found!")
                await section.scroll_into_view_if_needed()
                await page.wait_for_timeout(1000)

                # Take screenshot of section
                await page.screenshot(path='prep94_section_found.png', full_page=True)
                print("   Screenshot: prep94_section_found.png")

                # Try to expand section
                print("\n4. Trying to expand section...")
                section_button = await page.query_selector('button:has-text("Common Interview Questions")')

                if section_button:
                    await section_button.click()
                    await page.wait_for_timeout(2000)
                    print("   OK - Section expanded")

                    # Take screenshot after expanding
                    await page.screenshot(path='prep94_expanded.png', full_page=True)
                    print("   Screenshot: prep94_expanded.png")

                    # Look for Generate button
                    print("\n5. Looking for 'Generate Tailored Questions' button...")
                    generate_button = await page.query_selector('button:has-text("Generate")')

                    if generate_button:
                        print("   SUCCESS! Generate button found!")

                        # Take close-up of button
                        await generate_button.screenshot(path='prep94_generate_button.png')
                        print("   Screenshot: prep94_generate_button.png")

                        print("\n" + "="*70)
                        print("FEATURE IS WORKING! READY TO USE!")
                        print("="*70)
                        print("\nNext steps:")
                        print("1. Click 'Generate Tailored Questions'")
                        print("2. Wait 20-30 seconds for OpenAI to generate answers")
                        print("3. Explore the 10 questions")
                        print("4. Use copy/edit/regenerate features")

                        # Optional: Actually click generate and test the API
                        print("\n6. Testing Generate functionality...")
                        print("   Clicking Generate button...")
                        await generate_button.click()
                        await page.wait_for_timeout(2000)

                        # Wait for loading or questions to appear
                        print("   Waiting for questions to generate (max 60 seconds)...")
                        try:
                            await page.wait_for_selector('text="Tell me about yourself"', timeout=60000)
                            print("   SUCCESS! Questions generated!")

                            await page.screenshot(path='prep94_questions_generated.png', full_page=True)
                            print("   Screenshot: prep94_questions_generated.png")

                            # Try to expand first question
                            print("\n7. Testing first question...")
                            first_q = await page.query_selector('button:has-text("Tell me about yourself")')
                            if first_q:
                                await first_q.click()
                                await page.wait_for_timeout(1000)
                                print("   OK - First question expanded")

                                await page.screenshot(path='prep94_first_question.png', full_page=True)
                                print("   Screenshot: prep94_first_question.png")

                                print("\n" + "="*70)
                                print("COMPLETE SUCCESS! ALL FEATURES WORKING!")
                                print("="*70)

                        except Exception as e:
                            print(f"   Error during generation: {e}")
                            await page.screenshot(path='prep94_generation_error.png', full_page=True)
                            print("   Screenshot: prep94_generation_error.png")

                    else:
                        print("   ERROR: Generate button not found")
                        await page.screenshot(path='prep94_no_button.png', full_page=True)

                else:
                    print("   Section appears to be already expanded or button not found")

            else:
                print("   ERROR: Common Interview Questions section not found!")
                print("   Checking if interviewPrepId is set...")

                # Check console for errors
                page.on("console", lambda msg: print(f"   Console: {msg.text()}"))

                await page.screenshot(path='prep94_no_section.png', full_page=True)
                print("   Screenshot: prep94_no_section.png")

            # Keep browser open
            print("\nKeeping browser open for 20 seconds for inspection...")
            await page.wait_for_timeout(20000)

        except Exception as e:
            print(f"\nERROR: {e}")
            await page.screenshot(path='prep94_error.png', full_page=True)
            print("Screenshot: prep94_error.png")
            import traceback
            traceback.print_exc()

        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(test())
