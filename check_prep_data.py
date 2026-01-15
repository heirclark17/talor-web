"""
Check interview prep data for a specific prep ID
Usage: python check_prep_data.py [prep_id]
"""

import requests
import json
import sys

API_URL = "https://resume-ai-backend-production-3134.up.railway.app"

# Get prep ID from command line or use default
if len(sys.argv) > 1:
    prep_id = sys.argv[1]
else:
    print("Usage: python check_prep_data.py <prep_id>")
    print("\nOr enter prep ID now:")
    prep_id = input("> ").strip()
    if not prep_id:
        print("No prep ID provided. Exiting.")
        exit(0)

print(f"\n=== Checking Interview Prep ID: {prep_id} ===\n")

# Fetch the interview prep (no user ID needed for GET)
response = requests.get(f"{API_URL}/api/interview-prep/{prep_id}")

if response.status_code == 404:
    print(f"Interview prep {prep_id} not found.")
    print("Make sure the ID is correct and the prep exists.")
    exit(1)

if response.status_code != 200:
    print(f"Error: {response.status_code}")
    print(f"Response: {response.text}")
    exit(1)

print(f"Status: {response.status_code} OK\n")

data = response.json()
prep_data = data.get('prep_data', {})

print("=== Top-level keys in prep_data ===")
for key in prep_data.keys():
    print(f"  {key}")

# Check strategy_and_news
print("\n" + "="*70)
print("STRATEGY & RECENT NEWS ANALYSIS")
print("="*70)

if 'strategy_and_news' not in prep_data:
    print("\nPROBLEM: 'strategy_and_news' key is MISSING!")
    print("\nThis interview prep was created before the enhancement.")
    print("Solution: Delete and regenerate this interview prep.")
    exit(0)

strategy_news = prep_data['strategy_and_news']

if not isinstance(strategy_news, dict):
    print(f"\nPROBLEM: strategy_and_news is not a dict! Type: {type(strategy_news)}")
    exit(0)

recent_events = strategy_news.get('recent_events', [])
strategic_themes = strategy_news.get('strategic_themes', [])

print(f"\nrecent_events: {len(recent_events)} items")
print(f"strategic_themes: {len(strategic_themes)} items")

if len(recent_events) == 0 and len(strategic_themes) == 0:
    print("\n" + "!"*70)
    print("PROBLEM IDENTIFIED!")
    print("!"*70)
    print("\nBoth recent_events and strategic_themes arrays are EMPTY.")
    print("This is why the section doesn't show on the frontend.")
    print("\nCauses:")
    print("1. Interview prep created with old AI prompt (before commit 02c1af6)")
    print("2. AI didn't extract/infer company data")
    print("3. Company research data was insufficient")
    print("\nSolution:")
    print("DELETE this interview prep and REGENERATE it with the new prompt.")
else:
    print("\nData exists:")

if len(recent_events) > 0:
    print("\n--- Recent Events ---")
    for i, event in enumerate(recent_events, 1):
        title = event.get('title', 'No title')
        date = event.get('date', 'No date')
        impact = event.get('impact_summary', 'No summary')
        print(f"\n{i}. {title}")
        print(f"   Date: {date}")
        print(f"   Impact: {impact[:150]}{'...' if len(impact) > 150 else ''}")
else:
    print("\nRecent Events: EMPTY ARRAY []")

if len(strategic_themes) > 0:
    print("\n--- Strategic Themes ---")
    for i, theme in enumerate(strategic_themes, 1):
        theme_name = theme.get('theme', 'No theme')
        rationale = theme.get('rationale', 'No rationale')
        print(f"\n{i}. {theme_name}")
        print(f"   Rationale: {rationale[:150]}{'...' if len(rationale) > 150 else ''}")
else:
    print("\nStrategic Themes: EMPTY ARRAY []")

# Check values_and_culture
print("\n" + "="*70)
print("VALUES & CULTURE ANALYSIS")
print("="*70)

if 'values_and_culture' in prep_data:
    values_culture = prep_data['values_and_culture']
    if isinstance(values_culture, dict):
        stated_values = values_culture.get('stated_values', [])
        print(f"\nstated_values: {len(stated_values)} items")

        if len(stated_values) == 0:
            print("PROBLEM: stated_values is EMPTY")
        else:
            print("\n--- Stated Values ---")
            for i, value in enumerate(stated_values[:5], 1):
                name = value.get('name', 'No name')
                snippet = value.get('source_snippet', 'No snippet')
                print(f"\n{i}. {name}")
                if snippet != 'No snippet':
                    print(f"   Source: {snippet[:100]}...")
    else:
        print(f"\nPROBLEM: values_and_culture is not a dict! Type: {type(values_culture)}")
else:
    print("\nPROBLEM: values_and_culture key is MISSING!")

# Save data files
print("\n" + "="*70)
print("SAVING DATA TO FILES")
print("="*70)

with open(f'prep_{prep_id}_strategy_news.json', 'w') as f:
    json.dump(strategy_news, f, indent=2)
print(f"✓ prep_{prep_id}_strategy_news.json")

with open(f'prep_{prep_id}_full_data.json', 'w') as f:
    json.dump(prep_data, f, indent=2)
print(f"✓ prep_{prep_id}_full_data.json")

# Summary
print("\n" + "="*70)
print("SUMMARY")
print("="*70)

has_recent_events = len(recent_events) > 0
has_strategic_themes = len(strategic_themes) > 0
has_values = False

if 'values_and_culture' in prep_data:
    values_culture = prep_data['values_and_culture']
    if isinstance(values_culture, dict):
        stated_values = values_culture.get('stated_values', [])
        has_values = len(stated_values) > 0

if has_recent_events and has_strategic_themes and has_values:
    print("\n✓ ALL SECTIONS POPULATED")
    print("The interview prep has complete data.")
    print("If the frontend isn't showing it, check rendering logic.")
elif has_recent_events or has_strategic_themes or has_values:
    print("\n△ PARTIALLY POPULATED")
    print("Some sections have data, others don't.")
    print("Consider regenerating for complete coverage.")
else:
    print("\n✗ NO DATA IN KEY SECTIONS")
    print("This interview prep needs to be regenerated.")
    print("\nSteps to fix:")
    print("1. Go to talorme.com")
    print("2. Find this interview prep")
    print("3. Delete it")
    print("4. Regenerate from the tailored resume")
    print("5. The new version will use the enhanced AI prompt")

print(f"\nCheck the saved JSON files for full details.")
