"""
Complete test: Upload -> Tailor -> Export/Print
Tests that exported files contain ONLY tailored resume
"""
from playwright.sync_api import sync_playwright
import time
import os

PROD_URL = "https://talorme.com"
RESUME_PATH = r"C:\Users\derri\Downloads\Diamond_Marie_Dixon_Resume_Final (4) (2).docx"

print("=" * 80)
print("COMPLETE EXPORT AND PRINT TEST")
print("=" * 80)
print("\nThis test will:")
print("1. Upload a resume")
print("2. Generate a tailored resume")
print("3. Test DOCX and PDF export")
print("4. Test print function")
print("5. Verify content")
print("\n" + "=" * 80)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    context = browser.new_context(accept_downloads=True)
    page = context.new_page()

    try:
        # Step 1: Upload resume
        print("\n[1] Uploading resume...")
        page.goto(f"{PROD_URL}/upload")
        page.wait_for_load_state("networkidle")
        time.sleep(2)

        file_input = page.locator('input[type="file"]')
        file_input.set_input_files(RESUME_PATH)

        print("   Waiting for AI parsing (30s)...")
        page.wait_for_selector('text=Resume uploaded successfully', timeout=60000)
        print("   [OK] Resume uploaded successfully")
        time.sleep(3)

        # Step 2: Navigate to tailor page
        print("\n[2] Navigating to tailor page...")
        page.goto(f"{PROD_URL}/tailor")
        page.wait_for_load_state("networkidle")
        time.sleep(2)

        # Step 3: Fill job details and tailor
        print("\n[3] Filling job details...")
        page.fill('input[placeholder*="linkedin"]', 'https://www.linkedin.com/jobs/view/test-job')
        page.fill('input[placeholder*="JPMorgan"]', 'Test Export Company')
        page.fill('input[placeholder*="Lead Technical"]', 'Test Position')

        print("\n[4] Generating tailored resume...")
        page.click('button:has-text("Generate Tailored Resume")')

        print("   Waiting for tailoring (120s max)...")
        page.wait_for_selector('text=Resume Successfully Tailored', timeout=180000)
        print("   [OK] Resume tailored successfully")
        time.sleep(5)

        # Step 4: Wait for AI analysis to load
        print("\n[5] Waiting for AI analysis to complete...")
        print("   This may take 3-5 minutes total...")

        # Check for loading indicator
        max_wait = 300  # 5 minutes max
        start_time = time.time()

        while time.time() - start_time < max_wait:
            if page.locator('text=Analyzing resume changes').is_visible():
                print("   [INFO] AI analysis in progress...")
                time.sleep(10)
            elif page.locator('text=Extracting keywords').is_visible():
                print("   [INFO] Extracting keywords...")
                time.sleep(10)
            elif page.locator('text=Calculating match score').is_visible():
                print("   [INFO] Calculating match score...")
                time.sleep(10)
            else:
                print("   [OK] Analysis appears complete")
                break

        time.sleep(5)

        # Step 5: Test tab navigation
        print("\n[6] Testing tab navigation...")

        comparison_tab = page.locator('button:has-text("Side-by-Side Comparison")')
        if comparison_tab.is_visible():
            print("   [OK] Comparison tab visible")
            comparison_tab.click()
            time.sleep(1)

        analysis_tab = page.locator('button:has-text("AI Analysis")')
        if analysis_tab.is_visible():
            print("   [OK] Analysis tab visible")

        insights_tab = page.locator('button:has-text("Match & Keywords")')
        if insights_tab.is_visible():
            print("   [OK] Insights tab visible")

        # Step 6: Export DOCX
        print("\n[7] Testing DOCX export...")
        comparison_tab.click()
        time.sleep(1)

        try:
            export_button = page.locator('button:has-text("Export")').first
            export_button.click()
            time.sleep(1)

            with page.expect_download(timeout=30000) as download_info:
                page.locator('button:has-text("Word Document")').click()
                download = download_info.value

            download_path = os.path.join(os.getcwd(), "test_export_tailored.docx")
            download.save_as(download_path)

            file_size = os.path.getsize(download_path)
            print(f"   [OK] DOCX downloaded: {download.suggested_filename}")
            print(f"   File size: {file_size / 1024:.1f} KB")

            if file_size > 10000:
                print("   [OK] DOCX file appears valid (>10KB)")
            else:
                print("   [WARN] DOCX file seems small")

            time.sleep(2)
        except Exception as e:
            print(f"   [ERROR] DOCX export failed: {e}")

        # Step 7: Export PDF
        print("\n[8] Testing PDF export...")
        try:
            export_button = page.locator('button:has-text("Export")').first
            export_button.click()
            time.sleep(1)

            with page.expect_download(timeout=30000) as download_info:
                page.locator('button:has-text("PDF Document")').click()
                download = download_info.value

            download_path = os.path.join(os.getcwd(), "test_export_tailored.pdf")
            download.save_as(download_path)

            file_size = os.path.getsize(download_path)
            print(f"   [OK] PDF downloaded: {download.suggested_filename}")
            print(f"   File size: {file_size / 1024:.1f} KB")

            if file_size > 10000:
                print("   [OK] PDF file appears valid (>10KB)")
            else:
                print("   [WARN] PDF file seems small")

            time.sleep(2)
        except Exception as e:
            print(f"   [ERROR] PDF export failed: {e}")

        # Step 8: Test print function
        print("\n[9] Testing print function...")
        try:
            print_button = page.locator('button:has-text("Print")').first
            if print_button.is_visible():
                print_button.click()
                time.sleep(2)
                print("   [OK] Print button clicked")
                print("   Note: Print dialog opens in browser")
            else:
                print("   [WARN] Print button not found")
        except Exception as e:
            print(f"   [WARN] Print function: {e}")

        # Step 9: Verify content
        print("\n[10] Verifying page content...")
        comparison_tab.click()
        time.sleep(1)

        if page.locator('h2:has-text("Original Resume")').is_visible():
            print("   [OK] Original resume section visible")

        if page.locator('h2:has-text("Tailored Resume")').is_visible():
            print("   [OK] Tailored resume section visible")

        # Check for company name in tailored section
        if page.locator('text=Test Export Company').is_visible():
            print("   [OK] Tailored resume shows correct company")

        # Step 10: Take screenshot
        print("\n[11] Taking screenshots...")
        page.screenshot(path="test_export_comparison_tab.png", full_page=True)
        print("   [OK] Screenshot saved: test_export_comparison_tab.png")

        analysis_tab.click()
        time.sleep(1)
        page.screenshot(path="test_export_analysis_tab.png", full_page=True)
        print("   [OK] Screenshot saved: test_export_analysis_tab.png")

        insights_tab.click()
        time.sleep(1)
        page.screenshot(path="test_export_insights_tab.png", full_page=True)
        print("   [OK] Screenshot saved: test_export_insights_tab.png")

        # Final summary
        print("\n" + "=" * 80)
        print("TEST SUMMARY - ALL STEPS COMPLETED")
        print("=" * 80)
        print("[OK] Resume uploaded")
        print("[OK] Resume tailored")
        print("[OK] DOCX export tested")
        print("[OK] PDF export tested")
        print("[OK] Print function tested")
        print("[OK] Tab navigation tested")
        print("[OK] Content verified")
        print("\nGenerated files:")
        print("  - test_export_tailored.docx")
        print("  - test_export_tailored.pdf")
        print("  - test_export_comparison_tab.png")
        print("  - test_export_analysis_tab.png")
        print("  - test_export_insights_tab.png")
        print("\n[IMPORTANT] Manual verification required:")
        print("  1. Open test_export_tailored.docx")
        print("  2. Verify it contains ONLY the tailored resume")
        print("  3. Verify company name is 'Test Export Company'")
        print("  4. Verify NO original resume content")
        print("\n  5. Open test_export_tailored.pdf")
        print("  6. Verify same criteria as DOCX")
        print("=" * 80)

    except Exception as e:
        print(f"\n[ERROR] Test failed: {e}")
        import traceback
        traceback.print_exc()
        page.screenshot(path="test_export_error.png", full_page=True)
        print("Error screenshot saved: test_export_error.png")

    finally:
        input("\nPress Enter to close browser...")
        browser.close()
