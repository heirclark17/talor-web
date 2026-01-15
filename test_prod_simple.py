"""
Simple production test for Common Interview Questions feature
"""
import asyncio
from playwright.async_api import async_playwright

async def test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page(viewport={'width': 1920, 'height': 1080})

        print("\n=== TESTING COMMON INTERVIEW QUESTIONS ON PRODUCTION ===\n")

        try:
            # Navigate to production
            print("1. Navigating to talorme.com...")
            await page.goto('https://talorme.com')
            await page.wait_for_timeout(3000)
            print("   OK - Site loaded")

            # Go to tailor page
            print("\n2. Navigating to /tailor...")
            await page.goto('https://talorme.com/tailor')
            await page.wait_for_timeout(3000)
            await page.screenshot(path='prod_test_tailor.png', full_page=True)
            print("   OK - Tailor page loaded")
            print("   Screenshot: prod_test_tailor.png")

            # Look for interview prep links
            print("\n3. Looking for Interview Prep links...")
            links = await page.query_selector_all('a[href*="interview-prep"]')
            print(f"   Found {len(links)} interview prep links")

            if links:
                print("\n4. Clicking first Interview Prep link...")
                await links[0].click()
                await page.wait_for_timeout(5000)
                await page.screenshot(path='prod_test_interview_prep.png', full_page=True)
                print("   OK - Interview prep page loaded")
                print("   Screenshot: prod_test_interview_prep.png")

                # Scroll down to find Common Questions section
                print("\n5. Scrolling to find Common Interview Questions section...")
                await page.evaluate('window.scrollTo(0, document.body.scrollHeight * 0.6)')
                await page.wait_for_timeout(2000)

                # Look for the section
                section = await page.query_selector('h2:text("Common Interview Questions")')
                if section:
                    print("   SUCCESS! Found 'Common Interview Questions People Struggle With' section")
                    await section.scroll_into_view_if_needed()
                    await page.wait_for_timeout(1000)
                    await page.screenshot(path='prod_test_common_section.png', full_page=True)
                    print("   Screenshot: prod_test_common_section.png")

                    # Try to click the section to expand
                    print("\n6. Expanding section...")
                    button = await page.query_selector('button:has-text("Common Interview Questions")')
                    if button:
                        await button.click()
                        await page.wait_for_timeout(1000)
                        await page.screenshot(path='prod_test_expanded.png', full_page=True)
                        print("   OK - Section expanded")
                        print("   Screenshot: prod_test_expanded.png")

                        print("\n" + "="*60)
                        print("SUCCESS! Feature is deployed and visible on production!")
                        print("="*60)
                    else:
                        print("   Section button not found")
                else:
                    print("   WARNING: Section not found yet - may still be deploying")
                    await page.screenshot(path='prod_test_no_section.png', full_page=True)
                    print("   Screenshot: prod_test_no_section.png")
            else:
                print("   No interview prep links found")
                print("   You may need to create a tailored resume first")

            # Keep browser open
            print("\nKeeping browser open for 15 seconds...")
            await page.wait_for_timeout(15000)

        except Exception as e:
            print(f"\nERROR: {e}")
            await page.screenshot(path='prod_test_error.png', full_page=True)

        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(test())
