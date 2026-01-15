"""
Comprehensive Playwright test to diagnose all console errors
"""
import asyncio
from playwright.async_api import async_playwright
import json

async def diagnose_errors():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, slow_mo=500)
        context = await browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = await context.new_page()

        # Capture all console messages
        console_messages = []
        page.on('console', lambda msg: console_messages.append({
            'type': msg.type,
            'text': msg.text
        }))

        # Capture all network requests and responses
        requests = []
        responses = []

        async def log_request(request):
            if 'api' in request.url:
                requests.append({
                    'method': request.method,
                    'url': request.url,
                    'headers': dict(request.headers),
                    'post_data': request.post_data
                })

        async def log_response(response):
            if 'api' in response.url:
                try:
                    body = await response.text()
                    responses.append({
                        'url': response.url,
                        'status': response.status,
                        'headers': dict(response.headers),
                        'body': body[:500] if body else None
                    })
                except:
                    responses.append({
                        'url': response.url,
                        'status': response.status,
                        'headers': dict(response.headers),
                        'body': 'Could not read body'
                    })

        page.on('request', log_request)
        page.on('response', log_response)

        print("=" * 80)
        print("COMPREHENSIVE ERROR DIAGNOSIS")
        print("=" * 80)

        # Step 1: Check backend health
        print("\n[1] Checking backend health...")
        health_response = await page.request.get('https://resume-ai-backend-production-3134.up.railway.app/health')
        print(f"Backend health: {health_response.status}")
        if health_response.status == 200:
            print(f"Backend response: {await health_response.text()}")

        # Step 2: Check CORS preflight
        print("\n[2] Testing CORS preflight...")
        cors_test = await page.request.fetch('https://resume-ai-backend-production-3134.up.railway.app/api/resume-analysis/analyze-changes', {
            'method': 'OPTIONS',
            'headers': {
                'Origin': 'https://talorme.com',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type,X-User-ID'
            }
        })
        print(f"CORS preflight status: {cors_test.status}")
        print(f"CORS headers: {dict(cors_test.headers)}")

        # Step 3: Navigate to tailor page
        print("\n[3] Navigating to /tailor page...")
        await page.goto('https://talorme.com/tailor', wait_until='networkidle', timeout=60000)
        await page.wait_for_timeout(3000)

        # Check if user ID exists
        user_id = await page.evaluate('() => localStorage.getItem("talor_user_id")')
        print(f"User ID in localStorage: {user_id}")

        # Step 4: Check if resumes are available
        print("\n[4] Checking for available resumes...")
        select_buttons = await page.query_selector_all('button:has-text("Select")')
        print(f"Found {len(select_buttons)} resumes")

        if not select_buttons:
            print("❌ No resumes available - need to upload one first")
            print("Skipping generation test")
        else:
            # Step 5: Try to generate a tailored resume
            print("\n[5] Attempting to generate tailored resume...")

            # Select first resume
            await select_buttons[0].click()
            await page.wait_for_timeout(1000)
            print("✓ Selected resume")

            # Fill in job details
            company_input = await page.query_selector('input[placeholder*="Company"]')
            if company_input:
                await company_input.fill("Test Company")
                print("✓ Filled company")

            title_input = await page.query_selector('input[placeholder*="Title"]')
            if title_input:
                await title_input.fill("Test Position")
                print("✓ Filled title")

            url_input = await page.query_selector('input[placeholder*="URL"]')
            if url_input:
                await url_input.fill("https://example.com/job")
                print("✓ Filled URL")

            # Click generate button
            generate_btn = await page.query_selector('button:has-text("Generate")')
            if generate_btn:
                await generate_btn.click()
                print("✓ Clicked generate button")

                # Wait a bit for the API call
                await page.wait_for_timeout(5000)

        # Step 6: Analyze requests and responses
        print("\n" + "=" * 80)
        print("API REQUESTS MADE:")
        print("=" * 80)
        for req in requests:
            print(f"\n{req['method']} {req['url']}")
            print(f"Headers: {json.dumps(req['headers'], indent=2)}")
            if req['post_data']:
                print(f"Body: {req['post_data'][:200]}")

        print("\n" + "=" * 80)
        print("API RESPONSES RECEIVED:")
        print("=" * 80)
        for resp in responses:
            print(f"\n{resp['status']} {resp['url']}")
            print(f"Headers: {json.dumps(resp['headers'], indent=2)}")
            if resp['body']:
                print(f"Body: {resp['body']}")

        print("\n" + "=" * 80)
        print("CONSOLE MESSAGES:")
        print("=" * 80)
        for msg in console_messages:
            if msg['type'] == 'error' or 'CORS' in msg['text'] or 'Failed' in msg['text']:
                print(f"[{msg['type']}] {msg['text']}")

        # Step 7: Test backend API directly
        print("\n" + "=" * 80)
        print("DIRECT BACKEND API TESTS:")
        print("=" * 80)

        # Test analyze-changes endpoint
        print("\n[TEST] POST /api/resume-analysis/analyze-changes")
        try:
            test_response = await page.request.post(
                'https://resume-ai-backend-production-3134.up.railway.app/api/resume-analysis/analyze-changes',
                headers={
                    'Content-Type': 'application/json',
                    'X-User-ID': user_id or 'test-user',
                    'Origin': 'https://talorme.com'
                },
                data=json.dumps({'tailored_resume_id': 1})
            )
            print(f"Status: {test_response.status}")
            print(f"Headers: {dict(test_response.headers)}")
            body = await test_response.text()
            print(f"Body: {body[:500]}")
        except Exception as e:
            print(f"Error: {e}")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(diagnose_errors())
