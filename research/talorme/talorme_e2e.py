"""
End-to-end flow to capture the comparison view - all in one session.
"""

from playwright.sync_api import sync_playwright
import os
import time
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

SCREENSHOT_DIR = r"C:\Users\derri\talorme_screenshots"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

RESUME_PATH = r"C:\Users\derri\Downloads\Justin_Washington_Cyber_PM_Resume.docx"

def e2e_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()

        print("=" * 60)
        print("END-TO-END FLOW")
        print("=" * 60)

        # Step 1: Upload resume
        print("\n[1] Uploading resume...")
        page.goto("https://talorme.com/upload", wait_until="networkidle", timeout=60000)
        time.sleep(2)

        file_input = page.locator("input[type='file']").first
        if file_input.count() > 0 and os.path.exists(RESUME_PATH):
            file_input.set_input_files(RESUME_PATH)
            print(f"    Uploaded: {RESUME_PATH}")

            # Wait for upload to complete
            print("    Waiting for upload to process...")
            time.sleep(5)

            # Wait for the parsing to complete
            for i in range(12):  # Up to 60 seconds
                content = page.inner_text("body")
                if "parsing" not in content.lower() and "uploading" not in content.lower():
                    print(f"    Upload complete after {(i+1)*5}s")
                    break
                time.sleep(5)

        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "e2e_01_upload_done.png"), full_page=True)

        # Step 2: Navigate to tailor page
        print("\n[2] Going to Tailor page...")
        page.goto("https://talorme.com/tailor", wait_until="networkidle", timeout=60000)
        time.sleep(2)

        page_content = page.inner_text("body")
        print(f"\n    Page content:\n{page_content[:600]}")
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "e2e_02_tailor_page.png"), full_page=True)

        # Step 3: Select resume
        print("\n[3] Selecting resume...")
        # Try clicking the checkbox
        checkboxes = page.locator("input[type='checkbox']").all()
        print(f"    Found {len(checkboxes)} checkboxes")

        for cb in checkboxes:
            try:
                cb.click()
                print("    Clicked checkbox")
                time.sleep(0.5)
            except:
                pass

        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "e2e_03_resume_selected.png"), full_page=True)

        # Step 4: Enter job URL and extract details
        print("\n[4] Entering job URL...")
        job_input = page.locator("input[type='url']").first
        if job_input.count() > 0:
            job_input.fill("https://jpmc.fa.oraclecloud.com/hcmUI/CandidateExperience/en/job/210578251")
            time.sleep(1)
            print("    Entered URL")

        # Click extract
        print("\n[5] Extracting job details...")
        extract_btn = page.locator("button:has-text('Extract')").first
        if extract_btn.count() > 0:
            extract_btn.click()
            print("    Clicked Extract")

            # Wait for extraction
            for i in range(12):  # Up to 60 seconds
                time.sleep(5)
                content = page.inner_text("body")
                if "extracting" not in content.lower():
                    print(f"    Extraction complete after {(i+1)*5}s")
                    break

        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "e2e_04_after_extract.png"), full_page=True)
        page_content = page.inner_text("body")
        print(f"\n    Page after extract:\n{page_content[:800]}")

        # Step 5: Fill company and job title if needed
        print("\n[6] Filling company and job title if needed...")

        # Look for text inputs for company and title
        all_inputs = page.locator("input[type='text']").all()
        print(f"    Found {len(all_inputs)} text inputs")

        for i, inp in enumerate(all_inputs):
            try:
                placeholder = inp.get_attribute("placeholder") or ""
                print(f"    Input {i}: placeholder='{placeholder}'")

                if "company" in placeholder.lower():
                    inp.fill("JPMorgan Chase")
                    print(f"      Filled company name")
                elif "title" in placeholder.lower() or "job" in placeholder.lower():
                    inp.fill("Lead Technical Program Manager - Cybersecurity")
                    print(f"      Filled job title")
            except Exception as e:
                print(f"    Error with input {i}: {e}")

        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "e2e_05_form_filled.png"), full_page=True)

        # Step 6: Check the full page for any additional inputs
        print("\n[7] Looking at all form elements...")
        all_elements = page.evaluate("""
            () => {
                const inputs = document.querySelectorAll('input, textarea, select');
                return Array.from(inputs).map(el => ({
                    tag: el.tagName,
                    type: el.type,
                    name: el.name,
                    placeholder: el.placeholder,
                    value: el.value,
                    disabled: el.disabled,
                    className: el.className
                }));
            }
        """)
        for el in all_elements:
            print(f"    {el['tag']} type={el['type']} name={el['name']} placeholder='{el['placeholder']}' disabled={el['disabled']}")

        # Step 7: Try clicking Generate
        print("\n[8] Attempting to generate...")
        generate_btn = page.locator("button:has-text('Generate')").first
        if generate_btn.count() > 0:
            classes = generate_btn.get_attribute("class") or ""
            is_disabled = "cursor-not-allowed" in classes or "disabled" in classes

            print(f"    Button appears disabled: {is_disabled}")
            print(f"    Button classes: {classes}")

            if not is_disabled:
                generate_btn.click(force=True)
                print("    Clicked Generate (force)")
            else:
                print("    Trying to click anyway with force...")
                try:
                    generate_btn.click(force=True, timeout=5000)
                except Exception as e:
                    print(f"    Force click failed: {str(e)[:100]}")

        # Wait and see what happens
        print("\n[9] Monitoring for changes...")
        for i in range(12):
            time.sleep(5)
            current_url = page.url
            print(f"    [{i*5}s] URL: {current_url}")

            page.screenshot(path=os.path.join(SCREENSHOT_DIR, f"e2e_06_progress_{i}.png"), full_page=True)

            if 'comparison' in current_url or 'compare' in current_url or 'result' in current_url:
                print("    NAVIGATED TO COMPARISON VIEW!")
                break

            content = page.inner_text("body")[:500]
            if "generating" in content.lower():
                print("    Generation in progress...")
            elif "error" in content.lower():
                print(f"    Error: {content[:200]}")

        # Final state
        print("\n[10] Final state...")
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "e2e_07_final.png"), full_page=True)

        final_content = page.inner_text("body")
        print(f"\n    Final content:\n{final_content[:1500]}")

        with open(os.path.join(SCREENSHOT_DIR, "e2e_final.html"), "w", encoding="utf-8") as f:
            f.write(page.content())

        print("\n" + "=" * 60)
        print("E2E FLOW COMPLETE")
        print("=" * 60)
        print("\nBrowser will stay open for 3 minutes for manual interaction.")
        print("Try completing the flow manually if automation didn't work.")

        time.sleep(180)
        browser.close()

if __name__ == "__main__":
    e2e_flow()
