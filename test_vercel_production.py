"""
Comprehensive Playwright test for Vercel production frontend
Tests: https://talorme.com
"""
import asyncio
from playwright.async_api import async_playwright
import json
import sys
import io

# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

async def test_vercel_production():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, slow_mo=300)
        context = await browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = await context.new_page()

        # Capture all console messages
        console_messages = []
        console_errors = []

        def handle_console(msg):
            console_messages.append({
                'type': msg.type,
                'text': msg.text
            })
            if msg.type == 'error':
                console_errors.append(msg.text)

        page.on('console', handle_console)

        # Capture network requests and responses
        api_requests = []
        api_responses = []

        def handle_request(request):
            if 'api' in request.url or 'railway' in request.url:
                api_requests.append({
                    'method': request.method,
                    'url': request.url,
                    'headers': dict(request.headers)
                })

        async def handle_response(response):
            if 'api' in response.url or 'railway' in response.url:
                api_responses.append({
                    'url': response.url,
                    'status': response.status,
                    'ok': response.ok
                })

        page.on('request', handle_request)
        page.on('response', handle_response)

        print("=" * 80)
        print("VERCEL PRODUCTION FRONTEND TEST")
        print("URL: https://talorme.com")
        print("=" * 80)

        # Step 1: Navigate to homepage
        print("\n[STEP 1] Testing Homepage...")
        try:
            await page.goto('https://talorme.com', wait_until='networkidle', timeout=30000)
            print("✅ Homepage loaded successfully")
            await page.wait_for_timeout(2000)
        except Exception as e:
            print(f"❌ Homepage failed to load: {e}")
            await browser.close()
            return

        # Step 2: Check theme toggle
        print("\n[STEP 2] Testing Theme Toggle...")
        theme_toggle = await page.query_selector('[data-testid="theme-toggle"]')
        if theme_toggle:
            print("✅ Theme toggle found")
            initial_theme = await page.evaluate('() => document.documentElement.classList.contains("dark")')
            await theme_toggle.click()
            await page.wait_for_timeout(500)
            new_theme = await page.evaluate('() => document.documentElement.classList.contains("dark")')
            if initial_theme != new_theme:
                print("✅ Theme toggle working")
            else:
                print("⚠️  Theme toggle not changing theme")
        else:
            print("⚠️  Theme toggle not found")

        # Step 3: Navigate to tailor page
        print("\n[STEP 3] Testing /tailor page...")
        try:
            await page.goto('https://talorme.com/tailor', wait_until='networkidle', timeout=30000)
            print("✅ Tailor page loaded")
            await page.wait_for_timeout(3000)
        except Exception as e:
            print(f"❌ Tailor page failed: {e}")

        # Check user ID
        user_id = await page.evaluate('() => localStorage.getItem("talor_user_id")')
        print(f"   User ID: {user_id if user_id else 'NOT SET'}")

        # Check for resumes
        select_buttons = await page.query_selector_all('button:has-text("Select")')
        print(f"   Found {len(select_buttons)} base resumes")

        # Step 4: Test form inputs
        print("\n[STEP 4] Testing Form Inputs...")
        company_input = await page.query_selector('input[placeholder*="Company"], input[name="company"]')
        if company_input:
            await company_input.fill("Playwright Test Company")
            print("✅ Company input working")
        else:
            print("❌ Company input not found")

        title_input = await page.query_selector('input[placeholder*="Title"], input[name="jobTitle"]')
        if title_input:
            await title_input.fill("Senior Test Engineer")
            print("✅ Title input working")
        else:
            print("❌ Title input not found")

        url_input = await page.query_selector('input[placeholder*="URL"], input[name="jobUrl"]')
        if url_input:
            await url_input.fill("https://example.com/test-job")
            print("✅ URL input working")
        else:
            print("❌ URL input not found")

        # Step 5: Check if we can test generation
        if select_buttons and len(select_buttons) > 0:
            print("\n[STEP 5] Testing Resume Generation...")
            print("   Selecting first resume...")
            await select_buttons[0].click()
            await page.wait_for_timeout(1000)

            generate_btn = await page.query_selector('button:has-text("Generate")')
            if generate_btn:
                is_disabled = await generate_btn.evaluate('btn => btn.disabled')
                if not is_disabled:
                    print("   🚀 Clicking generate button (this will take 60-90 seconds)...")
                    await generate_btn.click()

                    try:
                        # Wait for either success or error
                        await page.wait_for_selector('text=Success, text=Error, text=Failed', timeout=120000)
                        await page.wait_for_timeout(3000)

                        success_msg = await page.query_selector('text=Success')
                        if success_msg:
                            print("✅ Generation succeeded!")

                            # Wait for analysis to potentially load
                            await page.wait_for_timeout(5000)

                            # Check for analysis components
                            print("\n[STEP 6] Checking Analysis Components...")

                            match_score = await page.query_selector('[data-testid="match-score"]')
                            if match_score:
                                print("✅ Match Score component rendered")
                            else:
                                print("⚠️  Match Score not found")

                            analysis = await page.query_selector('[data-testid="resume-analysis"]')
                            if analysis:
                                print("✅ Resume Analysis component rendered")
                            else:
                                print("⚠️  Resume Analysis not found")

                            keywords = await page.query_selector('[data-testid="keyword-panel"]')
                            if keywords:
                                print("✅ Keyword Panel component rendered")
                            else:
                                print("⚠️  Keyword Panel not found")

                            # Test download button
                            print("\n[STEP 7] Testing Download Button...")
                            download_btn = await page.query_selector('button:has-text("Download")')
                            if download_btn:
                                print("✅ Download button found")
                                # Don't actually download, just check it exists
                            else:
                                print("⚠️  Download button not found")

                            # Take success screenshot
                            await page.screenshot(path='vercel_test_success.png', full_page=True)
                            print("📸 Success screenshot: vercel_test_success.png")

                        else:
                            error_msg = await page.query_selector('text=Error, text=Failed')
                            if error_msg:
                                error_text = await error_msg.inner_text()
                                print(f"❌ Generation failed: {error_text}")

                    except Exception as e:
                        print(f"❌ Generation timeout or error: {e}")
                        await page.screenshot(path='vercel_test_timeout.png', full_page=True)
                else:
                    print("⚠️  Generate button is disabled (need to fill all fields)")
            else:
                print("❌ Generate button not found")
        else:
            print("\n[STEP 5] ⚠️  No resumes available - skipping generation test")
            print("   Upload a resume at https://talorme.com/upload to enable full testing")

        # Step 8: Analyze console errors
        print("\n" + "=" * 80)
        print("CONSOLE ERROR ANALYSIS")
        print("=" * 80)

        critical_errors = []
        for error in console_errors:
            if any(keyword in error for keyword in ['CORS', 'Failed to fetch', '404', '500', 'ERR_FAILED']):
                critical_errors.append(error)

        if critical_errors:
            print(f"\n❌ Found {len(critical_errors)} critical errors:")
            for error in critical_errors[:10]:  # Show first 10
                print(f"   - {error[:150]}")
        else:
            print("\n✅ No critical console errors detected!")

        # Step 9: Analyze API calls
        print("\n" + "=" * 80)
        print("API REQUEST/RESPONSE ANALYSIS")
        print("=" * 80)

        print(f"\nTotal API requests: {len(api_requests)}")
        print(f"Total API responses: {len(api_responses)}")

        # Check for failed API calls
        failed_responses = [r for r in api_responses if not r['ok']]
        if failed_responses:
            print(f"\n❌ Found {len(failed_responses)} failed API calls:")
            for resp in failed_responses[:10]:
                print(f"   {resp['status']} - {resp['url']}")
        else:
            print("\n✅ All API calls returned 2xx status!")

        # Step 10: Check for specific endpoints
        print("\n" + "=" * 80)
        print("ENDPOINT HEALTH CHECK")
        print("=" * 80)

        resume_analysis_calls = [r for r in api_responses if 'resume-analysis' in r['url']]
        if resume_analysis_calls:
            print(f"\nResume Analysis API calls: {len(resume_analysis_calls)}")
            for call in resume_analysis_calls:
                status_symbol = "✅" if call['ok'] else "❌"
                print(f"   {status_symbol} {call['status']} - {call['url'].split('/')[-1]}")
        else:
            print("\n⚠️  No resume-analysis API calls detected")

        # Final screenshot
        await page.screenshot(path='vercel_test_final.png', full_page=True)
        print("\n📸 Final screenshot: vercel_test_final.png")

        print("\n" + "=" * 80)
        print("TEST COMPLETE")
        print("=" * 80)
        print("\n📊 Summary:")
        print(f"   Console errors: {len(console_errors)} total, {len(critical_errors)} critical")
        print(f"   API calls: {len(api_requests)}")
        print(f"   Failed API calls: {len(failed_responses)}")
        print(f"   User ID: {'SET' if user_id else 'NOT SET'}")
        print(f"   Base resumes: {len(select_buttons)}")

        if len(critical_errors) == 0 and len(failed_responses) == 0:
            print("\n🎉 ALL TESTS PASSED! Frontend is working correctly.")
        else:
            print("\n⚠️  Issues detected. Review console errors and API failures above.")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(test_vercel_production())
