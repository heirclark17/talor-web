"""
Test and fix tailored resume generation bug
Reproduces the 400 Bad Request error from /api/tailor/tailor
"""

from playwright.sync_api import sync_playwright
import time
import json

def test_tailor_resume():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=500)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        # Capture all API requests and responses
        api_calls = []

        def handle_response(response):
            if '/api/' in response.url:
                api_calls.append({
                    'url': response.url,
                    'status': response.status,
                    'method': response.request.method,
                })
                print(f"API: {response.request.method} {response.status} {response.url}")

                # Capture detailed info for tailor endpoint
                if '/api/tailor/tailor' in response.url:
                    print("\n" + "="*70)
                    print("TAILOR API CALL DETAILS")
                    print("="*70)
                    print(f"Method: {response.request.method}")
                    print(f"Status: {response.status}")
                    print(f"URL: {response.url}")

                    # Get request body
                    try:
                        post_data = response.request.post_data
                        if post_data:
                            print("\nRequest Body:")
                            try:
                                request_json = json.loads(post_data)
                                print(json.dumps(request_json, indent=2))
                            except:
                                print(post_data[:500])
                    except:
                        pass

                    # Get response body
                    try:
                        response_body = response.text()
                        print("\nResponse Body:")
                        try:
                            response_json = json.loads(response_body)
                            print(json.dumps(response_json, indent=2))
                        except:
                            print(response_body[:500])
                    except:
                        pass

                    print("="*70 + "\n")

        page.on('response', handle_response)
        page.on('console', lambda msg: print(f'CONSOLE: {msg.text}'))

        try:
            print("\n=== Step 1: Navigate to Tailor Resume page ===")
            page.goto('https://talorme.com/tailor', wait_until='networkidle')
            time.sleep(3)
            page.screenshot(path='tailor_1_page.png', full_page=True)

            user_id = page.evaluate('localStorage.getItem("talor_user_id")')
            print(f"User ID: {user_id}")

            # Check if there are base resumes uploaded
            print("\n=== Step 2: Checking for base resumes ===")
            resume_select = page.locator('select[name="baseResumeId"]').first

            if resume_select.count() == 0:
                print("No base resume selector found.")
                print("\nChecking if we need to upload a resume first...")

                upload_button = page.locator('text=Upload Resume')
                if upload_button.count() > 0:
                    print("Upload button found. Need to upload a base resume first.")
                    print("\nNavigating to upload page...")
                    page.goto('https://talorme.com/upload', wait_until='networkidle')
                    time.sleep(2)
                    page.screenshot(path='tailor_1b_upload.png', full_page=True)
                    print("\nPlease upload a resume first, then run this test again.")
                    browser.close()
                    return

            # Get available resumes
            options = resume_select.locator('option').all_inner_texts()
            print(f"Found {len(options)} resume option(s):")
            for opt in options:
                print(f"  - {opt}")

            if len(options) <= 1:  # Only "Select a resume" option
                print("\nNo base resumes available. Upload a resume first.")
                browser.close()
                return

            # Select first actual resume (skip "Select a resume" option)
            print("\n=== Step 3: Selecting base resume ===")
            resume_select.select_option(index=1)
            time.sleep(1)
            page.screenshot(path='tailor_2_resume_selected.png', full_page=True)

            # Enter job URL
            print("\n=== Step 4: Entering job URL ===")
            job_url_input = page.locator('input[placeholder*="job"]').or_(page.locator('input[type="url"]'))

            test_job_url = "https://www.linkedin.com/jobs/view/test-job-123"
            job_url_input.fill(test_job_url)
            print(f"Job URL: {test_job_url}")
            time.sleep(1)
            page.screenshot(path='tailor_3_job_entered.png', full_page=True)

            # Click Generate button
            print("\n=== Step 5: Clicking Generate Tailored Resume ===")
            generate_button = page.locator('button:has-text("Generate Tailored Resume")').or_(
                page.locator('button:has-text("Generate")')
            )

            if generate_button.count() == 0:
                print("Generate button not found!")
                print("Looking for any submit button...")
                generate_button = page.locator('button[type="submit"]').first

            print("Clicking generate button...")
            generate_button.click()

            print("\nWaiting for API call...")
            time.sleep(5)
            page.screenshot(path='tailor_4_after_click.png', full_page=True)

            # Check for error messages
            print("\n=== Step 6: Checking for errors ===")
            error_selectors = [
                'text=400',
                'text=Bad Request',
                'text=Error',
                'text=Failed',
                '[class*="error"]',
                '[class*="alert"]',
            ]

            for selector in error_selectors:
                if page.locator(selector).count() > 0:
                    error_text = page.locator(selector).first.inner_text()
                    print(f"Found error: {error_text}")

            # Wait a bit more to see if anything happens
            time.sleep(5)
            page.screenshot(path='tailor_5_final.png', full_page=True)

            print("\n=== API Calls Summary ===")
            tailor_calls = [call for call in api_calls if 'tailor' in call['url'].lower()]
            print(f"Found {len(tailor_calls)} tailor API call(s)")
            for call in tailor_calls:
                print(f"  {call['method']} {call['status']} {call['url']}")

            print("\n=== Analysis ===")
            if any(call['status'] == 400 for call in tailor_calls):
                print("FOUND 400 ERROR!")
                print("Check the API call details above for:")
                print("  1. Request body - what data was sent")
                print("  2. Response body - what error message came back")
                print("  3. Missing or invalid fields")
            elif any(call['status'] == 200 for call in tailor_calls):
                print("API call succeeded! Resume should be generating.")
            else:
                print("No tailor API call detected. Button might not have triggered the request.")

            print("\nScreenshots saved:")
            print("  - tailor_1_page.png")
            print("  - tailor_2_resume_selected.png")
            print("  - tailor_3_job_entered.png")
            print("  - tailor_4_after_click.png")
            print("  - tailor_5_final.png")

            print("\nBrowser will stay open for 30 seconds for inspection...")
            time.sleep(30)

        except Exception as e:
            print(f"\nError: {str(e)}")
            import traceback
            traceback.print_exc()
            page.screenshot(path='tailor_error.png', full_page=True)
        finally:
            browser.close()

if __name__ == "__main__":
    test_tailor_resume()
