"""
Comprehensive Playwright test of frontend and backend
"""
import asyncio
from playwright.async_api import async_playwright
import sys
import io
import json

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

async def comprehensive_test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, slow_mo=500)
        context = await browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = await context.new_page()

        console_logs = []
        js_errors = []
        api_requests = []
        api_responses = []

        page.on('console', lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))
        page.on('pageerror', lambda err: js_errors.append(str(err)))

        async def log_request(request):
            if 'api' in request.url:
                api_requests.append({
                    'method': request.method,
                    'url': request.url,
                    'headers': dict(request.headers)
                })

        async def log_response(response):
            if 'api' in response.url:
                try:
                    body = await response.text()
                    api_responses.append({
                        'url': response.url,
                        'status': response.status,
                        'body': body[:500] if body else 'empty'
                    })
                except:
                    api_responses.append({
                        'url': response.url,
                        'status': response.status,
                        'body': 'could not read'
                    })

        page.on('request', log_request)
        page.on('response', log_response)

        print("=" * 80)
        print("COMPREHENSIVE FRONTEND + BACKEND TEST")
        print("=" * 80)

        # Step 1: Load homepage
        print("\n[STEP 1] Loading talorme.com...")
        await page.goto('https://talorme.com', wait_until='networkidle', timeout=60000)
        await page.wait_for_timeout(2000)
        print("✓ Homepage loaded")

        # Step 2: Check theme toggle
        print("\n[STEP 2] Testing theme toggle...")
        theme_toggle = await page.query_selector('[data-testid="theme-toggle"]')
        if theme_toggle:
            print("✓ Theme toggle found on homepage")
        else:
            print("✗ Theme toggle NOT found on homepage")

        # Step 3: Navigate to /tailor
        print("\n[STEP 3] Navigating to /tailor...")
        await page.goto('https://talorme.com/tailor', wait_until='networkidle', timeout=60000)
        await page.wait_for_timeout(3000)

        theme_toggle = await page.query_selector('[data-testid="theme-toggle"]')
        if theme_toggle:
            print("✓ Theme toggle found on /tailor")

            # Test clicking it
            html_class_before = await page.locator('html').get_attribute('class')
            await theme_toggle.click()
            await page.wait_for_timeout(1000)
            html_class_after = await page.locator('html').get_attribute('class')

            if html_class_before != html_class_after:
                print(f"✓ Theme toggle WORKS (changed from {html_class_before} to {html_class_after})")
            else:
                print(f"✗ Theme toggle DOES NOT WORK (stayed {html_class_before})")
        else:
            print("✗ Theme toggle NOT found on /tailor")

        # Step 4: Check for existing resumes
        print("\n[STEP 4] Checking for existing base resumes...")
        await page.wait_for_timeout(2000)

        # Look for resume items
        resume_items = await page.query_selector_all('button:has-text("Select")')
        print(f"Found {len(resume_items)} base resumes")

        # Step 5: Check for existing tailored resumes
        print("\n[STEP 5] Looking for existing tailored resumes...")
        tailored_items = await page.query_selector_all('text=View Details')
        print(f"Found {len(tailored_items)} tailored resumes with 'View Details' button")

        if tailored_items:
            print("\n[STEP 6] Clicking first tailored resume...")
            await tailored_items[0].click()
            await page.wait_for_timeout(5000)

            print(f"Current URL: {page.url}")

            # Check for analysis components
            print("\n[STEP 7] Checking for analysis components...")

            match_score = await page.query_selector('[data-testid="match-score"]')
            print(f"Match Score: {'✓ FOUND' if match_score else '✗ NOT FOUND'}")

            resume_analysis = await page.query_selector('[data-testid="resume-analysis"]')
            print(f"Resume Analysis: {'✓ FOUND' if resume_analysis else '✗ NOT FOUND'}")

            keyword_panel = await page.query_selector('[data-testid="keyword-panel"]')
            print(f"Keyword Panel: {'✓ FOUND' if keyword_panel else '✗ NOT FOUND'}")

            # Check if loading
            loading_indicators = await page.query_selector_all('text=Loading')
            if loading_indicators:
                print(f"\n⏳ Found {len(loading_indicators)} 'Loading' indicators - waiting...")
                await page.wait_for_timeout(5000)

                # Check again
                match_score = await page.query_selector('[data-testid="match-score"]')
                print(f"Match Score after wait: {'✓ FOUND' if match_score else '✗ NOT FOUND'}")
        else:
            print("\n⚠️  No existing tailored resumes - need to generate one")
            print("\n[STEP 6] Attempting to generate a tailored resume...")

            # Try to generate
            generate_button = await page.query_selector('button:has-text("Generate Tailored Resume")')
            if generate_button:
                print("Found generate button, but need resume + job details")
            else:
                print("Generate button not found")

        # Step 8: Navigate to Interview Prep
        print("\n[STEP 8] Navigating to Interview Prep...")
        await page.goto('https://talorme.com/interview-prep', wait_until='networkidle', timeout=60000)
        await page.wait_for_timeout(3000)

        # Look for interview prep entries
        prep_links = await page.query_selector_all('a[href*="/interview-prep/"]')
        print(f"Found {len(prep_links)} interview prep entries")

        if prep_links:
            print("\n[STEP 9] Clicking first interview prep...")
            await prep_links[0].click()
            await page.wait_for_timeout(5000)

            # Check for certifications section
            print("\n[STEP 10] Checking for certifications section...")
            cert_header = await page.query_selector('text=Recommended Certifications')
            if cert_header:
                print("✓ Certifications section found")

                # Try to expand it
                await cert_header.click()
                await page.wait_for_timeout(3000)

                cert_component = await page.query_selector('[data-testid="certification-recommendations"]')
                if cert_component:
                    print("✓ Certification recommendations component rendered")
                else:
                    print("✗ Certification recommendations component NOT rendered")

                    # Check for loading
                    loading = await page.query_selector('text=Loading certifications')
                    if loading:
                        print("⏳ Certifications loading...")
                        await page.wait_for_timeout(5000)
                        cert_component = await page.query_selector('[data-testid="certification-recommendations"]')
                        if cert_component:
                            print("✓ Certifications loaded after wait")
                        else:
                            print("✗ Certifications still not loaded")
            else:
                print("✗ Certifications section NOT found")
        else:
            print("⚠️  No interview prep entries to test")

        # Step 11: Check API calls
        print("\n[STEP 11] API Calls Made:")
        if api_requests:
            for req in api_requests:
                print(f"  {req['method']} {req['url']}")
                has_user_id = 'X-User-ID' in req['headers'] or 'x-user-id' in req['headers']
                print(f"    X-User-ID: {'✓ Present' if has_user_id else '✗ MISSING'}")
        else:
            print("  ⚠️  NO API CALLS MADE")

        # Step 12: Check API responses
        print("\n[STEP 12] API Responses:")
        if api_responses:
            for resp in api_responses:
                print(f"  {resp['url']}")
                print(f"    Status: {resp['status']}")
                if resp['status'] >= 400:
                    print(f"    Body: {resp['body'][:200]}")
        else:
            print("  ⚠️  NO API RESPONSES")

        # Step 13: Console errors
        print("\n[STEP 13] JavaScript Errors:")
        if js_errors:
            for err in js_errors:
                print(f"  ✗ {err}")
        else:
            print("  ✓ No JavaScript errors")

        # Step 14: Console logs (last 20)
        print("\n[STEP 14] Recent Console Logs:")
        for log in console_logs[-20:]:
            print(f"  {log}")

        # Take screenshots
        print("\n[STEP 15] Taking screenshots...")
        await page.screenshot(path='comprehensive_test_final.png', full_page=True)
        print("  Saved: comprehensive_test_final.png")

        print("\n" + "=" * 80)
        print("TEST COMPLETE")
        print("=" * 80)

        await browser.close()

if __name__ == '__main__':
    asyncio.run(comprehensive_test())
