"""
Test Strategy & Recent News section in Interview Prep
Debug why it's not showing data
"""

from playwright.sync_api import sync_playwright
import time
import json
import sys

def test_strategy_news():
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=False, slow_mo=1000)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        # Enable console logging
        page.on('console', lambda msg: print(f'CONSOLE: {msg.text}'))

        try:
            print("\n=== Step 1: Navigate to Interview Prep List ===")
            page.goto('https://talorme.com/interview-preps', wait_until='networkidle')
            time.sleep(2)
            page.screenshot(path='step1_list.png', full_page=True)

            # Check if there are any interview preps
            print("\n=== Checking for existing interview preps ===")
            prep_cards = page.locator('.glass').filter(has_text='View Interview Prep')

            if prep_cards.count() == 0:
                print("X No interview preps found.")
                print("Creating a test interview prep first...")

                # Navigate to tailor page
                page.goto('https://talorme.com/tailor', wait_until='networkidle')
                time.sleep(2)
                page.screenshot(path='step1b_tailor.png', full_page=True)

                # Check if there are tailored resumes
                view_buttons = page.locator('text=View Resume')
                if view_buttons.count() == 0:
                    print("X No tailored resumes found either.")
                    print("Please create a tailored resume first, then run this test again.")
                    browser.close()
                    return

                # Click first "Generate Interview Prep" button
                print("Looking for Generate Interview Prep button...")
                prep_button = page.locator('text=Generate Interview Prep').first
                if prep_button.count() > 0:
                    print("Clicking Generate Interview Prep...")
                    prep_button.click()
                    time.sleep(5)  # Wait for generation
                    page.screenshot(path='step1c_generating.png', full_page=True)

                    # Wait for completion and navigate
                    time.sleep(10)
                    page.screenshot(path='step1d_after_gen.png', full_page=True)
                else:
                    print("X No Generate Interview Prep button found")
                    browser.close()
                    return

            # Go back to list and find interview prep
            print("\n=== Step 2: Opening interview prep ===")
            page.goto('https://talorme.com/interview-preps', wait_until='networkidle')
            time.sleep(2)

            prep_cards = page.locator('.glass').filter(has_text='View Interview Prep')
            if prep_cards.count() == 0:
                print("X Still no interview preps after creation attempt")
                browser.close()
                return

            print(f"Found {prep_cards.count()} interview prep(s)")

            # Click the first one
            prep_cards.first.locator('text=View Interview Prep').click()
            page.wait_for_load_state('networkidle')
            time.sleep(3)
            page.screenshot(path='step2_prep_page.png', full_page=True)

            # Get current URL to extract ID
            current_url = page.url
            print(f"Current URL: {current_url}")
            prep_id = current_url.split('/')[-1]
            print(f"Interview Prep ID: {prep_id}")

            print("\n=== Step 3: Checking API response ===")

            # Get user ID from localStorage
            user_id = page.evaluate('localStorage.getItem("talor_user_id")')
            print(f"User ID: {user_id}")

            # Fetch interview prep data directly from API
            api_url = f'https://resume-ai-backend-production-3134.up.railway.app/api/interview-prep/{prep_id}'
            print(f"Fetching: {api_url}")

            response = page.request.get(api_url, headers={
                'X-User-ID': user_id
            })

            if response.status == 200:
                data = response.json()
                print(f"API Response: {response.status} OK")

                prep_data = data.get('prep_data', {})

                print("\n=== Keys in prep_data ===")
                for key in prep_data.keys():
                    print(f"  - {key}")

                # Check strategy_and_news
                if 'strategy_and_news' in prep_data:
                    strategy_news = prep_data['strategy_and_news']
                    print("\n=== strategy_and_news found ===")

                    if isinstance(strategy_news, dict):
                        recent_events = strategy_news.get('recent_events', [])
                        strategic_themes = strategy_news.get('strategic_themes', [])

                        print(f"recent_events: {len(recent_events)} items")
                        print(f"strategic_themes: {len(strategic_themes)} items")

                        if len(recent_events) == 0:
                            print("\nPROBLEM: recent_events is EMPTY!")
                        else:
                            print("\nrecent_events content:")
                            for i, event in enumerate(recent_events, 1):
                                print(f"  {i}. {event.get('title', 'No title')} ({event.get('date', 'No date')})")

                        if len(strategic_themes) == 0:
                            print("\nPROBLEM: strategic_themes is EMPTY!")
                        else:
                            print("\nstrategic_themes content:")
                            for i, theme in enumerate(strategic_themes, 1):
                                print(f"  {i}. {theme.get('theme', 'No theme')}")

                        # Save to file for inspection
                        with open('strategy_news_data.json', 'w') as f:
                            json.dump(strategy_news, f, indent=2)
                        print("\nData saved to: strategy_news_data.json")

                    else:
                        print(f"\nPROBLEM: strategy_and_news is not a dict, it's: {type(strategy_news)}")
                else:
                    print("\nPROBLEM: strategy_and_news key MISSING!")

                # Also check values_and_culture
                if 'values_and_culture' in prep_data:
                    values = prep_data['values_and_culture']
                    if isinstance(values, dict):
                        stated_values = values.get('stated_values', [])
                        print(f"\nvalues_and_culture.stated_values: {len(stated_values)} items")
                        if len(stated_values) == 0:
                            print("PROBLEM: stated_values is EMPTY!")
                else:
                    print("\nPROBLEM: values_and_culture key MISSING!")

                # Save full response
                with open('full_prep_data.json', 'w') as f:
                    json.dump(prep_data, f, indent=2)
                print("\nFull prep data saved to: full_prep_data.json")

            else:
                print(f"API Error: {response.status}")
                print(f"Response: {response.text()}")

            print("\n=== Step 4: Checking page rendering ===")

            # Look for Strategy section
            if page.locator('text=Strategy & Recent News').count() > 0:
                print("Strategy & Recent News section EXISTS on page")
            else:
                print("Strategy & Recent News section NOT FOUND on page")

            # Check for empty state messages
            if page.locator('text=No recent events').count() > 0:
                print("Found: 'No recent events' message")
            if page.locator('text=No strategic themes').count() > 0:
                print("Found: 'No strategic themes' message")

            page.screenshot(path='step4_final.png', full_page=True)

            print("\n=== RESULTS ===")
            print("Screenshots saved:")
            print("  - step2_prep_page.png (Interview prep page)")
            print("  - step4_final.png (Final state)")
            print("\nData files saved:")
            print("  - strategy_news_data.json (Strategy & news data)")
            print("  - full_prep_data.json (Complete prep data)")
            print("\nCheck these files to see what data the API returned.")

        except Exception as e:
            print(f"\nError: {str(e)}")
            import traceback
            traceback.print_exc()
            page.screenshot(path='error.png', full_page=True)

        finally:
            print("\n=== Press Enter to close browser ===")
            try:
                input()
            except:
                time.sleep(5)
            browser.close()

if __name__ == "__main__":
    test_strategy_news()
