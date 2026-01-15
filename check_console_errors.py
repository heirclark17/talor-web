"""
Check console for runtime errors
"""
import asyncio
from playwright.async_api import async_playwright
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

async def check_errors():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context()
        page = await context.new_page()

        console_logs = []
        js_errors = []
        failed_requests = []

        page.on('console', lambda msg: console_logs.append({
            'type': msg.type,
            'text': msg.text,
            'location': msg.location
        }))

        page.on('pageerror', lambda err: js_errors.append(str(err)))

        page.on('requestfailed', lambda request: failed_requests.append({
            'url': request.url,
            'failure': request.failure
        }))

        print("Loading talorme.com with fresh cache...")
        await page.goto('https://talorme.com', wait_until='domcontentloaded')
        await page.wait_for_timeout(5000)

        print("\n=== ALL CONSOLE MESSAGES ===")
        for msg in console_logs:
            print(f"[{msg['type']}] {msg['text']}")
            if msg['location']:
                print(f"    at {msg['location']}")

        print("\n=== JAVASCRIPT ERRORS ===")
        if js_errors:
            for err in js_errors:
                print(err)
        else:
            print("No JavaScript errors")

        print("\n=== FAILED REQUESTS ===")
        if failed_requests:
            for req in failed_requests:
                print(f"{req['url']}")
                print(f"  Failure: {req['failure']}")
        else:
            print("No failed requests")

        # Check React DevTools
        print("\n=== REACT CHECK ===")
        react_check = await page.evaluate("""
            () => {
                return {
                    hasReact: typeof window.React !== 'undefined',
                    hasReactDOM: typeof window.ReactDOM !== 'undefined',
                    rootContent: document.getElementById('root')?.innerHTML.substring(0, 200)
                };
            }
        """)
        print(f"Has React: {react_check['hasReact']}")
        print(f"Has ReactDOM: {react_check['hasReactDOM']}")
        print(f"Root content preview: {react_check['rootContent']}")

        # Try to manually check if ThemeContext is throwing an error
        print("\n=== THEME CONTEXT CHECK ===")
        try:
            theme_check = await page.evaluate("""
                () => {
                    const html = document.documentElement;
                    return {
                        htmlClasses: html.className,
                        hasThemeInLocalStorage: localStorage.getItem('talor_theme'),
                        bodyClasses: document.body.className
                    };
                }
            """)
            print(f"HTML classes: {theme_check['htmlClasses']}")
            print(f"localStorage theme: {theme_check['hasThemeInLocalStorage']}")
            print(f"Body classes: {theme_check['bodyClasses']}")
        except Exception as e:
            print(f"Error checking theme: {e}")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(check_errors())
