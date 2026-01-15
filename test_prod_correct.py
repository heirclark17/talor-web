"""
Correct production test - navigate to actual interview prep detail page
"""
import asyncio
from playwright.async_api import async_playwright

async def test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page(viewport={'width': 1920, 'height': 1080})

        print("\n=== TESTING COMMON INTERVIEW QUESTIONS FEATURE ===\n")

        try:
            print("1. Navigating to talorme.com/tailor...")
            await page.goto('https://talorme.com/tailor')
            await page.wait_for_timeout(3000)
            await page.screenshot(path='test1_tailor.png', full_page=True)
            print("   OK")

            print("\n2. Looking for resume cards with 'Interview Prep' buttons...")
            # Look for buttons or links that say "Interview Prep" or "View Prep" within resume cards
            prep_buttons = await page.query_selector_all('button:has-text("Interview Prep"), a:has-text("Interview Prep"), button:has-text("View Prep")')
            print(f"   Found {len(prep_buttons)} buttons")

            if prep_buttons:
                print("\n3. Clicking first 'Interview Prep' button on a resume card...")
                await prep_buttons[0].click()
                await page.wait_for_timeout(5000)
                await page.screenshot(path='test2_interview_detail.png', full_page=True)
                print("   OK - On interview prep detail page")

                print("\n4. Scrolling down to find sections...")
                # Scroll through the page
                for i in range(3):
                    await page.evaluate(f'window.scrollTo(0, document.body.scrollHeight * {(i+1)/3})')
                    await page.wait_for_timeout(1000)

                await page.screenshot(path='test3_scrolled.png', full_page=True)

                print("\n5. Looking for 'Common Interview Questions' section...")
                section = await page.query_selector('h2:text-matches("Common Interview Questions", "i")')

                if section:
                    print("   SUCCESS! Found section!")
                    await section.scroll_into_view_if_needed()
                    await page.wait_for_timeout(1000)

                    # Take close-up screenshot
                    await section.screenshot(path='test4_section_found.png')
                    await page.screenshot(path='test5_full_page.png', full_page=True)
                    print("   Screenshots saved")

                    # Try to expand it
                    print("\n6. Clicking section header to expand...")
                    section_button = await page.query_selector('button:has-text("Common Interview Questions")')
                    if section_button:
                        await section_button.click()
                        await page.wait_for_timeout(2000)
                        await page.screenshot(path='test6_expanded.png', full_page=True)
                        print("   OK - Expanded")

                        # Look for Generate button
                        print("\n7. Looking for Generate button...")
                        gen_button = await page.query_selector('button:has-text("Generate")')
                        if gen_button:
                            print("   SUCCESS! Generate button found")
                            await gen_button.screenshot(path='test7_generate_button.png')

                            print("\n" + "="*70)
                            print("FEATURE DEPLOYED SUCCESSFULLY ON PRODUCTION!")
                            print("="*70)
                        else:
                            print("   Generate button not found")
                    else:
                        print("   Section button not clickable")
                else:
                    print("   Section not found on this page")
                    print("   Checking page content...")
                    content = await page.content()
                    if "Common Interview Questions" in content:
                        print("   Text exists in HTML but selector failed")
                    else:
                        print("   Text not found in page - deployment may be propagating")

            else:
                print("   No Interview Prep buttons found")
                print("   You may need to create a tailored resume + interview prep first")

            print("\nKeeping browser open for 20 seconds...")
            await page.wait_for_timeout(20000)

        except Exception as e:
            print(f"\nERROR: {e}")
            await page.screenshot(path='test_error.png', full_page=True)
            import traceback
            traceback.print_exc()

        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(test())
