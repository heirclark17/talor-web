"""
Quick check of what's actually on the interview prep page
"""
import asyncio
import sys
import io
from playwright.async_api import async_playwright

# Fix Unicode encoding for Windows console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

async def check_page():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()

        try:
            frontend_url = "https://talorme.com"
            interview_url = f"{frontend_url}/interview-prep/39"

            print(f"Navigating to: {interview_url}")
            await page.goto(interview_url, wait_until="networkidle", timeout=60000)

            # Wait for content
            await page.wait_for_timeout(5000)

            # Get all visible text on page
            body_text = await page.inner_text('body')

            print("\n=== PAGE CONTENT (First 2000 characters) ===")
            print(body_text[:2000])
            print("\n...")

            # Check for specific indicators
            print("\n=== CHECKING FOR INDICATORS ===")

            indicators = [
                "Loading Interview Prep",
                "Generating Interview Prep",
                "Error Loading",
                "Error",
                "Login",
                "Sign In",
                "Company Profile",
                "Values & Culture",
                "Strategy & Recent News",
                "Interview Preparation",
                "Amazon",
                "Security Program Manager"
            ]

            for indicator in indicators:
                found = indicator in body_text
                print(f"  '{indicator}': {'FOUND' if found else 'NOT FOUND'}")

            # Check page URL (might have redirected)
            current_url = page.url
            print(f"\n=== CURRENT URL ===")
            print(f"{current_url}")

            if current_url != interview_url:
                print(f"⚠️ REDIRECTED from {interview_url}")

            # Check for React/app root
            app_root = await page.query_selector('#root, #app, [data-react-root]')
            print(f"\n=== REACT ROOT ===")
            print(f"Found app root: {'YES' if app_root else 'NO'}")

            # Get all headings
            headings = await page.query_selector_all('h1, h2, h3')
            print(f"\n=== HEADINGS ON PAGE ===")
            for i, heading in enumerate(headings[:10], 1):
                text = await heading.inner_text()
                tag = await heading.evaluate('el => el.tagName')
                print(f"  {i}. <{tag}>: {text[:100]}")

            # Check console logs
            console_messages = []
            page.on("console", lambda msg: console_messages.append(msg.text))
            await page.wait_for_timeout(2000)

            if console_messages:
                print(f"\n=== CONSOLE LOGS ===")
                for msg in console_messages[:10]:
                    print(f"  {msg}")

            # Take screenshot
            await page.screenshot(path="page_debug.png", full_page=True)
            print(f"\n📸 Screenshot saved: page_debug.png")

            # Keep browser open
            print("\n⏸️ Browser staying open for 20 seconds for inspection...")
            await page.wait_for_timeout(20000)

        except Exception as e:
            print(f"\n❌ Error: {e}")
            import traceback
            traceback.print_exc()
            await page.screenshot(path="page_error.png")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(check_page())
