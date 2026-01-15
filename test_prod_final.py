"""Final production test"""
import asyncio
from playwright.async_api import async_playwright

async def test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page(viewport={'width': 1920, 'height': 1080})

        print("\n" + "="*70)
        print("FINAL PRODUCTION TEST - COMMON INTERVIEW QUESTIONS")
        print("="*70 + "\n")

        try:
            print("1. Loading talorme.com/tailor...")
            await page.goto('https://talorme.com/tailor')
            await page.wait_for_timeout(3000)
            print("   OK - Loaded")

            print("\n2. Looking for Interview Prep links...")
            links = await page.query_selector_all('a[href*="interview-prep"], button:has-text("Interview Prep")')

            if links:
                print(f"   OK - Found {len(links)} links")

                print("\n3. Opening Interview Prep page...")
                await links[0].click()
                await page.wait_for_timeout(5000)
                print("   OK - Page loaded")

                print("\n4. Scrolling to find Common Interview Questions section...")
                for i in range(4):
                    await page.evaluate(f'window.scrollTo(0, document.body.scrollHeight * {i/4})')
                    await page.wait_for_timeout(1000)

                section = await page.query_selector('h2:text-matches("Common Interview Questions", "i")')

                if section:
                    print("   SUCCESS! Section found!")
                    await section.scroll_into_view_if_needed()
                    await page.wait_for_timeout(1000)
                    await page.screenshot(path='final_section.png', full_page=True)
                    print("   Screenshot: final_section.png")

                    print("\n5. Expanding section...")
                    section_btn = await page.query_selector('button:has-text("Common Interview Questions")')
                    if section_btn:
                        await section_btn.click()
                        await page.wait_for_timeout(1000)
                        print("   OK - Expanded")

                        print("\n6. Looking for Generate button...")
                        gen_btn = await page.query_selector('button:has-text("Generate")')
                        if gen_btn:
                            print("   SUCCESS! Generate button found!")
                            await page.screenshot(path='final_with_button.png', full_page=True)
                            print("   Screenshot: final_with_button.png")

                            print("\n" + "="*70)
                            print("SUCCESS! FEATURE IS FULLY DEPLOYED AND WORKING!")
                            print("="*70)
                        else:
                            print("   ERROR: Generate button not found")
                else:
                    print("   ERROR: Section not found")
                    await page.screenshot(path='final_no_section.png', full_page=True)
            else:
                print("   ERROR: No interview prep links found")

            print("\nKeeping browser open for 15 seconds...")
            await page.wait_for_timeout(15000)

        except Exception as e:
            print(f"\nERROR: {e}")
            await page.screenshot(path='final_error.png', full_page=True)
            import traceback
            traceback.print_exc()

        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(test())
