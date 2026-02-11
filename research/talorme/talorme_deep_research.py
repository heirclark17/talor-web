"""
Deep research script to understand TalorMe.com UX flow - Tailor page and comparison view.
"""

from playwright.sync_api import sync_playwright
import os
import time
import sys

# Fix encoding for Windows console
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Create screenshots directory
SCREENSHOT_DIR = r"C:\Users\derri\talorme_screenshots"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

def deep_research_talorme():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()

        print("=" * 60)
        print("DEEP RESEARCH: TALORME.COM TAILOR PAGE")
        print("=" * 60)

        # Step 1: Go directly to Tailor page
        print("\n[1] Navigating to Tailor page...")
        page.goto("https://talorme.com/tailor", wait_until="networkidle", timeout=60000)
        time.sleep(2)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "10_tailor_page.png"), full_page=True)
        print(f"    URL: {page.url}")
        print(f"    Page title: {page.title()}")

        # Step 2: Analyze Tailor page structure
        print("\n[2] Analyzing Tailor page structure...")

        # Look for text on the page
        page_text = page.inner_text("body")
        print(f"\n    Page content:\n{page_text[:1500]}")

        # Save full page HTML
        page_html = page.content()
        with open(os.path.join(SCREENSHOT_DIR, "tailor_page_full.html"), "w", encoding="utf-8") as f:
            f.write(page_html)
        print("\n    Saved full HTML to tailor_page_full.html")

        # Look for form inputs on the Tailor page
        print("\n[3] Looking for form elements on Tailor page...")

        # Job URL input
        job_url_inputs = page.locator("input[placeholder*='job'], input[placeholder*='URL'], input[placeholder*='url'], input[type='url']").all()
        print(f"    Job URL inputs: {len(job_url_inputs)}")
        for inp in job_url_inputs:
            try:
                placeholder = inp.get_attribute("placeholder")
                print(f"      - Placeholder: {placeholder}")
            except:
                pass

        # Textarea for job description
        textareas = page.locator("textarea").all()
        print(f"    Textareas: {len(textareas)}")
        for ta in textareas:
            try:
                placeholder = ta.get_attribute("placeholder")
                print(f"      - Placeholder: {placeholder}")
            except:
                pass

        # File inputs
        file_inputs = page.locator("input[type='file']").all()
        print(f"    File inputs: {len(file_inputs)}")

        # All text inputs
        all_inputs = page.locator("input").all()
        print(f"    All inputs: {len(all_inputs)}")
        for inp in all_inputs[:10]:
            try:
                inp_type = inp.get_attribute("type")
                placeholder = inp.get_attribute("placeholder") or ""
                name = inp.get_attribute("name") or ""
                print(f"      - type: {inp_type}, placeholder: {placeholder}, name: {name}")
            except:
                pass

        # Step 3: Look for buttons
        print("\n[4] Looking for buttons...")
        buttons = page.locator("button").all()
        print(f"    Found {len(buttons)} buttons")
        for btn in buttons:
            try:
                text = btn.inner_text().strip()
                disabled = btn.get_attribute("disabled")
                print(f"      - '{text}' (disabled: {disabled})")
            except:
                pass

        # Step 4: Look for resume selection/preview area
        print("\n[5] Looking for resume selection area...")
        resume_areas = page.locator("[class*='resume'], [class*='Resume'], [class*='preview'], [class*='Preview']").all()
        print(f"    Resume-related elements: {len(resume_areas)}")

        # Step 5: Capture the main form/card area
        print("\n[6] Looking for main content cards...")
        cards = page.locator("[class*='card'], [class*='Card'], .glass, [class*='panel'], [class*='Panel']").all()
        print(f"    Card elements: {len(cards)}")

        # Step 6: Check what happens when we try to view the comparison flow
        print("\n[7] Looking for comparison-related UI elements...")

        # Check for tabs or toggle between original/tailored
        toggle_elements = page.locator("[class*='toggle'], [class*='switch'], [class*='tab']").all()
        print(f"    Toggle/switch/tab elements: {len(toggle_elements)}")
        for el in toggle_elements[:5]:
            try:
                text = el.inner_text().strip()
                if text:
                    print(f"      - '{text}'")
            except:
                pass

        # Look for specific comparison words
        comparison_text = page.locator(":text('Original'), :text('Tailored'), :text('Before'), :text('After'), :text('Compare')").all()
        print(f"    Comparison text elements: {len(comparison_text)}")

        # Step 7: Explore /tailor route with a query parameter (some apps show different views)
        print("\n[8] Trying different tailor routes...")

        routes_to_try = [
            "/tailor",
            "/tailor/new",
            "/tailor/compare",
            "/comparison",
            "/compare",
            "/result",
            "/results",
        ]

        for route in routes_to_try:
            try:
                full_url = f"https://talorme.com{route}"
                page.goto(full_url, wait_until="networkidle", timeout=10000)
                if page.url != "https://talorme.com/" and "404" not in page.title().lower():
                    print(f"    Valid route found: {route} -> {page.url}")
                    page.screenshot(path=os.path.join(SCREENSHOT_DIR, f"route_{route.replace('/', '_')}.png"), full_page=True)
            except Exception as e:
                pass

        # Step 8: Go back to tailor and capture detailed structure
        print("\n[9] Detailed analysis of tailor page...")
        page.goto("https://talorme.com/tailor", wait_until="networkidle", timeout=60000)
        time.sleep(2)

        # Get all elements with data attributes
        data_elements = page.evaluate("""
            () => {
                const elements = document.querySelectorAll('[data-state], [data-value], [data-orientation]');
                return Array.from(elements).map(el => ({
                    tag: el.tagName,
                    dataState: el.getAttribute('data-state'),
                    dataValue: el.getAttribute('data-value'),
                    className: el.className,
                    text: el.innerText?.slice(0, 50) || ''
                }));
            }
        """)
        print(f"    Elements with data attributes: {len(data_elements)}")
        for el in data_elements[:10]:
            print(f"      - {el}")

        # Step 9: Check all anchor hrefs to understand navigation
        print("\n[10] Analyzing navigation structure...")
        all_links = page.evaluate("""
            () => {
                const links = document.querySelectorAll('a[href]');
                return Array.from(links).map(a => ({
                    href: a.getAttribute('href'),
                    text: a.innerText?.slice(0, 30) || ''
                }));
            }
        """)
        print(f"    Total links: {len(all_links)}")
        unique_hrefs = set(link['href'] for link in all_links if link['href'])
        print(f"    Unique hrefs:")
        for href in sorted(unique_hrefs):
            if href.startswith('/') or href.startswith('http'):
                print(f"      - {href}")

        # Step 10: Look at the upload page to understand the flow start
        print("\n[11] Analyzing upload page flow...")
        page.goto("https://talorme.com/upload", wait_until="networkidle", timeout=60000)
        time.sleep(2)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "11_upload_page_detailed.png"), full_page=True)

        # Check for "Use Existing Resume" option
        existing_resume = page.locator(":text('Use Existing'), :text('Existing Resume'), button:has-text('Existing')").all()
        print(f"    'Use Existing Resume' elements: {len(existing_resume)}")
        for el in existing_resume:
            try:
                text = el.inner_text().strip()
                print(f"      - '{text}'")
            except:
                pass

        # Step 11: Try clicking "Use Existing Resume Instead"
        use_existing_btn = page.locator("button:has-text('Use Existing Resume Instead')").first
        if use_existing_btn.count() > 0:
            print("\n[12] Clicking 'Use Existing Resume Instead'...")
            try:
                use_existing_btn.click()
                time.sleep(2)
                page.screenshot(path=os.path.join(SCREENSHOT_DIR, "12_after_use_existing.png"), full_page=True)
                print(f"    Navigated to: {page.url}")

                # See what's on this page
                existing_page_text = page.inner_text("body")
                print(f"\n    Page content after clicking:\n{existing_page_text[:1000]}")
            except Exception as e:
                print(f"    Error clicking: {e}")

        # Step 12: Check for localStorage/state to understand saved data
        print("\n[13] Checking localStorage for app state...")
        local_storage = page.evaluate("() => JSON.stringify(localStorage)")
        with open(os.path.join(SCREENSHOT_DIR, "localStorage.json"), "w", encoding="utf-8") as f:
            f.write(local_storage)
        print("    Saved localStorage to localStorage.json")

        # Step 13: Take additional screenshots
        print("\n[14] Taking navigation screenshots...")

        # Interview Prep page
        page.goto("https://talorme.com/interview-prep", wait_until="networkidle", timeout=60000)
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "13_interview_prep.png"), full_page=True)
        print("    Captured Interview Prep page")

        # STAR Stories page
        page.goto("https://talorme.com/star-stories", wait_until="networkidle", timeout=60000)
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "14_star_stories.png"), full_page=True)
        print("    Captured STAR Stories page")

        # Career Path page
        page.goto("https://talorme.com/career-path", wait_until="networkidle", timeout=60000)
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "15_career_path.png"), full_page=True)
        print("    Captured Career Path page")

        print("\n" + "=" * 60)
        print("RESEARCH COMPLETE")
        print("=" * 60)
        print(f"\nAll screenshots saved to: {SCREENSHOT_DIR}")
        print("\nKey findings will be summarized based on screenshots...")

        # Keep browser open
        print("\n[15] Browser will remain open for 60 seconds for manual exploration...")
        time.sleep(60)

        browser.close()

if __name__ == "__main__":
    deep_research_talorme()
