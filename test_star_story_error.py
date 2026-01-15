"""
Test STAR Story Builder to find root cause of JSON error
"""
import asyncio
from playwright.async_api import async_playwright

async def test_star_story_error():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context()

        # Enable console logging
        page = await context.new_page()

        console_messages = []
        network_requests = []
        network_responses = []

        # Capture console messages
        page.on("console", lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))

        # Capture network activity
        async def handle_request(request):
            if '/api/' in request.url:
                network_requests.append({
                    'url': request.url,
                    'method': request.method,
                    'post_data': request.post_data
                })
                print(f"\n[REQUEST] {request.method} {request.url}")
                if request.post_data:
                    print(f"  Body: {request.post_data[:500]}")

        async def handle_response(response):
            if '/api/' in response.url:
                try:
                    body = await response.body()
                    network_responses.append({
                        'url': response.url,
                        'status': response.status,
                        'body': body.decode('utf-8', errors='ignore')[:1000]
                    })
                    print(f"\n[RESPONSE] {response.status} {response.url}")
                    print(f"  Body: {body.decode('utf-8', errors='ignore')[:500]}")
                except Exception as e:
                    print(f"  Error reading body: {e}")

        page.on("request", handle_request)
        page.on("response", handle_response)

        try:
            print("=" * 80)
            print("TESTING STAR STORY BUILDER ERROR")
            print("=" * 80)

            # Navigate to interview prep page
            print("\n[TEST 1] Navigate to interview prep page")
            await page.goto("https://talorme.com/interview-prep/78", wait_until="domcontentloaded")
            await asyncio.sleep(5)
            print("  [OK] Page loaded")

            # Wait for STAR Story Builder section to appear
            print("\n[TEST 2] Locate STAR Story Builder")
            star_section = page.locator('text=STAR Story Builder')
            if await star_section.count() > 0:
                print("  [OK] STAR Story Builder section found")

                # Scroll to the section
                await star_section.scroll_into_view_if_needed()
                await asyncio.sleep(1)

                # Check if experiences are loaded
                print("\n[TEST 3] Check if experiences are loaded")
                experience_text = page.locator('text=/Select Your Experiences|Loading resume experiences/i')
                if await experience_text.count() > 0:
                    text = await experience_text.first.inner_text()
                    print(f"  Status: {text}")

                # Look for checkboxes
                checkboxes = page.locator('input[type="checkbox"]')
                checkbox_count = await checkboxes.count()
                print(f"  Checkboxes found: {checkbox_count}")

                # If we have checkboxes, select the first one
                if checkbox_count > 0:
                    print("\n[TEST 4] Select first experience")
                    first_checkbox = checkboxes.first
                    await first_checkbox.check()
                    await asyncio.sleep(1)
                    print("  [OK] First checkbox selected")

                # Look for theme input
                print("\n[TEST 5] Check for theme input")
                theme_input = page.locator('input[placeholder*="theme" i], input[placeholder*="story" i]')
                theme_count = await theme_input.count()
                print(f"  Theme inputs found: {theme_count}")

                if theme_count > 0:
                    print("  [OK] Filling theme input")
                    await theme_input.first.fill("Handling ambiguity under pressure")
                    await asyncio.sleep(1)

                # Find and click Generate button
                print("\n[TEST 6] Click Generate Star Story button")
                generate_button = page.locator('button:has-text("Generate")')
                button_count = await generate_button.count()
                print(f"  Generate buttons found: {button_count}")

                if button_count > 0:
                    # Take screenshot before clicking
                    await page.screenshot(path="star_story_before_click.png")
                    print("  [OK] Screenshot saved: star_story_before_click.png")

                    # Click the button
                    await generate_button.first.click()
                    print("  [OK] Button clicked")

                    # Wait to see response
                    await asyncio.sleep(5)

                    # Check for error dialog
                    error_dialog = page.locator('text=/Failed to generate story/i')
                    if await error_dialog.count() > 0:
                        error_text = await error_dialog.first.inner_text()
                        print(f"\n  [ERROR] Error dialog appeared: {error_text}")

                    # Take screenshot after clicking
                    await page.screenshot(path="star_story_after_click.png")
                    print("  [OK] Screenshot saved: star_story_after_click.png")
                else:
                    print("  [ERROR] Generate button not found")
            else:
                print("  [ERROR] STAR Story Builder section not found")

            # Print summary
            print("\n" + "=" * 80)
            print("NETWORK SUMMARY")
            print("=" * 80)
            print(f"\nTotal API Requests: {len(network_requests)}")
            print(f"Total API Responses: {len(network_responses)}")

            # Check for generate-star-story endpoint
            star_story_requests = [r for r in network_requests if 'generate-star-story' in r['url']]
            star_story_responses = [r for r in network_responses if 'generate-star-story' in r['url']]

            print(f"\nSTAR Story Requests: {len(star_story_requests)}")
            if star_story_requests:
                for req in star_story_requests:
                    print(f"\n  URL: {req['url']}")
                    print(f"  Method: {req['method']}")
                    print(f"  Body: {req['post_data']}")

            print(f"\nSTAR Story Responses: {len(star_story_responses)}")
            if star_story_responses:
                for resp in star_story_responses:
                    print(f"\n  URL: {resp['url']}")
                    print(f"  Status: {resp['status']}")
                    print(f"  Body: {resp['body']}")

            print("\n" + "=" * 80)
            print("CONSOLE MESSAGES")
            print("=" * 80)
            for msg in console_messages[-20:]:  # Last 20 messages
                print(msg)

            print("\n\nKeeping browser open for 30 seconds for manual inspection...")
            await asyncio.sleep(30)

        except Exception as e:
            print(f"\n[ERROR] {e}")
            import traceback
            traceback.print_exc()
            await page.screenshot(path="test_error.png")
            await asyncio.sleep(10)

        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(test_star_story_error())
