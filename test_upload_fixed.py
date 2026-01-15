#!/usr/bin/env python3
"""
Test resume upload after CORS fix
"""
import asyncio
from playwright.async_api import async_playwright
import os

async def test_upload():
    print("=" * 70)
    print("TESTING RESUME UPLOAD (CORS FIX)")
    print("=" * 70)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context()
        page = await context.new_page()

        # Capture console messages
        console_messages = []
        page.on("console", lambda msg: console_messages.append(f"[{msg.type.upper()}] {msg.text}"))

        # Capture network errors
        network_errors = []
        page.on("requestfailed", lambda req: network_errors.append(f"Failed: {req.url}"))

        # Capture API responses
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
                        'body': body[:500]
                    })
                except:
                    responses.append({
                        'url': url,
                        'status': status,
                        'body': 'Could not read body'
                    })

        page.on("response", handle_response)

        print("\n[1/5] Loading upload page...")
        await page.goto("https://talorme.com/upload", wait_until='networkidle')
        await asyncio.sleep(2)

        user_id = await page.evaluate("() => localStorage.getItem('talor_user_id')")
        print(f"  Session ID: {user_id}")

        # Create test file
        test_file = os.path.join(os.getcwd(), "test_resume.pdf")
        if os.path.exists(test_file):
            print(f"\n[2/5] Using existing test file: {test_file}")
        else:
            print(f"\n[2/5] Test file not found: {test_file}")
            print("  Please ensure test_resume.pdf exists")
            await browser.close()
            return

        try:
            print("\n[3/5] Finding file input...")

            # The file input is hidden, so we need to interact with it directly
            # Wait for page to be fully loaded
            file_input = await page.query_selector('input[type="file"]')

            if file_input:
                print("  File input found (hidden element)")

                print("\n[4/5] Uploading file...")
                # Set the file directly on the hidden input
                await file_input.set_input_files(test_file)

                # Wait for upload to complete
                print("  Waiting for upload to process...")
                await asyncio.sleep(8)

                print("\n[5/5] Checking results...")

                # Check for success message
                success_element = await page.query_selector('text=Resume uploaded successfully')
                if success_element:
                    print("  SUCCESS: Upload completed!")
                else:
                    error_element = await page.query_selector('text=Upload failed')
                    if error_element:
                        print("  ERROR: Upload failed message displayed")
                    else:
                        # Check if "Uploading..." is still showing
                        uploading = await page.query_selector('text=Uploading')
                        if uploading:
                            print("  WAITING: Still uploading...")
                        else:
                            print("  UNKNOWN: No success or error message found")

            else:
                print("  ERROR: File input not found")

        except Exception as e:
            print(f"  ERROR: {e}")

        print("\n  Console Messages:")
        for msg in console_messages[-10:]:
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
        print("Test complete - check browser for visual confirmation")
        print("Press Ctrl+C to close browser...")
        print("=" * 70)

        # Keep browser open longer for inspection
        await asyncio.sleep(60)
        await browser.close()

if __name__ == "__main__":
    asyncio.run(test_upload())
