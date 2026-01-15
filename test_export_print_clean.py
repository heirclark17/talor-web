"""
Simple test for export and print functions - assumes tailored resume already exists
"""
from playwright.sync_api import sync_playwright
import time
import os

PROD_URL = "https://talorme.com"

print("=" * 80)
print("TESTING EXPORT AND PRINT FUNCTIONS")
print("=" * 80)
print("\nPrerequisite: You should have already generated a tailored resume")
print("This test will use your existing tailored resume to test export/print")
print("\n" + "=" * 80)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    context = browser.new_context(accept_downloads=True)
    page = context.new_page()

    # Navigate to tailor page
    print("\n[1] Navigating to tailor page...")
    page.goto(f"{PROD_URL}/tailor")
    page.wait_for_load_state("networkidle")
    time.sleep(3)

    # Check if tailored resume is visible
    print("\n[2] Checking for existing tailored resume...")
    if page.locator('text=Resume Successfully Tailored').is_visible():
        print("   [OK] Found existing tailored resume!")

        # Get company name
        try:
            company_text = page.locator('text=Your resume has been customized for').text_content()
            print(f"   Company: {company_text}")
        except:
            print("   Company info not found")
    else:
        print("   [ERROR] No tailored resume found!")
        print("   Please generate a tailored resume first, then run this test")
        browser.close()
        exit(1)

    # Wait a bit for analysis to load
    print("\n[3] Waiting for analysis to load (10s)...")
    time.sleep(10)

    # Test 1: Check tab navigation
    print("\n[4] Testing tab navigation...")

    comparison_tab = page.locator('button:has-text("Side-by-Side Comparison")')
    if comparison_tab.is_visible():
        print("   [OK] Comparison tab visible")
        comparison_tab.click()
        time.sleep(1)

    analysis_tab = page.locator('button:has-text("AI Analysis")')
    if analysis_tab.is_visible():
        print("   [OK] Analysis tab visible")
        analysis_tab.click()
        time.sleep(1)

    insights_tab = page.locator('button:has-text("Match & Keywords")')
    if insights_tab.is_visible():
        print("   [OK] Insights tab visible")
        insights_tab.click()
        time.sleep(1)

    # Switch back to comparison for export
    comparison_tab.click()
    time.sleep(1)

    # Test 2: Export DOCX
    print("\n[5] Testing DOCX export...")
    try:
        # Open export menu
        export_button = page.locator('button:has-text("Export")')
        export_button.click()
        time.sleep(1)

        # Click DOCX option
        with page.expect_download() as download_info:
            page.locator('button:has-text("Word Document")').click()
            download = download_info.value

        # Save and check file
        download_path = os.path.join(os.getcwd(), "test_export_docx.docx")
        download.save_as(download_path)

        file_size = os.path.getsize(download_path)
        print(f"   [OK] DOCX downloaded: {download.suggested_filename}")
        print(f"   File size: {file_size / 1024:.1f} KB")

        if file_size > 10000:
            print("   [OK] DOCX file appears valid (>10KB)")
        else:
            print("   [WARN] DOCX file seems small, may be empty")

        time.sleep(2)
    except Exception as e:
        print(f"   [ERROR] DOCX export failed: {e}")

    # Test 3: Export PDF
    print("\n[6] Testing PDF export...")
    try:
        # Open export menu
        export_button = page.locator('button:has-text("Export")')
        export_button.click()
        time.sleep(1)

        # Click PDF option
        with page.expect_download() as download_info:
            page.locator('button:has-text("PDF Document")').click()
            download = download_info.value

        # Save and check file
        download_path = os.path.join(os.getcwd(), "test_export_pdf.pdf")
        download.save_as(download_path)

        file_size = os.path.getsize(download_path)
        print(f"   [OK] PDF downloaded: {download.suggested_filename}")
        print(f"   File size: {file_size / 1024:.1f} KB")

        if file_size > 10000:
            print("   [OK] PDF file appears valid (>10KB)")
        else:
            print("   [WARN] PDF file seems small, may be empty")

        time.sleep(2)
    except Exception as e:
        print(f"   [ERROR] PDF export failed: {e}")

    # Test 4: Print function
    print("\n[7] Testing print function...")
    try:
        print_button = page.locator('button:has-text("Print")')
        if print_button.is_visible():
            print_button.click()
            time.sleep(2)
            print("   [OK] Print button clicked successfully")
            print("   Note: Print dialog behavior depends on browser automation mode")
        else:
            print("   [WARN] Print button not found")
    except Exception as e:
        print(f"   [WARN] Print button click failed: {e}")

    # Test 5: Check loading indicator
    print("\n[8] Checking for loading indicator...")
    if page.locator('text=Analyzing resume changes').is_visible():
        print("   [INFO] Loading indicator visible - analysis in progress")
    elif page.locator('text=Analysis complete').is_visible():
        print("   [OK] Analysis complete message visible")
    else:
        print("   [INFO] No loading indicator (analysis may be done)")

    # Test 6: Verify content in comparison view
    print("\n[9] Verifying comparison content...")
    comparison_tab.click()
    time.sleep(1)

    if page.locator('h2:has-text("Original Resume")').is_visible():
        print("   [OK] Original resume section visible")

    if page.locator('h2:has-text("Tailored Resume")').is_visible():
        print("   [OK] Tailored resume section visible")

    # Test 7: Check quality score
    print("\n[10] Checking quality score...")
    if page.locator('text=Quality Score').is_visible():
        try:
            score_text = page.locator('text=/\\d+%/').first.text_content()
            print(f"   [OK] Quality Score: {score_text}")
        except:
            print("   [WARN] Quality score found but couldn't read value")
    else:
        print("   [WARN] Quality score not visible")

    # Screenshot final state
    print("\n[11] Taking screenshot...")
    page.screenshot(path="test_export_print_final.png", full_page=True)
    print("   [OK] Screenshot saved: test_export_print_final.png")

    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    print("[OK] Tab navigation tested")
    print("[OK] DOCX export tested")
    print("[OK] PDF export tested")
    print("[OK] Print function tested")
    print("[OK] Content verification completed")
    print("\nFiles to review:")
    print("  - test_export_docx.docx")
    print("  - test_export_pdf.pdf")
    print("  - test_export_print_final.png")
    print("\n[IMPORTANT] Open the DOCX/PDF files to verify they contain")
    print("            ONLY the tailored resume, not the original resume")
    print("=" * 80)

    input("\nPress Enter to close browser...")
    browser.close()
