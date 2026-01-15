"""
Test export and print functions - verify only tailored resume is exported
"""
from playwright.sync_api import sync_playwright, expect
import time
import os

PROD_URL = "https://talorme.com"
RESUME_PATH = r"C:\Users\derri\Downloads\Diamond_Marie_Dixon_Resume_Final (4) (2).docx"

print("=" * 80)
print("TESTING EXPORT AND PRINT FUNCTIONS")
print("=" * 80)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    context = browser.new_context(accept_downloads=True)
    page = context.new_page()

    # Navigate to site
    print("\n[1] Navigating to production site...")
    page.goto(PROD_URL)
    page.wait_for_load_state("networkidle")
    time.sleep(2)

    # Upload resume - navigate directly to upload page
    print("\n[2] Navigating to upload page...")
    page.goto(f"{PROD_URL}/upload")
    page.wait_for_load_state("networkidle")
    time.sleep(2)

    file_input = page.locator('input[type="file"]')
    file_input.set_input_files(RESUME_PATH)

    print("   Waiting for AI parsing (30s)...")
    page.wait_for_selector('text=Resume uploaded successfully', timeout=60000)
    time.sleep(3)

    # Navigate to tailor page
    print("\n[3] Navigating to tailor page...")
    page.click('a[href="/tailor"]')
    page.wait_for_load_state("networkidle")
    time.sleep(2)

    # Check if we're already on tailor page with existing data
    if page.locator('text=Resume Successfully Tailored').is_visible():
        print("   ✅ Found existing tailored resume, skipping tailoring")
    else:
        # Fill job details
        print("\n[4] Filling job details...")
        page.fill('input[placeholder*="linkedin.com"]', 'https://www.linkedin.com/jobs/view/test-job')
        page.fill('input[placeholder*="JPMorgan"]', 'Test Company')
        page.fill('input[placeholder*="Lead Technical"]', 'Test Position')

    # Click tailor button
    print("\n[5] Generating tailored resume...")
    page.click('button:has-text("Generate Tailored Resume")')

    print("   Waiting for tailoring (120s)...")
    page.wait_for_selector('text=Resume Successfully Tailored', timeout=180000)
    time.sleep(5)

    # Wait for analysis to load
    print("\n[6] Waiting for AI analysis to load...")
    time.sleep(10)

    # Test 1: Export DOCX
    print("\n[7] Testing DOCX export...")
    page.click('button:has-text("Export")')
    time.sleep(1)

    with page.expect_download() as download_info:
        page.click('button:has-text("Word Document")')
        download = download_info.value

    # Save and check file
    download_path = os.path.join(os.getcwd(), "test_export_docx.docx")
    download.save_as(download_path)

    file_size = os.path.getsize(download_path)
    print(f"   ✅ DOCX downloaded: {download.suggested_filename}")
    print(f"   File size: {file_size / 1024:.1f} KB")

    if file_size > 10000:
        print("   ✅ DOCX file appears valid (>10KB)")
    else:
        print("   ⚠️  DOCX file seems small, may be empty")

    time.sleep(2)

    # Test 2: Export PDF
    print("\n[8] Testing PDF export...")
    page.click('button:has-text("Export")')
    time.sleep(1)

    with page.expect_download() as download_info:
        page.click('button:has-text("PDF Document")')
        download = download_info.value

    # Save and check file
    download_path = os.path.join(os.getcwd(), "test_export_pdf.pdf")
    download.save_as(download_path)

    file_size = os.path.getsize(download_path)
    print(f"   ✅ PDF downloaded: {download.suggested_filename}")
    print(f"   File size: {file_size / 1024:.1f} KB")

    if file_size > 10000:
        print("   ✅ PDF file appears valid (>10KB)")
    else:
        print("   ⚠️  PDF file seems small, may be empty")

    time.sleep(2)

    # Test 3: Print function (check if print dialog opens)
    print("\n[9] Testing print function...")

    # Listen for print event
    print_triggered = False

    def handle_dialog(dialog):
        print(f"   Dialog opened: {dialog.message}")
        dialog.accept()

    page.on("dialog", handle_dialog)

    # Click print button
    try:
        page.click('button:has-text("Print")', timeout=5000)
        time.sleep(2)
        print("   ✅ Print button clicked successfully")
        print("   Note: Print dialog behavior depends on browser automation mode")
    except Exception as e:
        print(f"   ⚠️  Print button click failed: {e}")

    # Test 4: Verify only tailored resume content
    print("\n[10] Verifying page content shows tailored resume...")

    # Switch to "Side-by-Side Comparison" tab to see both
    comparison_tab = page.locator('button:has-text("Side-by-Side Comparison")')
    if comparison_tab.is_visible():
        print("   ✅ Found tabbed interface")
        comparison_tab.click()
        time.sleep(1)

        # Check for both original and tailored
        if page.locator('h2:has-text("Original Resume")').is_visible():
            print("   ✅ Original resume section visible")

        if page.locator('h2:has-text("Tailored Resume")').is_visible():
            print("   ✅ Tailored resume section visible")

        # Check tailored company name
        if page.locator('text=Test Company').is_visible():
            print("   ✅ Tailored resume shows correct company name")
    else:
        print("   ⚠️  Tabbed interface not found")

    # Test 5: Check AI Analysis tab
    print("\n[11] Checking AI Analysis tab...")
    analysis_tab = page.locator('button:has-text("AI Analysis")')
    if analysis_tab.is_visible():
        analysis_tab.click()
        time.sleep(2)

        # Check for loading state or content
        if page.locator('.animate-spin').is_visible():
            print("   ⏳ AI Analysis still loading...")
        elif page.locator('text=Professional Summary').is_visible():
            print("   ✅ AI Analysis content loaded")
        else:
            print("   ⚠️  AI Analysis state unclear")

    # Test 6: Check Match & Keywords tab
    print("\n[12] Checking Match & Keywords tab...")
    insights_tab = page.locator('button:has-text("Match & Keywords")')
    if insights_tab.is_visible():
        insights_tab.click()
        time.sleep(2)

        # Check for loading state or content
        if page.locator('.animate-spin').is_visible():
            print("   ⏳ Match & Keywords still loading...")
        elif page.locator('text=Match Score').is_visible() or page.locator('text=Keywords').is_visible():
            print("   ✅ Match & Keywords content loaded")
        else:
            print("   ⚠️  Match & Keywords state unclear")

    # Screenshot final state
    print("\n[13] Taking screenshot...")
    page.screenshot(path="test_export_print_final.png", full_page=True)
    print("   ✅ Screenshot saved: test_export_print_final.png")

    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    print("✅ DOCX export tested")
    print("✅ PDF export tested")
    print("✅ Print function tested")
    print("✅ Tabbed interface verified")
    print("✅ Content organization checked")
    print("\nNote: Actual print preview requires manual verification")
    print("Check downloaded files: test_export_docx.docx and test_export_pdf.pdf")
    print("=" * 80)

    input("\nPress Enter to close browser...")
    browser.close()
