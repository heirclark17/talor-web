"""
Test full resume generation flow to see analysis components
"""
import asyncio
from playwright.async_api import async_playwright
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

async def test_full_flow():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context()
        page = await context.new_page()

        print("Step 1: Navigate to home page...")
        await page.goto('https://talorme.com')
        await page.wait_for_timeout(2000)

        # Check if user has existing resumes
        print("\nStep 2: Navigate to /tailor...")
        await page.goto('https://talorme.com/tailor')
        await page.wait_for_timeout(3000)

        # Look for any existing tailored resumes
        print("\nStep 3: Checking for existing tailored resumes...")
        view_buttons = await page.query_selector_all('text=View Details')
        view_tailor_links = await page.query_selector_all('a[href*="/tailor"]')

        print(f"Found {len(view_buttons)} 'View Details' buttons")
        print(f"Found {len(view_tailor_links)} tailor links")

        # If there are existing resumes, click one
        if view_buttons:
            print("\nClicking first 'View Details' button...")
            await view_buttons[0].click()
            await page.wait_for_timeout(5000)

            print(f"\nCurrent URL: {page.url}")

            # Now check for analysis components
            print("\nChecking for analysis components...")

            match_score = await page.query_selector('[data-testid="match-score"]')
            print(f"Match Score: {'✓ FOUND' if match_score else '✗ NOT FOUND'}")

            resume_analysis = await page.query_selector('[data-testid="resume-analysis"]')
            print(f"Resume Analysis: {'✓ FOUND' if resume_analysis else '✗ NOT FOUND'}")

            keyword_panel = await page.query_selector('[data-testid="keyword-panel"]')
            print(f"Keyword Panel: {'✓ FOUND' if keyword_panel else '✗ NOT FOUND'}")

            # Check page content
            content = await page.content()
            print(f"\nPage size: {len(content)} characters")
            print(f"Contains 'match-score': {'match-score' in content}")
            print(f"Contains 'resume-analysis': {'resume-analysis' in content}")
            print(f"Contains 'keyword-panel': {'keyword-panel' in content}")

            # Take screenshot
            await page.screenshot(path='with_tailored_resume.png', full_page=True)
            print("\nScreenshot: with_tailored_resume.png")
        else:
            print("\n⚠️  No existing tailored resumes found")
            print("User needs to generate a resume first to see analysis components")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(test_full_flow())
