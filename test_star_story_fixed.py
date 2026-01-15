"""
Test STAR Story Builder after fixes
"""
import asyncio
from playwright.async_api import async_playwright

async def test_star_story_fixed():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context()
        page = await context.new_page()

        console_messages = []
        api_calls = []

        # Capture console messages
        page.on("console", lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))

        # Capture API calls
        async def handle_response(response):
            if '/api/' in response.url:
                try:
                    body = await response.body()
                    api_calls.append({
                        'url': response.url,
                        'status': response.status,
                        'body': body.decode('utf-8', errors='ignore')[:500]
                    })
                    print(f"\n[API] {response.status} {response.url}")
                    if 'generate-star-story' in response.url:
                        print(f"  Response: {body.decode('utf-8', errors='ignore')[:500]}")
                except Exception as e:
                    print(f"  Error reading body: {e}")

        page.on("response", handle_response)

        try:
            print("=" * 80)
            print("TESTING STAR STORY BUILDER AFTER FIXES")
            print("=" * 80)

            print("\n[TEST 1] Navigate to interview prep page")
            await page.goto("https://talorme.com/interview-prep/78", wait_until="domcontentloaded")
            await asyncio.sleep(5)
            print("  [OK] Page loaded")

            # Check for warning banner
            print("\n[TEST 2] Check for warning banner")
            warning = page.locator('text=/Warning.*deleted/i')
            warning_count = await warning.count()
            if warning_count > 0:
                warning_text = await warning.first.inner_text()
                print(f"  [FOUND] Warning: {warning_text[:100]}")
            else:
                print("  [INFO] No warning banner (tailored resume exists)")

            # Check for STAR Story Builder
            print("\n[TEST 3] Locate STAR Story Builder section")
            star_section = page.locator('h3:has-text("STAR Story Builder")')
            if await star_section.count() > 0:
                print("  [OK] STAR Story Builder found")
                await star_section.scroll_into_view_if_needed()
                await asyncio.sleep(2)

                # Check experiences status
                print("\n[TEST 4] Check experience loading status")
                loading_msg = page.locator('text=/Loading resume experiences/i')
                if await loading_msg.count() > 0:
                    print("  [INFO] Experiences are loading...")

                no_exp_msg = page.locator('text=/original resume.*deleted/i')
                if await no_exp_msg.count() > 0:
                    text = await no_exp_msg.first.inner_text()
                    print(f"  [WARNING] {text[:150]}")
                    print("\n  CONCLUSION: Cannot test STAR Story Builder - tailored resume deleted")
                    print("  FIX APPLIED: Shows proper warning instead of JSON parse error")
                    await page.screenshot(path="star_story_with_warning.png")
                    print("  [OK] Screenshot: star_story_with_warning.png")
                else:
                    # Check for checkboxes
                    checkboxes = page.locator('input[type="checkbox"]')
                    checkbox_count = await checkboxes.count()
                    print(f"  [INFO] Checkboxes found: {checkbox_count}")

                    if checkbox_count > 0:
                        print("\n[TEST 5] Select first experience")
                        await checkboxes.first.check()
                        await asyncio.sleep(1)
                        print("  [OK] Experience selected")

                        # Enter theme
                        print("\n[TEST 6] Check theme selection")
                        theme_select = page.locator('select')
                        if await theme_select.count() > 0:
                            print("  [OK] Theme selector found")

                        # Try to click Generate button
                        print("\n[TEST 7] Test Generate button")
                        generate_btn = page.locator('button:has-text("Generate STAR Story")')
                        if await generate_btn.count() > 0:
                            is_disabled = await generate_btn.first.is_disabled()
                            print(f"  Button state: {'DISABLED' if is_disabled else 'ENABLED'}")

                            if not is_disabled:
                                print("  [OK] Clicking Generate button...")
                                await generate_btn.first.click()
                                await asyncio.sleep(8)

                                # Check for success/error
                                error_alert = page.locator('text=/Failed to generate story/i')
                                if await error_alert.count() > 0:
                                    print("  [ERROR] Generation failed")
                                else:
                                    print("  [OK] No error alert shown")
                    else:
                        print("  [INFO] No checkboxes - experiences not loaded")

            else:
                print("  [ERROR] STAR Story Builder section not found")

            # Take final screenshot
            await page.screenshot(path="star_story_test_final.png", full_page=True)
            print("\n[OK] Final screenshot: star_story_test_final.png")

            # Summary
            print("\n" + "=" * 80)
            print("TEST SUMMARY")
            print("=" * 80)

            star_story_calls = [c for c in api_calls if 'generate-star-story' in c['url']]
            if star_story_calls:
                print("\n[OK] STAR Story API was called")
                for call in star_story_calls:
                    print(f"  Status: {call['status']}")
                    print(f"  Response: {call['body'][:200]}")
            else:
                print("\n[INFO] STAR Story API was NOT called")
                print("  This is expected if tailored resume is deleted")

            # Check for console errors
            errors = [m for m in console_messages if 'error' in m.lower() or 'failed' in m.lower()]
            if errors:
                print(f"\n[WARNING] Console Errors ({len(errors)}):")
                for err in errors[-5:]:
                    print(f"  {err[:150]}")

            print("\n\nKeeping browser open for 30 seconds...")
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
    asyncio.run(test_star_story_fixed())
