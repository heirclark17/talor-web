"""
Test Strategy & Recent News section in Interview Prep
Debug why it's not showing data
"""

from playwright.sync_api import sync_playwright, expect
import time
import json

def test_strategy_news():
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=False, slow_mo=1000)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        # Enable console logging
        page.on('console', lambda msg: print(f'CONSOLE: {msg.text}'))
        page.on('response', lambda response: print(f'API: {response.status} {response.url}'))

        try:
            print("\n=== Step 1: Navigate to Interview Prep List ===")
            page.goto('https://talorme.com/interview-preps', wait_until='networkidle')
            time.sleep(2)
            page.screenshot(path='step1_interview_preps_list.png', full_page=True)

            # Check if there are any interview preps
            print("\n=== Checking for existing interview preps ===")
            prep_cards = page.locator('.glass').filter(has_text='View Interview Prep')

            if prep_cards.count() == 0:
                print("❌ No interview preps found. Need to create one first.")
                print("Navigate to /tailor and create a resume with interview prep")
                browser.close()
                return

            print(f"✓ Found {prep_cards.count()} interview prep(s)")

            # Click the first one
            print("\n=== Step 2: Opening first interview prep ===")
            prep_cards.first.locator('text=View Interview Prep').click()
            page.wait_for_load_state('networkidle')
            time.sleep(3)
            page.screenshot(path='step2_interview_prep_page.png', full_page=True)

            # Check current URL
            current_url = page.url
            print(f"Current URL: {current_url}")

            # Extract interview prep ID from URL
            prep_id = current_url.split('/')[-1]
            print(f"Interview Prep ID: {prep_id}")

            print("\n=== Step 3: Looking for Strategy & Recent News section ===")

            # Try to find the section by different selectors
            selectors_to_try = [
                'text=Strategy & Recent News',
                'h3:has-text("Strategy & Recent News")',
                'h2:has-text("Strategy & Recent News")',
                '.text-2xl:has-text("Strategy")',
                '*[class*="strategy"]',
            ]

            strategy_section = None
            for selector in selectors_to_try:
                try:
                    element = page.locator(selector).first
                    if element.count() > 0:
                        print(f"✓ Found section with selector: {selector}")
                        strategy_section = element
                        break
                except:
                    continue

            if not strategy_section:
                print("❌ Strategy & Recent News section NOT FOUND with any selector")
                print("\n=== Page text content ===")
                page_text = page.locator('body').inner_text()
                if 'strategy' in page_text.lower():
                    print("'strategy' found in page text (case insensitive)")
                else:
                    print("'strategy' NOT found in page text")

                if 'recent' in page_text.lower():
                    print("'recent' found in page text (case insensitive)")
                else:
                    print("'recent' NOT found in page text")
            else:
                print("✓ Strategy & Recent News section found!")

            print("\n=== Step 4: Checking API response data ===")

            # Fetch interview prep data directly from API
            api_url = f'https://resume-ai-backend-production-3134.up.railway.app/api/interview-prep/{prep_id}'
            print(f"Fetching: {api_url}")

            # Use page.request to make API call with same session
            response = page.request.get(api_url, headers={
                'X-User-ID': page.evaluate('localStorage.getItem("talor_user_id")')
            })

            if response.status == 200:
                data = response.json()
                print(f"✓ API Response: {response.status}")

                # Check prep_data structure
                prep_data = data.get('prep_data', {})

                print("\n=== Checking prep_data structure ===")
                print(f"Keys in prep_data: {list(prep_data.keys())}")

                # Check strategy_and_news
                if 'strategy_and_news' in prep_data:
                    strategy_news = prep_data['strategy_and_news']
                    print("\n✓ strategy_and_news exists in data")
                    print(f"Type: {type(strategy_news)}")
                    print(f"Keys: {list(strategy_news.keys()) if isinstance(strategy_news, dict) else 'Not a dict'}")

                    if isinstance(strategy_news, dict):
                        recent_events = strategy_news.get('recent_events', [])
                        strategic_themes = strategy_news.get('strategic_themes', [])

                        print(f"\nrecent_events count: {len(recent_events)}")
                        print(f"strategic_themes count: {len(strategic_themes)}")

                        if len(recent_events) == 0 and len(strategic_themes) == 0:
                            print("\n❌ PROBLEM FOUND: Both arrays are EMPTY")
                            print("This is why the section isn't showing!")
                        else:
                            print("\n✓ Data exists:")
                            print(f"Recent Events: {json.dumps(recent_events, indent=2)}")
                            print(f"Strategic Themes: {json.dumps(strategic_themes, indent=2)}")
                else:
                    print("\n❌ PROBLEM FOUND: strategy_and_news key MISSING from prep_data")

                # Check values_and_culture too
                if 'values_and_culture' in prep_data:
                    values_culture = prep_data['values_and_culture']
                    print("\n✓ values_and_culture exists")
                    if isinstance(values_culture, dict):
                        stated_values = values_culture.get('stated_values', [])
                        print(f"stated_values count: {len(stated_values)}")
                        if len(stated_values) == 0:
                            print("❌ stated_values is EMPTY")
                        else:
                            print(f"✓ stated_values: {len(stated_values)} items")
                else:
                    print("\n❌ values_and_culture key MISSING")

                # Save full response for inspection
                with open('interview_prep_response.json', 'w') as f:
                    json.dump(prep_data, f, indent=2)
                print("\n✓ Full prep_data saved to interview_prep_response.json")

            else:
                print(f"❌ API Error: {response.status}")
                print(f"Response: {response.text()}")

            print("\n=== Step 5: Checking frontend rendering ===")

            # Check if empty state message is shown
            empty_messages = [
                'No recent events available',
                'No strategic themes available',
                'No recent news',
                'Coming soon',
            ]

            for msg in empty_messages:
                if page.locator(f'text={msg}').count() > 0:
                    print(f"Found empty state message: '{msg}'")

            print("\n=== Step 6: Final screenshot ===")
            page.screenshot(path='step6_final_state.png', full_page=True)

            print("\n=== SUMMARY ===")
            print("Check the following:")
            print("1. interview_prep_response.json - Full API response")
            print("2. step2_interview_prep_page.png - Full page screenshot")
            print("3. step6_final_state.png - Final state")
            print("\nIf strategy_and_news arrays are empty, the AI needs to regenerate the prep.")

        except Exception as e:
            print(f"\n❌ Error: {str(e)}")
            import traceback
            traceback.print_exc()
            page.screenshot(path='error_state.png', full_page=True)

        finally:
            print("\n=== Test complete. Browser will stay open for inspection ===")
            input("Press Enter to close browser...")
            browser.close()

if __name__ == "__main__":
    test_strategy_news()
