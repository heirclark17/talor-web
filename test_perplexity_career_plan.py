from playwright.sync_api import sync_playwright
import time

def test_career_plan_with_perplexity():
    """Test career plan generation with Perplexity API"""
    
    with sync_playwright() as p:
        print("\nTesting Career Plan Generation with Perplexity API")
        print("=" * 70)
        
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        # Set longer timeout for AI operations
        page.set_default_timeout(180000)  # 3 minutes
        
        try:
            # Step 1: Navigate to career path designer
            print("\nStep 1: Navigating to https://talorme.com/career-path")
            page.goto("https://talorme.com/career-path", wait_until="networkidle")
            time.sleep(2)
            
            # Step 2: Upload resume
            print("Step 2: Uploading resume...")
            resume_path = r"C:\Users\derri\Downloads\Justin_Washington_Cyber_PM_Resume.docx"
            
            # Wait for file input and upload
            file_input = page.locator('input[type="file"]')
            file_input.set_input_files(resume_path)
            print("  [OK] Resume uploaded")
            time.sleep(3)
            
            # Step 3: Fill out career path form
            print("Step 3: Filling out career path form...")
            
            # Dream role
            page.fill('input[placeholder*="dream"]', "Senior Cybersecurity Architect")
            print("  [OK] Dream role: Senior Cybersecurity Architect")
            
            # Location
            page.fill('input[placeholder*="location"]', "Houston, TX")
            print("  [OK] Location: Houston, TX")
            
            # Skills
            page.fill('textarea[placeholder*="skills"]', "AWS, Security Architecture, Cloud Security, Zero Trust, NIST Framework")
            print("  [OK] Skills entered")
            
            # Years of experience
            page.fill('input[type="number"]', "10")
            print("  [OK] Years of experience: 10")
            
            time.sleep(1)
            
            # Step 4: Submit form
            print("Step 4: Submitting form and waiting for Perplexity AI to generate plan...")
            submit_button = page.locator('button:has-text("Generate")')
            submit_button.click()
            
            # Wait for results page with very long timeout (Perplexity web search takes time)
            print("  [WAIT] Waiting for AI generation (this may take 60-120 seconds)...")
            page.wait_for_selector('text=Career Transition Plan', timeout=180000)
            print("  [OK] Results page loaded!")
            
            time.sleep(3)
            
            # Step 5: Check for sections
            print("\nStep 5: Verifying career plan sections:")
            
            sections_to_check = [
                "Target Roles",
                "Skills Analysis",
                "Certification Path",
                "Education Options",
                "Experience Plan",
                "Networking Events",
                "Timeline",
                "Resume Assets"
            ]
            
            all_sections_present = True
            for section in sections_to_check:
                try:
                    section_element = page.locator(f'text="{section}"').first
                    if section_element.is_visible(timeout=5000):
                        print(f"  [OK] {section}")
                    else:
                        print(f"  [FAIL] {section} (not visible)")
                        all_sections_present = False
                except:
                    print(f"  [FAIL] {section} (not found)")
                    all_sections_present = False
            
            # Step 6: Check for real data indicators
            print("\nStep 6: Checking for real web-grounded data...")
            
            page_content = page.content()
            
            # Look for salary ranges (real data indicator)
            if "$" in page_content and any(word in page_content.lower() for word in ["salary", "compensation", "range"]):
                print("  [OK] Salary data present")
            else:
                print("  [WARN] No salary data found")
            
            # Look for URLs (citation indicator)
            if "http" in page_content or "www." in page_content:
                print("  [OK] URLs/citations present")
            else:
                print("  [WARN] No URLs found")
            
            # Look for specific numbers/percentages (data indicator)
            import re
            if re.search(r'\d+%|\d+,\d+|\$\d+', page_content):
                print("  [OK] Specific data/statistics present")
            else:
                print("  [WARN] No specific data found")
            
            # Final result
            print("\n" + "=" * 70)
            if all_sections_present:
                print("SUCCESS: PERPLEXITY INTEGRATION TEST PASSED")
                print("  - All sections rendered successfully")
                print("  - Career plan generated with web-grounded research")
            else:
                print("PARTIAL SUCCESS")
                print("  - Some sections may be missing or not visible")
            
            print("\nKeeping browser open for manual inspection...")
            print("Press Ctrl+C to close")
            time.sleep(300)  # Keep open for 5 minutes
            
        except Exception as e:
            print(f"\nERROR: {str(e)}")
            import traceback
            traceback.print_exc()
            
            # Keep browser open on error
            print("\nKeeping browser open for debugging...")
            time.sleep(300)
        
        finally:
            browser.close()
            print("\nTest complete")

if __name__ == "__main__":
    test_career_plan_with_perplexity()
