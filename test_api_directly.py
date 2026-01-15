"""
Direct API test - fetch an existing interview prep and check strategy & news data
"""

import requests
import json

# API base URL
API_URL = "https://resume-ai-backend-production-3134.up.railway.app"

# Test user ID (you can change this to your actual user ID)
USER_ID = "test_user_debug"

print("=== Direct API Test for Strategy & Recent News ===\n")

# Step 1: Get list of interview preps
print("Step 1: Fetching interview prep list...")
response = requests.get(
    f"{API_URL}/api/interview-prep/list",
    headers={"X-User-ID": USER_ID}
)

if response.status_code != 200:
    print(f"Error fetching list: {response.status_code}")
    print(f"Response: {response.text}")
    print("\nTry with a different USER_ID or create an interview prep first.")
    exit(1)

response_data = response.json()
print(f"Status: {response.status_code}")

# Handle response structure
if isinstance(response_data, dict):
    interview_preps = response_data.get('interview_preps', response_data.get('preps', []))
elif isinstance(response_data, list):
    interview_preps = response_data
else:
    print(f"Unexpected response type: {type(response_data)}")
    print(f"Response: {response_data}")
    exit(1)

print(f"Found {len(interview_preps)} interview prep(s)\n")

if len(interview_preps) == 0:
    print("No interview preps found for this user.")
    print("Options:")
    print("1. Change USER_ID in this script to your actual user ID")
    print("2. Or manually provide an interview prep ID to test")
    print("\nEnter an interview prep ID to test (or press Enter to exit):")
    manual_id = input().strip()
    if not manual_id:
        exit(0)
    prep_id = int(manual_id)
else:
    # Use the first interview prep
    prep_id = interview_preps[0]['id']
    print(f"Testing with interview prep ID: {prep_id}")
    print(f"Company: {interview_preps[0].get('company_name', 'Unknown')}")
    print(f"Job: {interview_preps[0].get('job_title', 'Unknown')}\n")

# Step 2: Fetch the specific interview prep
print(f"Step 2: Fetching interview prep {prep_id}...")
response = requests.get(
    f"{API_URL}/api/interview-prep/{prep_id}",
    headers={"X-User-ID": USER_ID}
)

if response.status_code != 200:
    print(f"Error: {response.status_code}")
    print(f"Response: {response.text}")
    exit(1)

data = response.json()
prep_data = data.get('prep_data', {})

print(f"Status: {response.status_code}")
print(f"\nKeys in prep_data:")
for key in prep_data.keys():
    print(f"  - {key}")

# Step 3: Check strategy_and_news
print("\n" + "="*60)
print("CHECKING: strategy_and_news")
print("="*60)

if 'strategy_and_news' not in prep_data:
    print("ERROR: strategy_and_news key is MISSING from prep_data!")
    print("\nThis is the problem - the AI didn't generate this section.")
    print("Prep data needs to be regenerated with the updated AI prompt.")
else:
    strategy_news = prep_data['strategy_and_news']
    print(f"Type: {type(strategy_news)}")

    if not isinstance(strategy_news, dict):
        print(f"ERROR: strategy_and_news is not a dict! It's: {type(strategy_news)}")
    else:
        recent_events = strategy_news.get('recent_events', [])
        strategic_themes = strategy_news.get('strategic_themes', [])

        print(f"\nrecent_events: {len(recent_events)} items")
        print(f"strategic_themes: {len(strategic_themes)} items")

        if len(recent_events) == 0 and len(strategic_themes) == 0:
            print("\nPROBLEM FOUND!")
            print("Both recent_events and strategic_themes are EMPTY arrays.")
            print("This is why the section doesn't show on the frontend.")
            print("\nThe AI is generating the structure but not populating it.")
            print("The updated prompt should force it to populate these arrays.")
        else:
            print("\nData exists! Content:")

        if len(recent_events) > 0:
            print("\nRecent Events:")
            for i, event in enumerate(recent_events, 1):
                print(f"\n  {i}. {event.get('title', 'No title')}")
                print(f"     Date: {event.get('date', 'No date')}")
                print(f"     Impact: {event.get('impact_summary', 'No summary')[:100]}...")
        else:
            print("\nRecent Events: EMPTY")

        if len(strategic_themes) > 0:
            print("\nStrategic Themes:")
            for i, theme in enumerate(strategic_themes, 1):
                print(f"\n  {i}. {theme.get('theme', 'No theme')}")
                print(f"     Rationale: {theme.get('rationale', 'No rationale')[:100]}...")
        else:
            print("\nStrategic Themes: EMPTY")

# Step 4: Check values_and_culture
print("\n" + "="*60)
print("CHECKING: values_and_culture")
print("="*60)

if 'values_and_culture' not in prep_data:
    print("ERROR: values_and_culture key is MISSING!")
else:
    values_culture = prep_data['values_and_culture']
    if isinstance(values_culture, dict):
        stated_values = values_culture.get('stated_values', [])
        print(f"stated_values: {len(stated_values)} items")

        if len(stated_values) == 0:
            print("PROBLEM: stated_values is EMPTY")
        else:
            print("\nStated Values:")
            for i, value in enumerate(stated_values[:3], 1):
                print(f"  {i}. {value.get('name', 'No name')}")
    else:
        print(f"ERROR: values_and_culture is not a dict! It's: {type(values_culture)}")

# Step 5: Save full data
print("\n" + "="*60)
print("Saving data to files...")
print("="*60)

with open('strategy_and_news.json', 'w') as f:
    if 'strategy_and_news' in prep_data:
        json.dump(prep_data['strategy_and_news'], f, indent=2)
        print("strategy_and_news.json created")
    else:
        f.write('{"error": "strategy_and_news key missing"}')
        print("strategy_and_news.json created (with error)")

with open('full_prep_data.json', 'w') as f:
    json.dump(prep_data, f, indent=2)
    print("full_prep_data.json created")

print("\n" + "="*60)
print("DIAGNOSIS COMPLETE")
print("="*60)

if 'strategy_and_news' in prep_data:
    strategy_news = prep_data['strategy_and_news']
    if isinstance(strategy_news, dict):
        recent_events = strategy_news.get('recent_events', [])
        strategic_themes = strategy_news.get('strategic_themes', [])

        if len(recent_events) == 0 and len(strategic_themes) == 0:
            print("\nROOT CAUSE:")
            print("The strategy_and_news section exists but arrays are empty.")
            print("\nSOLUTION:")
            print("1. The updated AI prompt (commit 02c1af6) should fix this")
            print("2. But existing interview preps were created with OLD prompt")
            print("3. You need to DELETE this interview prep and REGENERATE it")
            print(f"4. Or use the API to regenerate prep ID {prep_id}")
            print("\nTo regenerate:")
            print(f"POST {API_URL}/api/interview-prep/generate/{{tailored_resume_id}}")
        else:
            print("\nGOOD NEWS:")
            print("Data exists! The section should be showing on frontend.")
            print("If it's not showing, check the frontend rendering logic.")
else:
    print("\nROOT CAUSE:")
    print("The strategy_and_news key is completely missing.")
    print("This prep was created with an old version of the AI.")
    print("\nSOLUTION:")
    print("Delete and regenerate this interview prep.")

print("\nFiles created:")
print("- strategy_and_news.json")
print("- full_prep_data.json")
print("\nCheck these files for the actual data structure.")
