"""
Test tailor page specifically
"""
import asyncio
from playwright.async_api import async_playwright
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

async def test_tailor():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context()
        page = await context.new_page()

        console_logs = []
        js_errors = []

        page.on('console', lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))
        page.on('pageerror', lambda err: js_errors.append(str(err)))

        print("Navigating to tailor page...")
        await page.goto('https://talorme.com/tailor', wait_until='domcontentloaded')
        await page.wait_for_timeout(3000)

        # Check URL
        print(f"\nCurrent URL: {page.url}")

        # Check if we're on tailor page
        page_content = await page.content()
        print(f"\nPage has {len(page_content)} characters")

        # Check for theme toggle
        print("\n=== THEME TOGGLE ===")
        toggle = await page.query_selector('[data-testid="theme-toggle"]')
        print(f"Theme toggle found: {toggle is not None}")

        if not toggle:
            # Check all buttons
            all_buttons = await page.query_selector_all('button')
            print(f"Total buttons on page: {len(all_buttons)}")

            # Check if ThemeToggle component is in the HTML source
            has_theme_toggle_text = 'theme-toggle' in page_content
            print(f"'theme-toggle' in page source: {has_theme_toggle_text}")

        # Check for analysis components
        print("\n=== ANALYSIS COMPONENTS ===")
        match_score = await page.query_selector('[data-testid="match-score"]')
        print(f"Match Score: {match_score is not None}")

        resume_analysis = await page.query_selector('[data-testid="resume-analysis"]')
        print(f"Resume Analysis: {resume_analysis is not None}")

        keyword_panel = await page.query_selector('[data-testid="keyword-panel"]')
        print(f"Keyword Panel: {keyword_panel is not None}")

        # Look for the components in source
        print(f"\n'match-score' in source: {'match-score' in page_content}")
        print(f"'resume-analysis' in source: {'resume-analysis' in page_content}")
        print(f"'keyword-panel' in source: {'keyword-panel' in page_content}")

        # Check console
        print("\n=== CONSOLE LOGS ===")
        for log in console_logs:
            print(log)

        print("\n=== JS ERRORS ===")
        if js_errors:
            for err in js_errors:
                print(err)
        else:
            print("No errors")

        # Check if there's a tailored resume loaded
        print("\n=== PAGE STATE ===")
        has_tailored_resume = await page.evaluate("""
            () => {
                const content = document.body.textContent;
                return {
                    hasTailoredText: content.includes('Tailored') || content.includes('tailored'),
                    hasGenerateButton: content.includes('Generate'),
                    pageTitle: document.title
                };
            }
        """)
        print(f"Page title: {has_tailored_resume['pageTitle']}")
        print(f"Has 'Tailored' text: {has_tailored_resume['hasTailoredText']}")
        print(f"Has 'Generate' button: {has_tailored_resume['hasGenerateButton']}")

        # Take screenshot
        await page.screenshot(path='tailor_page_test.png', full_page=True)
        print("\nScreenshot: tailor_page_test.png")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(test_tailor())
