"""
Complete the full flow with manual data entry to see the comparison view.
"""

from playwright.sync_api import sync_playwright
import os
import time
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

SCREENSHOT_DIR = r"C:\Users\derri\talorme_screenshots"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

def complete_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()

        print("=" * 60)
        print("COMPLETING FULL FLOW TO SEE COMPARISON VIEW")
        print("=" * 60)

        # Go directly to tailor page (resume should still be there from localStorage)
        print("\n[1] Going to Tailor page...")
        page.goto("https://talorme.com/tailor", wait_until="networkidle", timeout=60000)
        time.sleep(2)

        # Check if resume is available
        page_content = page.inner_text("body")
        print(f"\n    Page content:\n{page_content[:500]}")

        # Screenshot current state
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "final_01_tailor_page.png"), full_page=True)

        # Step 1: Select the resume (click on it)
        print("\n[2] Selecting resume...")
        resume_checkbox = page.locator("input[type='checkbox']").first
        if resume_checkbox.count() > 0:
            resume_checkbox.click()
            time.sleep(1)
            print("    Clicked checkbox")

        # Also try clicking the resume card itself
        resume_card = page.locator("[class*='card']").first
        if resume_card.count() > 0:
            try:
                resume_card.click()
                time.sleep(1)
                print("    Clicked resume card")
            except:
                pass

        # Step 2: Enter job URL
        print("\n[3] Entering job details...")
        job_url_input = page.locator("input[type='url']").first
        if job_url_input.count() > 0:
            job_url_input.fill("https://jpmc.fa.oraclecloud.com/hcmUI/CandidateExperience/en/job/210578251")
            print("    Entered job URL")
            time.sleep(1)

        # Step 3: Click Extract Details
        print("\n[4] Extracting job details...")
        extract_btn = page.locator("button:has-text('Extract')").first
        if extract_btn.count() > 0:
            extract_btn.click()
            print("    Clicked Extract Details")
            time.sleep(5)

        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "final_02_after_extract.png"), full_page=True)
        page_content = page.inner_text("body")
        print(f"\n    Page after extract:\n{page_content[:800]}")

        # Step 4: Check if we need to manually fill company and job title
        print("\n[5] Checking for manual input fields...")

        # Look for company name input
        company_inputs = page.locator("input[placeholder*='company'], input[placeholder*='Company'], input[name*='company']").all()
        print(f"    Company input fields: {len(company_inputs)}")

        # Try to find any visible text inputs after Job URL
        all_inputs = page.locator("input:not([type='checkbox']):not([type='file'])").all()
        print(f"    All visible inputs: {len(all_inputs)}")
        for i, inp in enumerate(all_inputs):
            try:
                placeholder = inp.get_attribute("placeholder") or ""
                value = inp.get_attribute("value") or ""
                inp_type = inp.get_attribute("type") or "text"
                print(f"      [{i}] type={inp_type}, placeholder='{placeholder}', value='{value}'")
            except:
                pass

        # Step 5: Try to fill company name and job title manually
        print("\n[6] Attempting to fill company and job title...")

        # Find inputs by their labels or placeholders
        try:
            # Company Name
            company_label = page.locator("label:has-text('Company')").first
            if company_label.count() > 0:
                # Find the input associated with this label
                company_input = page.locator("input").nth(1)  # Try second input after URL
                if company_input.count() > 0:
                    company_input.fill("JPMorgan Chase")
                    print("    Filled company name")

            # Job Title
            title_label = page.locator("label:has-text('Job Title')").first
            if title_label.count() > 0:
                title_input = page.locator("input").nth(2)  # Try third input
                if title_input.count() > 0:
                    title_input.fill("Cybersecurity Program Manager")
                    print("    Filled job title")
        except Exception as e:
            print(f"    Error filling inputs: {e}")

        time.sleep(2)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "final_03_filled_form.png"), full_page=True)

        # Step 6: Look at the full form structure
        print("\n[7] Analyzing full form structure...")
        form_html = page.locator("main").first.inner_html()
        with open(os.path.join(SCREENSHOT_DIR, "form_structure.html"), "w", encoding="utf-8") as f:
            f.write(form_html)
        print("    Saved form HTML")

        # Step 7: Try to click Generate
        print("\n[8] Attempting to generate tailored resume...")
        generate_btn = page.locator("button:has-text('Generate')").first
        if generate_btn.count() > 0:
            is_disabled = generate_btn.get_attribute("disabled")
            print(f"    Generate button disabled: {is_disabled}")

            # Even if disabled, let's see what the button state is
            btn_classes = generate_btn.get_attribute("class")
            print(f"    Button classes: {btn_classes}")

            if not is_disabled:
                print("    Clicking Generate...")
                generate_btn.click()

                # Wait and monitor for changes
                for i in range(24):  # Up to 2 minutes
                    time.sleep(5)
                    current_url = page.url
                    print(f"    [{i*5}s] URL: {current_url}")

                    page.screenshot(path=os.path.join(SCREENSHOT_DIR, f"final_04_progress_{i}.png"), full_page=True)

                    # Check for comparison view indicators
                    if any(x in current_url for x in ['comparison', 'compare', 'result']):
                        print("    FOUND COMPARISON VIEW!")
                        break

                    # Check page content
                    content = page.inner_text("body")
                    if "original" in content.lower() and "tailored" in content.lower():
                        print("    Found comparison content!")
                        break

                    if "error" in content.lower():
                        print(f"    Error detected: {content[:200]}")
                        break

        # Final screenshots and data collection
        print("\n[9] Collecting final data...")
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "final_05_result.png"), full_page=True)

        # Save the final page HTML
        with open(os.path.join(SCREENSHOT_DIR, "final_page.html"), "w", encoding="utf-8") as f:
            f.write(page.content())

        # Get final page content
        final_content = page.inner_text("body")
        print(f"\n    Final page content:\n{final_content[:2000]}")

        print("\n" + "=" * 60)
        print("FLOW COMPLETE")
        print("=" * 60)

        # Keep browser open for manual exploration
        print("\n[10] Browser will remain open for 2 minutes for manual exploration...")
        print("    Try these actions manually:")
        print("    1. Check the checkbox next to the resume")
        print("    2. Enter company: 'JPMorgan Chase'")
        print("    3. Enter job title: 'Cybersecurity Program Manager'")
        print("    4. Click 'Generate Tailored Resume'")
        print("    5. Wait for comparison view to appear")

        time.sleep(120)

        browser.close()

if __name__ == "__main__":
    complete_flow()
