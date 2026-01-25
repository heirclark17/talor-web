"""
Playwright Test Script - Interview Prep Feature Testing
Tests all interview prep features on talorme.com and correlates with backend API
"""

import json
import time
from datetime import datetime
from playwright.sync_api import sync_playwright, Page, expect

class InterviewPrepFeatureTester:
    def __init__(self):
        self.results = {
            "test_date": datetime.now().isoformat(),
            "url_tested": "https://talorme.com",
            "features_found": [],
            "ui_elements": [],
            "api_calls_detected": [],
            "navigation_paths": [],
            "errors": [],
            "screenshots": []
        }

    def log_feature(self, name: str, status: str, details: str = ""):
        self.results["features_found"].append({
            "name": name,
            "status": status,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })
        print(f"[{status}] {name}: {details}")

    def log_ui_element(self, element_type: str, text: str, selector: str = ""):
        self.results["ui_elements"].append({
            "type": element_type,
            "text": text,
            "selector": selector
        })

    def log_api_call(self, endpoint: str, method: str, status: str = ""):
        self.results["api_calls_detected"].append({
            "endpoint": endpoint,
            "method": method,
            "status": status,
            "timestamp": datetime.now().isoformat()
        })
        print(f"[API] {method} {endpoint} - {status}")

    def test_landing_page(self, page: Page):
        """Test the main landing page"""
        print("\n=== Testing Landing Page ===")
        page.goto("https://talorme.com")
        page.wait_for_load_state("networkidle")

        # Take screenshot
        page.screenshot(path="C:/Users/derri/projects/resume-ai-app/screenshots/landing_page.png")
        self.results["screenshots"].append("landing_page.png")

        # Check for main navigation elements
        nav_items = page.locator("nav a, nav button").all()
        for item in nav_items:
            try:
                text = item.inner_text()
                if text.strip():
                    self.log_ui_element("navigation", text.strip())
            except:
                pass

        # Check for call-to-action buttons
        cta_buttons = page.locator("button, a[href*='app'], a[href*='dashboard']").all()
        for btn in cta_buttons:
            try:
                text = btn.inner_text()
                if text.strip():
                    self.log_ui_element("cta_button", text.strip())
            except:
                pass

        self.log_feature("Landing Page", "FOUND", "Main landing page loaded successfully")

    def test_app_navigation(self, page: Page):
        """Test navigation to the app section"""
        print("\n=== Testing App Navigation ===")

        # Try to navigate to app/dashboard
        app_links = [
            "https://talorme.com/app",
            "https://talorme.com/dashboard",
            "https://talorme.com/interview-preps"
        ]

        for url in app_links:
            try:
                page.goto(url, timeout=10000)
                page.wait_for_load_state("networkidle", timeout=10000)

                # Check if we're redirected to login
                current_url = page.url
                if "login" in current_url.lower() or "auth" in current_url.lower():
                    self.log_feature(f"Navigation to {url}", "REQUIRES_AUTH", f"Redirected to: {current_url}")
                else:
                    self.log_feature(f"Navigation to {url}", "FOUND", f"Loaded: {current_url}")
                    page.screenshot(path=f"C:/Users/derri/projects/resume-ai-app/screenshots/{url.split('/')[-1]}.png")
                    self.results["screenshots"].append(f"{url.split('/')[-1]}.png")
            except Exception as e:
                self.log_feature(f"Navigation to {url}", "ERROR", str(e)[:100])

    def test_interview_prep_page(self, page: Page):
        """Test the interview prep page features"""
        print("\n=== Testing Interview Prep Page ===")

        # Navigate to interview prep
        try:
            page.goto("https://talorme.com/interview-preps", timeout=15000)
            page.wait_for_load_state("networkidle", timeout=15000)
            current_url = page.url

            # Take screenshot regardless of auth state
            page.screenshot(path="C:/Users/derri/projects/resume-ai-app/screenshots/interview_preps_page.png")
            self.results["screenshots"].append("interview_preps_page.png")

            # Check page content
            page_content = page.content()

            # Look for interview prep related elements
            interview_prep_selectors = [
                "text=Interview Prep",
                "text=Interview Preparation",
                "text=Company Profile",
                "text=Role Analysis",
                "text=Questions to Ask",
                "text=STAR Stories",
                "text=Practice Questions",
                "text=Common Questions",
                "text=Behavioral Questions",
                "text=Technical Questions",
                "text=Company Research",
                "text=Company News",
                "text=Values & Culture",
                "text=Candidate Positioning",
                "text=Interview Readiness"
            ]

            for selector in interview_prep_selectors:
                try:
                    if page.locator(selector).count() > 0:
                        self.log_feature(selector.replace("text=", ""), "FOUND", "UI element present")
                except:
                    pass

            # Look for action buttons
            button_selectors = [
                "button:has-text('Generate')",
                "button:has-text('Practice')",
                "button:has-text('Common Questions')",
                "button:has-text('STAR')",
                "button:has-text('Research')",
                "button:has-text('Refresh')",
                "button:has-text('Export')"
            ]

            for selector in button_selectors:
                try:
                    count = page.locator(selector).count()
                    if count > 0:
                        self.log_ui_element("action_button", selector.replace("button:has-text('", "").replace("')", ""))
                except:
                    pass

        except Exception as e:
            self.log_feature("Interview Prep Page", "ERROR", str(e)[:200])

    def test_api_endpoints_detection(self, page: Page):
        """Monitor network requests to detect API calls"""
        print("\n=== Monitoring API Endpoints ===")

        api_calls = []

        def handle_request(request):
            url = request.url
            if "api" in url.lower() or "interview" in url.lower():
                api_calls.append({
                    "url": url,
                    "method": request.method
                })

        page.on("request", handle_request)

        # Navigate through pages that might trigger API calls
        test_urls = [
            "https://talorme.com/app",
            "https://talorme.com/dashboard",
            "https://talorme.com/interview-preps",
            "https://talorme.com/interview"
        ]

        for url in test_urls:
            try:
                page.goto(url, timeout=10000)
                page.wait_for_load_state("networkidle", timeout=5000)
                time.sleep(1)  # Wait for any delayed API calls
            except:
                pass

        # Log detected API calls
        for call in api_calls:
            self.log_api_call(call["url"], call["method"], "detected")

    def test_all_site_pages(self, page: Page):
        """Test all pages on the site"""
        print("\n=== Testing All Site Pages ===")

        # Known pages from sitemap
        pages_to_test = [
            "/",
            "/app",
            "/dashboard",
            "/upload",
            "/tailor",
            "/interview-preps",
            "/interview",
            "/star-stories",
            "/saved-comparisons",
            "/career-path"
        ]

        for path in pages_to_test:
            full_url = f"https://talorme.com{path}"
            try:
                page.goto(full_url, timeout=10000)
                page.wait_for_load_state("domcontentloaded", timeout=10000)

                current_url = page.url
                title = page.title()

                # Check if redirected to auth
                requires_auth = "login" in current_url.lower() or "auth" in current_url.lower() or "signin" in current_url.lower()

                self.results["navigation_paths"].append({
                    "requested": full_url,
                    "actual": current_url,
                    "title": title,
                    "requires_auth": requires_auth
                })

                status = "REQUIRES_AUTH" if requires_auth else "ACCESSIBLE"
                self.log_feature(f"Page: {path}", status, f"Title: {title[:50] if title else 'N/A'}")

            except Exception as e:
                self.log_feature(f"Page: {path}", "ERROR", str(e)[:100])

    def analyze_page_structure(self, page: Page):
        """Deep analysis of page structure"""
        print("\n=== Analyzing Page Structure ===")

        try:
            page.goto("https://talorme.com", timeout=15000)
            page.wait_for_load_state("networkidle", timeout=10000)

            # Get all heading elements
            headings = page.locator("h1, h2, h3").all()
            for h in headings:
                try:
                    text = h.inner_text()
                    tag = h.evaluate("el => el.tagName")
                    if text.strip():
                        self.log_ui_element(f"heading_{tag}", text.strip()[:100])
                except:
                    pass

            # Get all form elements
            forms = page.locator("form").all()
            self.log_feature("Forms", "FOUND", f"{len(forms)} form(s) detected")

            # Get all input fields
            inputs = page.locator("input, textarea, select").all()
            for inp in inputs:
                try:
                    input_type = inp.get_attribute("type") or "text"
                    placeholder = inp.get_attribute("placeholder") or ""
                    name = inp.get_attribute("name") or ""
                    self.log_ui_element("input", f"{input_type}: {name or placeholder}")
                except:
                    pass

            # Look for modals/dialogs
            modals = page.locator("[role='dialog'], .modal, [class*='modal']").all()
            self.log_feature("Modals", "FOUND" if modals else "NONE", f"{len(modals)} modal(s) detected")

        except Exception as e:
            self.log_feature("Page Structure Analysis", "ERROR", str(e)[:200])

    def save_results(self):
        """Save test results to JSON file"""
        output_path = "C:/Users/derri/projects/resume-ai-app/playwright_test_results.json"
        with open(output_path, "w") as f:
            json.dump(self.results, f, indent=2)
        print(f"\n=== Results saved to {output_path} ===")
        return output_path

    def run_all_tests(self):
        """Run all feature tests"""
        print("=" * 60)
        print("INTERVIEW PREP FEATURE TESTING - TALORME.COM")
        print("=" * 60)

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                viewport={"width": 1920, "height": 1080},
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            )
            page = context.new_page()

            # Run tests
            self.test_landing_page(page)
            self.test_all_site_pages(page)
            self.test_app_navigation(page)
            self.test_interview_prep_page(page)
            self.test_api_endpoints_detection(page)
            self.analyze_page_structure(page)

            browser.close()

        # Save results
        return self.save_results()


if __name__ == "__main__":
    import os

    # Create screenshots directory
    os.makedirs("C:/Users/derri/projects/resume-ai-app/screenshots", exist_ok=True)

    tester = InterviewPrepFeatureTester()
    results_path = tester.run_all_tests()

    # Print summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    print(f"Features Found: {len(tester.results['features_found'])}")
    print(f"UI Elements: {len(tester.results['ui_elements'])}")
    print(f"API Calls Detected: {len(tester.results['api_calls_detected'])}")
    print(f"Navigation Paths: {len(tester.results['navigation_paths'])}")
    print(f"Screenshots: {len(tester.results['screenshots'])}")
    print(f"Errors: {len(tester.results['errors'])}")
