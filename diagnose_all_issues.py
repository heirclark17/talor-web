"""
Comprehensive diagnosis of talorme.com issues:
- Dark/light mode toggle
- AI resume analysis
- Keyword panel
- Match score
- Certification recommendations
"""
import asyncio
from playwright.async_api import async_playwright
import json
import sys
import io

# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

async def diagnose_all_issues():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = await context.new_page()

        # Enable console logging
        console_logs = []
        errors = []
        network_requests = []

        page.on('console', lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))
        page.on('pageerror', lambda err: errors.append(str(err)))

        async def log_request(request):
            if 'api' in request.url:
                network_requests.append({
                    'url': request.url,
                    'method': request.method,
                    'headers': dict(request.headers)
                })

        page.on('request', log_request)

        print("=" * 80)
        print("DIAGNOSING TALORME.COM ISSUES")
        print("=" * 80)

        # Navigate to home page
        print("\n1. Loading homepage...")
        await page.goto('https://talorme.com', wait_until='networkidle', timeout=30000)
        await page.wait_for_timeout(2000)

        # Check for theme toggle
        print("\n2. Checking theme toggle...")
        theme_toggle = await page.query_selector('[data-testid="theme-toggle"]')
        if theme_toggle:
            print("   ✅ Theme toggle found")

            # Check current theme
            html_class = await page.locator('html').get_attribute('class')
            print(f"   Current HTML class: {html_class}")

            # Try clicking toggle
            await theme_toggle.click()
            await page.wait_for_timeout(1000)

            # Check if theme changed
            new_html_class = await page.locator('html').get_attribute('class')
            print(f"   After click HTML class: {new_html_class}")

            if html_class != new_html_class:
                print("   ✅ Theme toggle WORKS")
            else:
                print("   ❌ Theme toggle DOES NOT WORK")
                print("   Checking localStorage...")
                theme = await page.evaluate("() => localStorage.getItem('talor_theme')")
                print(f"   localStorage theme: {theme}")
        else:
            print("   ❌ Theme toggle NOT FOUND")

        # Check if user is logged in
        print("\n3. Checking user authentication...")
        user_id = await page.evaluate("() => localStorage.getItem('talor_user_id')")
        print(f"   User ID: {user_id}")

        if not user_id:
            print("   ⚠️  No user ID found - need to log in or set one")

        # Navigate to tailor resume page
        print("\n4. Checking Tailor Resume page...")
        try:
            # Look for navigation to tailor page
            tailor_link = await page.query_selector('a[href*="tailor"]')
            if tailor_link:
                print("   Found tailor link, clicking...")
                await tailor_link.click()
                await page.wait_for_timeout(3000)
            else:
                print("   Navigating directly to /tailor")
                await page.goto('https://talorme.com/tailor', wait_until='networkidle')
                await page.wait_for_timeout(3000)

            # Check if analysis components are present
            print("\n   Checking for analysis components...")

            match_score = await page.query_selector('[data-testid="match-score"]')
            print(f"   Match Score component: {'✅ Found' if match_score else '❌ Not found'}")

            resume_analysis = await page.query_selector('[data-testid="resume-analysis"]')
            print(f"   Resume Analysis component: {'✅ Found' if resume_analysis else '❌ Not found'}")

            keyword_panel = await page.query_selector('[data-testid="keyword-panel"]')
            print(f"   Keyword Panel component: {'✅ Found' if keyword_panel else '❌ Not found'}")

            # Check page content
            page_content = await page.content()

            # Check if components are imported
            if 'MatchScore' in page_content or 'match-score' in page_content:
                print("   ⚠️  MatchScore referenced in HTML")
            else:
                print("   ❌ MatchScore NOT in HTML")

            if 'ResumeAnalysis' in page_content or 'resume-analysis' in page_content:
                print("   ⚠️  ResumeAnalysis referenced in HTML")
            else:
                print("   ❌ ResumeAnalysis NOT in HTML")

        except Exception as e:
            print(f"   ❌ Error checking tailor page: {e}")

        # Navigate to interview prep
        print("\n5. Checking Interview Prep page...")
        try:
            await page.goto('https://talorme.com/interview-prep', wait_until='networkidle')
            await page.wait_for_timeout(2000)

            # Look for any interview prep entries
            prep_items = await page.query_selector_all('a[href*="/interview-prep/"]')
            print(f"   Found {len(prep_items)} interview prep entries")

            if prep_items:
                # Click first one
                print("   Clicking first interview prep entry...")
                await prep_items[0].click()
                await page.wait_for_timeout(3000)

                # Check for certifications section
                cert_section = await page.query_selector('text=Recommended Certifications')
                if cert_section:
                    print("   ✅ Certifications section found")

                    # Check if it's expanded
                    cert_content = await page.query_selector('[data-testid="certification-recommendations"]')
                    if cert_content:
                        print("   ✅ Certification recommendations component found")
                    else:
                        print("   ❌ Certification recommendations component NOT found")

                        # Try clicking to expand
                        await cert_section.click()
                        await page.wait_for_timeout(2000)

                        cert_content = await page.query_selector('[data-testid="certification-recommendations"]')
                        if cert_content:
                            print("   ✅ Certifications loaded after click")
                        else:
                            print("   ❌ Certifications still not showing")
                else:
                    print("   ❌ Certifications section NOT found")
            else:
                print("   ⚠️  No interview prep entries to test")

        except Exception as e:
            print(f"   ❌ Error checking interview prep: {e}")

        # Check API calls
        print("\n6. API Calls Made:")
        if network_requests:
            for req in network_requests:
                print(f"   {req['method']} {req['url']}")
                if 'X-User-ID' in req['headers']:
                    print(f"      X-User-ID: {req['headers']['X-User-ID']}")
                else:
                    print(f"      ❌ Missing X-User-ID header")
        else:
            print("   ⚠️  No API calls detected")

        # Check console errors
        print("\n7. Console Logs:")
        for log in console_logs[-10:]:  # Last 10 logs
            print(f"   {log}")

        print("\n8. JavaScript Errors:")
        if errors:
            for error in errors:
                print(f"   ❌ {error}")
        else:
            print("   ✅ No JavaScript errors")

        # Take screenshots
        print("\n9. Taking screenshots...")
        await page.screenshot(path='diagnosis_home.png', full_page=True)
        print("   Saved: diagnosis_home.png")

        print("\n" + "=" * 80)
        print("DIAGNOSIS COMPLETE")
        print("=" * 80)

        await browser.close()

if __name__ == '__main__':
    asyncio.run(diagnose_all_issues())
