"""
Research script to capture the comparison view by uploading a real resume.
"""

from playwright.sync_api import sync_playwright
import os
import time
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

SCREENSHOT_DIR = r"C:\Users\derri\talorme_screenshots"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

# We need to find a resume file on the system
POSSIBLE_RESUME_PATHS = [
    r"C:\Users\derri\Downloads\Justin_Washington_Cyber_PM_Resume.docx",
    r"C:\Users\derri\Documents\resume.docx",
    r"C:\Users\derri\Documents\resume.pdf",
]

def find_resume():
    """Find a resume file to upload"""
    for path in POSSIBLE_RESUME_PATHS:
        if os.path.exists(path):
            return path
    return None

def capture_comparison_view():
    resume_path = find_resume()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()

        print("=" * 60)
        print("CAPTURING COMPARISON VIEW")
        print("=" * 60)

        if resume_path:
            print(f"\n[1] Found resume: {resume_path}")

            # Step 1: Go to upload page
            print("\n[2] Going to upload page...")
            page.goto("https://talorme.com/upload", wait_until="networkidle", timeout=60000)
            time.sleep(2)

            # Step 2: Upload the resume
            print("\n[3] Uploading resume...")

            # Find the file input (it might be hidden)
            file_input = page.locator("input[type='file']").first
            if file_input.count() > 0:
                # Upload the file
                file_input.set_input_files(resume_path)
                print(f"    Uploaded: {resume_path}")
                time.sleep(3)

                # Wait for upload to complete and check result
                page.screenshot(path=os.path.join(SCREENSHOT_DIR, "comparison_01_after_upload.png"), full_page=True)

                # Check if we were redirected or if there's a success message
                current_url = page.url
                page_content = page.inner_text("body")
                print(f"\n    Current URL: {current_url}")
                print(f"\n    Page content after upload:\n{page_content[:800]}")

                # Wait a bit more for processing
                time.sleep(3)
                page.screenshot(path=os.path.join(SCREENSHOT_DIR, "comparison_02_upload_complete.png"), full_page=True)

                # Step 3: Go to Tailor page
                print("\n[4] Navigating to Tailor page...")
                page.goto("https://talorme.com/tailor", wait_until="networkidle", timeout=60000)
                time.sleep(2)
                page.screenshot(path=os.path.join(SCREENSHOT_DIR, "comparison_03_tailor_with_resume.png"), full_page=True)

                page_content = page.inner_text("body")
                print(f"\n    Tailor page content:\n{page_content[:1000]}")

                # Step 4: Check if resume is available for selection
                # Look for resume cards or selection UI
                resume_cards = page.locator("[class*='resume'], [class*='card']").all()
                print(f"\n    Found {len(resume_cards)} potential resume elements")

                # Step 5: Try to select resume and enter job URL
                print("\n[5] Setting up tailoring...")

                # Enter a job URL
                job_input = page.locator("input[type='url']").first
                if job_input.count() > 0:
                    job_input.fill("https://www.linkedin.com/jobs/view/4120681166")
                    print("    Entered job URL")
                    time.sleep(1)

                    # Click Extract Details
                    extract_btn = page.locator("button:has-text('Extract')").first
                    if extract_btn.count() > 0:
                        print("    Clicking Extract Details...")
                        extract_btn.click()
                        time.sleep(5)  # Wait for extraction
                        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "comparison_04_after_extract.png"), full_page=True)

                        page_content = page.inner_text("body")
                        print(f"\n    After extraction:\n{page_content[:1000]}")

                        # Step 6: Try to click Generate
                        generate_btn = page.locator("button:has-text('Generate')").first
                        if generate_btn.count() > 0:
                            is_disabled = generate_btn.get_attribute("disabled")
                            print(f"\n    Generate button disabled: {is_disabled}")

                            if not is_disabled:
                                print("    Clicking Generate Tailored Resume...")
                                generate_btn.click()
                                print("    Waiting for generation (this may take 30-60 seconds)...")

                                # Wait for generation with screenshots
                                for i in range(12):  # Up to 60 seconds
                                    time.sleep(5)
                                    page.screenshot(path=os.path.join(SCREENSHOT_DIR, f"comparison_05_generating_{i}.png"), full_page=True)
                                    current_url = page.url
                                    print(f"    [{i*5}s] URL: {current_url}")

                                    # Check if we navigated to a comparison page
                                    if 'comparison' in current_url or 'compare' in current_url or 'result' in current_url:
                                        print("    FOUND COMPARISON VIEW!")
                                        break

                                    # Check page content for completion
                                    try:
                                        content = page.inner_text("body")[:200]
                                        if 'tailored' in content.lower() and 'original' in content.lower():
                                            print("    Found comparison content!")
                                            break
                                    except:
                                        pass

                                # Final screenshot
                                page.screenshot(path=os.path.join(SCREENSHOT_DIR, "comparison_06_final_result.png"), full_page=True)
                                print(f"\n    Final URL: {page.url}")

                                final_content = page.inner_text("body")
                                print(f"\n    Final page content:\n{final_content[:1500]}")

                                # Save full HTML
                                with open(os.path.join(SCREENSHOT_DIR, "comparison_view.html"), "w", encoding="utf-8") as f:
                                    f.write(page.content())
                                print("\n    Saved comparison HTML to comparison_view.html")

        else:
            print("\n[!] No resume file found. Creating a simple test document...")

            # Create a simple test resume
            test_resume_path = os.path.join(SCREENSHOT_DIR, "test_resume.txt")
            with open(test_resume_path, "w") as f:
                f.write("""
John Doe
Software Engineer
john.doe@email.com | (555) 123-4567

EXPERIENCE
Senior Software Engineer | Tech Company | 2020-Present
- Led development of cloud infrastructure
- Managed team of 5 developers

EDUCATION
B.S. Computer Science | University | 2016
                """)
            print(f"    Created test resume: {test_resume_path}")
            print("    Note: TalorMe only accepts .docx and .pdf files")

        # Keep browser open for inspection
        print("\n[10] Browser will remain open for 120 seconds...")
        print("    You can manually explore the app and take screenshots.")
        time.sleep(120)

        browser.close()

if __name__ == "__main__":
    capture_comparison_view()
