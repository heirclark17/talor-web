"""
Test live interview prep functionality
"""
import asyncio
from playwright.async_api import async_playwright

async def test_interview_prep():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()

        try:
            # Navigate to homepage
            print("Navigating to https://talorme.com...")
            await page.goto("https://talorme.com", wait_until="domcontentloaded")
            await asyncio.sleep(2)

            # Check if Interview Prep link exists in header
            print("\nChecking for Interview Prep link in header...")
            interview_prep_link = page.locator('a:has-text("Interview Prep")')
            count = await interview_prep_link.count()
            print(f"Found {count} Interview Prep links")

            if count > 0:
                # Click the link
                print("Clicking Interview Prep link...")
                await interview_prep_link.first.click()
                await asyncio.sleep(3)

                # Check current URL
                current_url = page.url
                print(f"Current URL: {current_url}")

                # Take screenshot
                await page.screenshot(path="interview_prep_header_test.png")
                print("Screenshot saved: interview_prep_header_test.png")

            # Try navigating directly to interview prep list
            print("\nNavigating directly to /interview-preps...")
            await page.goto("https://talorme.com/interview-preps", wait_until="domcontentloaded")
            await asyncio.sleep(2)

            current_url = page.url
            print(f"Current URL: {current_url}")

            # Take screenshot
            await page.screenshot(path="interview_preps_list_page.png")
            print("Screenshot saved: interview_preps_list_page.png")

            # Try direct interview prep page
            print("\nNavigating to interview prep page 78...")
            await page.goto("https://talorme.com/interview-prep/78", wait_until="domcontentloaded")
            await asyncio.sleep(3)

            # Check for AI-generated content indicators
            print("\nChecking for AI-generated content...")

            # Look for section buttons
            sections = [
                "Company Profile",
                "Role Analysis",
                "Values",
                "Strategy",
                "Practice Questions",
                "Candidate Positioning"
            ]

            for section in sections:
                button = page.locator(f'button:has-text("{section}")')
                count = await button.count()
                status = "Found" if count > 0 else "Not found"
                print(f"  {section}: {status}")

            # Look for STAR Story Builder
            star_builder = page.locator('text=STAR Story Builder')
            star_count = await star_builder.count()
            status = "Found" if star_count > 0 else "Not found"
            print(f"  STAR Story Builder: {status}")

            # Take screenshot
            await page.screenshot(path="interview_prep_78_page.png", full_page=True)
            print("\nScreenshot saved: interview_prep_78_page.png")

            print("\n Keeping browser open for 30 seconds for inspection...")
            await asyncio.sleep(30)

        except Exception as e:
            print(f"\n Error: {e}")
            import traceback
            traceback.print_exc()
            await page.screenshot(path="error_test.png")
            await asyncio.sleep(30)

        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(test_interview_prep())
