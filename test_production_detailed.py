"""
Detailed production diagnostics for talorme.com
"""
import asyncio
from playwright.async_api import async_playwright
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

async def test_production():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = await context.new_page()

        # Collect all console messages and errors
        console_messages = []
        js_errors = []

        page.on('console', lambda msg: console_messages.append({
            'type': msg.type,
            'text': msg.text,
            'location': msg.location
        }))

        page.on('pageerror', lambda err: js_errors.append(str(err)))

        print("Loading talorme.com...")
        await page.goto('https://talorme.com', wait_until='networkidle', timeout=60000)
        await page.wait_for_timeout(3000)

        # Check if React rendered
        print("\nChecking React app...")
        root = await page.query_selector('#root')
        if root:
            print("  ✓ React root found")
            root_html = await root.inner_html()
            print(f"  Root has {len(root_html)} characters of HTML")
        else:
            print("  ✗ React root NOT found")

        # Check for ThemeContext
        print("\nChecking theme system...")
        has_theme_provider = await page.evaluate("""
            () => {
                try {
                    const root = document.getElementById('root');
                    return root && root.innerHTML.includes('theme');
                } catch (e) {
                    return false;
                }
            }
        """)
        print(f"  Theme-related content: {has_theme_provider}")

        # Try to find ThemeToggle in multiple ways
        print("\nSearching for ThemeToggle...")

        # Method 1: data-testid
        toggle1 = await page.query_selector('[data-testid="theme-toggle"]')
        print(f"  By data-testid: {'FOUND' if toggle1 else 'NOT FOUND'}")

        # Method 2: Fixed position button
        toggle2 = await page.query_selector('button.fixed.top-4.right-4')
        print(f"  By CSS classes: {'FOUND' if toggle2 else 'NOT FOUND'}")

        # Method 3: Any button in top-right
        all_buttons = await page.query_selector_all('button')
        print(f"  Total buttons on page: {len(all_buttons)}")

        # Check if components exist in build
        print("\nChecking if components are in the build...")
        build_check = await page.evaluate("""
            () => {
                const scripts = Array.from(document.querySelectorAll('script[src]'));
                return scripts.map(s => s.src);
            }
        """)

        for script in build_check:
            if 'index' in script or 'main' in script:
                print(f"  JS file: {script}")

        # Check console for errors
        print("\nConsole messages:")
        for msg in console_messages:
            if msg['type'] in ['error', 'warning']:
                print(f"  [{msg['type']}] {msg['text']}")

        print("\nJavaScript errors:")
        if js_errors:
            for err in js_errors:
                print(f"  {err}")
        else:
            print("  No JS errors")

        # Check if new components exist in window
        print("\nChecking component availability...")
        components_check = await page.evaluate("""
            () => {
                const html = document.documentElement.outerHTML;
                return {
                    hasThemeToggle: html.includes('theme-toggle') || html.includes('ThemeToggle'),
                    hasMatchScore: html.includes('match-score') || html.includes('MatchScore'),
                    hasResumeAnalysis: html.includes('resume-analysis') || html.includes('ResumeAnalysis'),
                    hasKeywordPanel: html.includes('keyword-panel') || html.includes('KeywordPanel'),
                    hasCertifications: html.includes('certification-recommendations') || html.includes('CertificationRecommendations'),
                    htmlLength: html.length
                };
            }
        """)

        print(f"  Theme Toggle in HTML: {components_check['hasThemeToggle']}")
        print(f"  Match Score in HTML: {components_check['hasMatchScore']}")
        print(f"  Resume Analysis in HTML: {components_check['hasResumeAnalysis']}")
        print(f"  Keyword Panel in HTML: {components_check['hasKeywordPanel']}")
        print(f"  Certifications in HTML: {components_check['hasCertifications']}")
        print(f"  Total HTML length: {components_check['htmlLength']}")

        # Take screenshot
        await page.screenshot(path='production_detailed.png', full_page=True)
        print("\nScreenshot saved: production_detailed.png")

        # Check build timestamp
        print("\nChecking deployment info...")
        try:
            response = await page.goto('https://talorme.com/_next/static/chunks/main.js')
            print(f"  Main JS status: {response.status if response else 'N/A'}")
        except:
            pass

        await browser.close()

if __name__ == '__main__':
    asyncio.run(test_production())
