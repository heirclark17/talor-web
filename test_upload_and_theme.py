"""
Test upload flow and theme toggle functionality
"""
from playwright.sync_api import sync_playwright
import time

PROD_URL = "https://talorme.com"
RESUME_PATH = r"C:\Users\derri\Downloads\Diamond_Marie_Dixon_Resume_Final (4) (2).docx"

print("=" * 80)
print("TESTING UPLOAD FLOW AND THEME TOGGLE")
print("=" * 80)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Test 1: Upload first resume and tailor
        print("\n[1] Testing first resume upload...")
        page.goto(f"{PROD_URL}/upload")
        page.wait_for_load_state("networkidle")
        time.sleep(2)

        file_input = page.locator('input[type="file"]')
        file_input.set_input_files(RESUME_PATH)

        print("   Waiting for upload...")
        page.wait_for_selector('text=Resume uploaded successfully', timeout=60000)
        print("   [OK] First resume uploaded")
        time.sleep(2)

        # Navigate to tailor and generate
        print("\n[2] Generating first tailored resume...")
        page.goto(f"{PROD_URL}/tailor")
        page.wait_for_load_state("networkidle")
        time.sleep(2)

        page.fill('input[placeholder*="linkedin"]', 'https://www.linkedin.com/jobs/view/test-1')
        page.fill('input[placeholder*="JPMorgan"]', 'First Test Company')
        page.fill('input[placeholder*="Lead Technical"]', 'First Position')

        page.click('button:has-text("Generate Tailored Resume")')
        page.wait_for_selector('text=Resume Successfully Tailored', timeout=180000)
        print("   [OK] First tailored resume generated")
        time.sleep(3)

        # Check if company name is visible
        if page.locator('text=First Test Company').is_visible():
            print("   [OK] First company name visible on tailor page")

        # Test 2: Go back to upload page
        print("\n[3] Testing navigation back to upload...")
        page.goto(f"{PROD_URL}/upload")
        page.wait_for_load_state("networkidle")
        time.sleep(2)

        # Check if we see the old tailored resume
        if page.locator('text=First Test Company').is_visible():
            print("   [BUG] Old tailored resume still showing on upload page!")
        else:
            print("   [OK] Upload page is clean")

        # Test 3: Upload second resume
        print("\n[4] Uploading second resume...")
        file_input = page.locator('input[type="file"]')
        if file_input.count() > 0:
            file_input.set_input_files(RESUME_PATH)
            page.wait_for_selector('text=Resume uploaded successfully', timeout=60000)
            print("   [OK] Second resume uploaded")
            time.sleep(2)
        else:
            print("   [ERROR] No file input found - may be showing old resume")

        # Test 4: Navigate to tailor
        print("\n[5] Checking tailor page after second upload...")
        page.goto(f"{PROD_URL}/tailor")
        page.wait_for_load_state("networkidle")
        time.sleep(2)

        # Check if old data persists
        if page.locator('text=First Test Company').is_visible():
            print("   [BUG] Old company data still visible!")
            print("   localStorage not cleared properly")
        else:
            print("   [OK] Tailor page is clean")

        # Test 5: Theme toggle testing
        print("\n[6] Testing theme toggle...")
        page.screenshot(path="test_theme_before.png")
        print("   Screenshot saved: test_theme_before.png (dark mode)")

        # Find and click theme toggle
        theme_toggle = page.locator('button').filter(has=page.locator('svg')).first
        if theme_toggle.is_visible():
            print("   [OK] Theme toggle button found")
            theme_toggle.click()
            time.sleep(2)

            page.screenshot(path="test_theme_after_toggle.png")
            print("   Screenshot saved: test_theme_after_toggle.png (should be light)")

            # Check for black overlay/blocker
            body_classes = page.locator('body').get_attribute('class')
            html_classes = page.locator('html').get_attribute('class')

            print(f"   Body classes: {body_classes}")
            print(f"   HTML classes: {html_classes}")

            # Check background colors
            body_bg = page.evaluate('window.getComputedStyle(document.body).backgroundColor')
            print(f"   Body background: {body_bg}")

            # Look for any overlay elements
            overlays = page.locator('.fixed.inset-0, [style*="position: fixed"]').count()
            if overlays > 0:
                print(f"   [BUG] Found {overlays} potential overlay elements")

            # Toggle back
            theme_toggle.click()
            time.sleep(2)
            page.screenshot(path="test_theme_back_dark.png")
            print("   Screenshot saved: test_theme_back_dark.png (back to dark)")
        else:
            print("   [ERROR] Theme toggle button not found")

        # Test 6: Check localStorage
        print("\n[7] Checking localStorage contents...")
        storage = page.evaluate('''() => {
            const keys = Object.keys(localStorage);
            const data = {};
            keys.forEach(key => {
                data[key] = localStorage.getItem(key);
            });
            return data;
        }''')

        print("   localStorage keys:")
        for key, value in storage.items():
            if 'resume' in key.lower():
                print(f"     - {key}: {value[:50] if len(value) > 50 else value}...")

        print("\n" + "=" * 80)
        print("TEST SUMMARY")
        print("=" * 80)
        print("Screenshots saved:")
        print("  - test_theme_before.png")
        print("  - test_theme_after_toggle.png")
        print("  - test_theme_back_dark.png")
        print("\nCheck for:")
        print("  1. Old resume data persisting across uploads")
        print("  2. Theme toggle creating black overlay")
        print("  3. localStorage not being cleared")
        print("=" * 80)

    except Exception as e:
        print(f"\n[ERROR] Test failed: {e}")
        import traceback
        traceback.print_exc()
        page.screenshot(path="test_upload_theme_error.png")

    finally:
        input("\nPress Enter to close browser...")
        browser.close()
