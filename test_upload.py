#!/usr/bin/env python3
"""
Test resume upload functionality and capture errors
"""
import asyncio
from playwright.async_api import async_playwright
import os

async def test_upload():
    print("=" * 70)
    print("TESTING RESUME UPLOAD")
    print("=" * 70)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context()
        page = await context.new_page()

        # Capture all console messages
        console_messages = []
        page.on("console", lambda msg: console_messages.append(f"[{msg.type.upper()}] {msg.text}"))

        # Capture network errors
        network_errors = []
        page.on("requestfailed", lambda req: network_errors.append(f"Failed: {req.url} - {req.failure}"))

        # Capture responses
        responses = []
        async def handle_response(response):
            if '/api/' in response.url:
                status = response.status
                url = response.url
                try:
                    body = await response.text()
                    responses.append({
                        'url': url,
                        'status': status,
                        'body': body[:500]  # First 500 chars
                    })
                except:
                    responses.append({
                        'url': url,
                        'status': status,
                        'body': 'Could not read body'
                    })

        page.on("response", handle_response)

        print("\n[1/4] Loading homepage...")
        await page.goto("https://talorme.com", wait_until='networkidle')
        await asyncio.sleep(2)

        user_id = await page.evaluate("() => localStorage.getItem('talor_user_id')")
        print(f"  Session ID: {user_id}")

        # Create a test file
        test_file = os.path.join(os.getcwd(), "test_resume.txt")
        with open(test_file, 'w') as f:
            f.write("Test Resume Content\n" * 100)

        print(f"\n[2/4] Test file created: {test_file}")

        try:
            print("\n[3/4] Attempting to upload...")

            # Find file input
            file_input = await page.query_selector('input[type="file"]')

            if not file_input:
                print("  ERROR: Could not find file input element!")
                print("  Available upload buttons/inputs:")
                buttons = await page.query_selector_all('button')
                for button in buttons[:5]:
                    text = await button.inner_text()
                    print(f"    - {text}")
            else:
                # Set files
                await file_input.set_input_files(test_file)
                print("  File selected")

                # Wait for upload to process
                await asyncio.sleep(5)

        except Exception as e:
            print(f"  ERROR during upload: {e}")

        print("\n[4/4] Checking results...")

        print("\n  Console Messages:")
        for msg in console_messages[-10:]:  # Last 10 messages
            print(f"    {msg}")

        print("\n  Network Errors:")
        if network_errors:
            for err in network_errors:
                print(f"    {err}")
        else:
            print("    None")

        print("\n  API Responses:")
        if responses:
            for resp in responses:
                print(f"    {resp['status']} - {resp['url']}")
                if resp['status'] >= 400:
                    print(f"      Body: {resp['body']}")
        else:
            print("    No API calls detected")

        print("\n" + "=" * 70)
        print("Keeping browser open for manual inspection (30 seconds)...")
        print("Check the browser window for any visible errors")
        print("=" * 70)

        await asyncio.sleep(30)

        # Cleanup
        if os.path.exists(test_file):
            os.remove(test_file)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(test_upload())
