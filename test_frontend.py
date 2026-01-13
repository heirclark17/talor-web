"""
Playwright test to verify interview prep sections display on frontend
"""
import asyncio
import sys
import io
from playwright.async_api import async_playwright

# Fix Unicode encoding for Windows console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

async def test_interview_prep():
    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()

        try:
            # Navigate to frontend - Based on GitHub repo: talor-web
            # Trying: https://talor-web.vercel.app
            frontend_url = "https://talor-web.vercel.app"

            print(f"Attempting to navigate to {frontend_url}...")
            print("If this fails, update the frontend_url variable with your actual Vercel URL")
            await page.goto(frontend_url, wait_until="networkidle", timeout=30000)

            # Wait a moment for page to load
            await page.wait_for_timeout(2000)

            # Try to navigate to interview prep page directly
            interview_prep_url = f"{frontend_url}/interview-prep/39"
            print(f"\nNavigating to interview prep page: {interview_prep_url}")
            await page.goto(interview_prep_url, wait_until="networkidle", timeout=60000)

            # Wait for page to fully load
            await page.wait_for_timeout(5000)

            # Check page title
            title = await page.title()
            print(f"\nPage Title: {title}")

            # Check for loading indicator
            loading = await page.query_selector('text="Loading Interview Prep"')
            if loading:
                print("\n⏳ Page is still loading, waiting...")
                await page.wait_for_timeout(10000)

            # Check for error messages
            error = await page.query_selector('text="Error Loading Interview Prep"')
            if error:
                error_text = await error.inner_text()
                print(f"\n❌ Error detected: {error_text}")
                await page.screenshot(path="frontend_error.png")
                return

            # Get page content
            content = await page.content()

            # Check for main sections
            print("\n=== CHECKING SECTIONS ===")

            # 1. Check Company Profile
            company_profile = await page.query_selector('text="Company Profile"')
            print(f"✓ Company Profile section: {'FOUND' if company_profile else 'NOT FOUND'}")

            # 2. Check Role Analysis
            role_analysis = await page.query_selector('text="Role Analysis"')
            print(f"✓ Role Analysis section: {'FOUND' if role_analysis else 'NOT FOUND'}")

            # 3. Check Values & Culture (THE KEY SECTION)
            values_culture = await page.query_selector('text="Values & Culture"')
            print(f"\n⭐ Values & Culture section: {'FOUND ✅' if values_culture else 'NOT FOUND ❌'}")

            if values_culture:
                # Check for specific values
                customer_obsession = await page.query_selector('text="Customer Obsession"')
                ownership = await page.query_selector('text="Ownership"')
                invent = await page.query_selector('text="Invent and Simplify"')

                print(f"   - Customer Obsession: {'FOUND' if customer_obsession else 'NOT FOUND'}")
                print(f"   - Ownership: {'FOUND' if ownership else 'NOT FOUND'}")
                print(f"   - Invent and Simplify: {'FOUND' if invent else 'NOT FOUND'}")

                # Check for practical implications
                practical = await page.query_selector('text="Practical Implications"')
                print(f"   - Practical Implications: {'FOUND' if practical else 'NOT FOUND'}")

            # 4. Check Strategy & News (THE KEY SECTION)
            strategy_news = await page.query_selector('text="Strategy & Recent News"')
            print(f"\n📈 Strategy & Recent News section: {'FOUND ✅' if strategy_news else 'NOT FOUND ❌'}")

            if strategy_news:
                # Check for specific content
                recent_events = await page.query_selector('text="Recent Events"')
                strategic_themes = await page.query_selector('text="Strategic Themes"')
                aws_security = await page.query_selector('text="AWS Security"')

                print(f"   - Recent Events: {'FOUND' if recent_events else 'NOT FOUND'}")
                print(f"   - Strategic Themes: {'FOUND' if strategic_themes else 'NOT FOUND'}")
                print(f"   - AWS Security mention: {'FOUND' if aws_security else 'NOT FOUND'}")

            # 5. Check Interview Preparation
            interview_prep = await page.query_selector('text="Interview Preparation"')
            print(f"\n✓ Interview Preparation section: {'FOUND' if interview_prep else 'NOT FOUND'}")

            # 6. Check Practice Questions
            practice_q = await page.query_selector('text="Practice Questions"')
            print(f"✓ Practice Questions section: {'FOUND' if practice_q else 'NOT FOUND'}")

            # Take screenshots
            print("\n📸 Taking screenshots...")
            await page.screenshot(path="frontend_full_page.png", full_page=True)
            print("   - Saved: frontend_full_page.png")

            # Scroll to Values & Culture section if it exists
            if values_culture:
                await values_culture.scroll_into_view_if_needed()
                await page.wait_for_timeout(1000)
                await page.screenshot(path="frontend_values_section.png")
                print("   - Saved: frontend_values_section.png")

            # Scroll to Strategy & News section if it exists
            if strategy_news:
                await strategy_news.scroll_into_view_if_needed()
                await page.wait_for_timeout(1000)
                await page.screenshot(path="frontend_strategy_section.png")
                print("   - Saved: frontend_strategy_section.png")

            # Check if sections are in HTML but maybe hidden
            print("\n=== CHECKING HTML SOURCE ===")
            html = await page.content()
            print(f"'Values & Culture' in HTML: {'YES' if 'Values & Culture' in html or 'Values &amp; Culture' in html else 'NO'}")
            print(f"'Strategy & Recent News' in HTML: {'YES' if 'Strategy & Recent News' in html or 'Strategy &amp; Recent News' in html else 'NO'}")
            print(f"'Customer Obsession' in HTML: {'YES' if 'Customer Obsession' in html else 'NO'}")

            # Final verdict
            print("\n=== FINAL VERDICT ===")
            if values_culture and strategy_news:
                print("✅ SUCCESS! Both sections are visible on the frontend!")
            elif values_culture or strategy_news:
                print("⚠️ PARTIAL: One section visible, one missing")
            else:
                print("❌ FAILURE: Neither section is visible on the frontend")

            # Keep browser open for manual inspection
            print("\n⏸️  Browser will stay open for 30 seconds for manual inspection...")
            await page.wait_for_timeout(30000)

        except Exception as e:
            print(f"\n❌ Error during test: {e}")
            import traceback
            traceback.print_exc()
            await page.screenshot(path="frontend_error.png")

        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(test_interview_prep())
