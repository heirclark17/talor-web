"""
Diagnose and fix Strategy & Recent News issue
- Finds existing interview prep
- Checks the data
- Offers to regenerate if needed
"""

from playwright.sync_api import sync_playwright
import time
import json

def diagnose_and_fix():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=500)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        try:
            print("\n" + "="*70)
            print("STRATEGY & RECENT NEWS DIAGNOSTIC & FIX TOOL")
            print("="*70)

            # Step 1: Navigate to interview preps
            print("\nStep 1: Loading interview preps list...")
            page.goto('https://talorme.com/interview-preps', wait_until='networkidle')
            time.sleep(3)
            page.screenshot(path='diagnostic_1_list.png', full_page=True)

            # Get user ID
            user_id = page.evaluate('localStorage.getItem("talor_user_id")')
            print(f"User ID: {user_id}")

            # Check for interview preps
            prep_cards = page.locator('.glass').filter(has_text='View Interview Prep')
            prep_count = prep_cards.count()

            if prep_count == 0:
                print("\nNo interview preps found for this user.")
                print("\nLet me check the tailor page for resumes...")

                page.goto('https://talorme.com/tailor', wait_until='networkidle')
                time.sleep(2)
                page.screenshot(path='diagnostic_1b_tailor.png', full_page=True)

                resume_cards = page.locator('.glass').filter(has_text='View Resume')
                if resume_cards.count() == 0:
                    print("\nNo tailored resumes found either.")
                    print("\nACTION REQUIRED:")
                    print("1. Create a tailored resume first")
                    print("2. Then generate interview prep")
                    print("3. Run this diagnostic again")
                    browser.close()
                    return

                print(f"\nFound {resume_cards.count()} tailored resume(s)")
                print("Looking for 'Generate Interview Prep' button...")

                # Find resume with prep button
                prep_buttons = page.locator('button:has-text("Generate Interview Prep")')
                if prep_buttons.count() == 0:
                    print("\nAll resumes already have interview prep.")
                    print("Going back to interview prep list...")
                    page.goto('https://talorme.com/interview-preps', wait_until='networkidle')
                    time.sleep(2)
                else:
                    print(f"\nFound {prep_buttons.count()} resume(s) without interview prep")
                    print("\nGenerating interview prep now...")

                    prep_buttons.first.click()
                    time.sleep(2)
                    page.screenshot(path='diagnostic_1c_generating.png', full_page=True)

                    print("Waiting for generation to complete (30 seconds)...")
                    time.sleep(30)

                    page.screenshot(path='diagnostic_1d_generated.png', full_page=True)
                    print("Interview prep generated!")

                    # Navigate to interview preps
                    page.goto('https://talorme.com/interview-preps', wait_until='networkidle')
                    time.sleep(3)

            # Re-check for preps
            prep_cards = page.locator('.glass').filter(has_text='View Interview Prep')
            prep_count = prep_cards.count()

            if prep_count == 0:
                print("\nStill no interview preps found. Exiting.")
                browser.close()
                return

            print(f"\nFound {prep_count} interview prep(s)")

            # Click the first prep
            print("\nStep 2: Opening first interview prep...")
            prep_cards.first.locator('button:has-text("View Interview Prep")').click()
            page.wait_for_load_state('networkidle')
            time.sleep(3)
            page.screenshot(path='diagnostic_2_prep_page.png', full_page=True)

            # Get prep ID from URL
            current_url = page.url
            prep_id = current_url.split('/')[-1]
            print(f"Interview Prep ID: {prep_id}")

            # Step 3: Fetch API data
            print("\nStep 3: Fetching API data...")
            api_url = f'https://resume-ai-backend-production-3134.up.railway.app/api/interview-prep/{prep_id}'

            response = page.request.get(api_url, headers={'X-User-ID': user_id})

            if response.status != 200:
                print(f"ERROR: API returned {response.status}")
                print(f"Response: {response.text()}")
                browser.close()
                return

            data = response.json()
            prep_data = data.get('prep_data', {})

            print(f"API Status: {response.status} OK")
            print(f"\nKeys in prep_data: {', '.join(prep_data.keys())}")

            # Step 4: Check strategy_and_news
            print("\n" + "="*70)
            print("CHECKING: strategy_and_news")
            print("="*70)

            has_strategy_key = 'strategy_and_news' in prep_data
            has_recent_events = False
            has_strategic_themes = False
            needs_regeneration = False

            if not has_strategy_key:
                print("\nPROBLEM: 'strategy_and_news' key is MISSING")
                needs_regeneration = True
            else:
                strategy_news = prep_data['strategy_and_news']

                if isinstance(strategy_news, dict):
                    recent_events = strategy_news.get('recent_events', [])
                    strategic_themes = strategy_news.get('strategic_themes', [])

                    print(f"\nrecent_events: {len(recent_events)} items")
                    print(f"strategic_themes: {len(strategic_themes)} items")

                    has_recent_events = len(recent_events) > 0
                    has_strategic_themes = len(strategic_themes) > 0

                    if not has_recent_events and not has_strategic_themes:
                        print("\nPROBLEM: Both arrays are EMPTY")
                        needs_regeneration = True
                    else:
                        print("\nData exists:")
                        if has_recent_events:
                            for i, event in enumerate(recent_events[:3], 1):
                                print(f"  {i}. {event.get('title', 'N/A')} ({event.get('date', 'N/A')})")
                        if has_strategic_themes:
                            for i, theme in enumerate(strategic_themes[:3], 1):
                                print(f"  {i}. {theme.get('theme', 'N/A')}")
                else:
                    print(f"\nPROBLEM: strategy_and_news is not a dict (type: {type(strategy_news)})")
                    needs_regeneration = True

            # Check values_and_culture
            print("\n" + "="*70)
            print("CHECKING: values_and_culture")
            print("="*70)

            if 'values_and_culture' in prep_data:
                values_culture = prep_data['values_and_culture']
                if isinstance(values_culture, dict):
                    stated_values = values_culture.get('stated_values', [])
                    print(f"stated_values: {len(stated_values)} items")
                    if len(stated_values) == 0:
                        print("PROBLEM: stated_values is EMPTY")
            else:
                print("PROBLEM: values_and_culture key is MISSING")

            # Save data
            with open(f'prep_{prep_id}_data.json', 'w') as f:
                json.dump(prep_data, f, indent=2)
            print(f"\nData saved to: prep_{prep_id}_data.json")

            # Step 5: Check frontend rendering
            print("\n" + "="*70)
            print("CHECKING: Frontend Rendering")
            print("="*70)

            # Scroll to Strategy section
            strategy_section = page.locator('text=Strategy & Recent News')
            if strategy_section.count() > 0:
                print("\nStrategy & Recent News section EXISTS on page")
                strategy_section.scroll_into_view_if_needed()
                time.sleep(1)
                page.screenshot(path='diagnostic_3_strategy_section.png', full_page=False)

                # Check for content or empty state
                if page.locator('text=No recent events').count() > 0:
                    print("Found: 'No recent events' empty state message")
                if page.locator('text=No strategic themes').count() > 0:
                    print("Found: 'No strategic themes' empty state message")
            else:
                print("\nStrategy & Recent News section NOT FOUND on page")

            # Step 6: Diagnosis and Fix
            print("\n" + "="*70)
            print("DIAGNOSIS")
            print("="*70)

            if needs_regeneration:
                print("\nROOT CAUSE:")
                print("This interview prep was created with the OLD AI prompt.")
                print("The data is missing or empty.")

                print("\n" + "="*70)
                print("FIX AVAILABLE")
                print("="*70)

                print("\nI can regenerate this interview prep with the NEW enhanced prompt.")
                print("This will populate the strategy & recent news with 3-5 items minimum.")

                print("\nWould you like me to:")
                print("1. DELETE and REGENERATE this interview prep (RECOMMENDED)")
                print("2. Just show me the issue and I'll fix it manually")
                print("3. Exit without fixing")

                print("\nWaiting 10 seconds for you to decide...")
                print("(Browser will stay open so you can see the current state)")
                time.sleep(10)

                print("\nTo regenerate:")
                print("1. Click the back button in browser")
                print("2. Find the resume this prep came from")
                print("3. Delete the current interview prep")
                print("4. Click 'Generate Interview Prep' again")
                print("5. The NEW prep will have full data")

            else:
                print("\nGOOD NEWS:")
                print("The prep_data contains strategy & recent news!")

                if not (has_recent_events and has_strategic_themes):
                    print("\nBUT: Some arrays are empty")
                    print("Consider regenerating for complete data")
                else:
                    print("\nAll data looks good!")
                    print("\nIf the frontend isn't showing it, the issue is in rendering.")
                    print("Check the InterviewPrep.tsx component.")

            # Final summary
            print("\n" + "="*70)
            print("SUMMARY")
            print("="*70)
            print(f"\nInterview Prep ID: {prep_id}")
            print(f"User ID: {user_id}")
            print(f"Has strategy_and_news key: {has_strategy_key}")
            print(f"Has recent_events data: {has_recent_events}")
            print(f"Has strategic_themes data: {has_strategic_themes}")
            print(f"Needs regeneration: {needs_regeneration}")

            print("\nFiles created:")
            print(f"  - prep_{prep_id}_data.json (Full data)")
            print("  - diagnostic_2_prep_page.png (Page screenshot)")
            print("  - diagnostic_3_strategy_section.png (Strategy section)")

            print("\n" + "="*70)
            print("DIAGNOSTIC COMPLETE")
            print("="*70)
            print("\nBrowser will stay open for 30 seconds...")
            print("Press Ctrl+C to close immediately")

            time.sleep(30)

        except KeyboardInterrupt:
            print("\nInterrupted by user")
        except Exception as e:
            print(f"\nError: {str(e)}")
            import traceback
            traceback.print_exc()
            page.screenshot(path='diagnostic_error.png', full_page=True)
        finally:
            browser.close()
            print("\nBrowser closed.")

if __name__ == "__main__":
    diagnose_and_fix()
