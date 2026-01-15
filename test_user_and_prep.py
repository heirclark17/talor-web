"""Check user ID and interview prep data"""
import asyncio
from playwright.async_api import async_playwright

async def test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page(viewport={'width': 1920, 'height': 1080})

        print("\n" + "="*70)
        print("CHECKING USER SESSION AND INTERVIEW PREPS")
        print("="*70 + "\n")

        try:
            # Navigate to site
            print("1. Loading talorme.com...")
            await page.goto('https://talorme.com/tailor')
            await page.wait_for_timeout(3000)

            # Get user ID from localStorage
            print("\n2. Checking user ID...")
            user_id = await page.evaluate('localStorage.getItem("talor_user_id")')
            print(f"   User ID: {user_id}")

            # Navigate to interview preps list
            print("\n3. Navigating to interview preps list...")
            await page.goto('https://talorme.com/interview-prep')
            await page.wait_for_timeout(3000)

            await page.screenshot(path='user_preps_list.png', full_page=True)
            print("   Screenshot: user_preps_list.png")

            # Look for any interview prep cards
            print("\n4. Looking for interview prep cards...")
            cards = await page.query_selector_all('[class*="card"], [class*="prep"]')
            print(f"   Found {len(cards)} potential cards")

            # Try to find any links to interview prep pages
            links = await page.query_selector_all('a[href*="/interview-prep/"]')
            print(f"\n5. Found {len(links)} interview prep links:")

            for i, link in enumerate(links[:5]):  # Show first 5
                href = await link.get_attribute('href')
                print(f"   {i+1}. {href}")

            if len(links) > 0:
                print("\n6. Clicking first interview prep link...")
                first_link = links[0]
                href = await first_link.get_attribute('href')
                print(f"   Opening: {href}")

                await first_link.click()
                await page.wait_for_timeout(5000)

                await page.screenshot(path='user_actual_prep.png', full_page=True)
                print("   Screenshot: user_actual_prep.png")

                # Check if Common Questions section exists
                print("\n7. Checking for Common Interview Questions section...")

                # Scroll down
                for i in range(5):
                    await page.evaluate(f'window.scrollTo(0, document.body.scrollHeight * {i/5})')
                    await page.wait_for_timeout(1000)

                section = await page.query_selector('h2:text-matches("Common Interview Questions", "i")')

                if section:
                    print("   SUCCESS! Section found on this prep!")
                    await section.screenshot(path='user_section_found.png')
                    print("   Screenshot: user_section_found.png")
                else:
                    print("   Section not found on this prep")

                    # Check the page source
                    content = await page.content()
                    if "CommonInterviewQuestions" in content:
                        print("   Component name found in source")
                    if "common-questions" in content:
                        print("   API route found in source")

                    # Check console for errors
                    print("\n8. Checking browser console...")
                    logs = []
                    page.on("console", lambda msg: logs.append(f"{msg.type()}: {msg.text()}"))

                    await page.reload()
                    await page.wait_for_timeout(3000)

                    if logs:
                        print("   Console logs:")
                        for log in logs[:10]:
                            print(f"   - {log}")

            else:
                print("\n   No interview preps found for this user")

            print("\nKeeping browser open for 20 seconds...")
            await page.wait_for_timeout(20000)

        except Exception as e:
            print(f"\nERROR: {e}")
            import traceback
            traceback.print_exc()

        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(test())
