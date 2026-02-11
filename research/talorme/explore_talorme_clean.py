import asyncio
import json
from playwright.async_api import async_playwright

async def explore_talorme():
    """Deep dive into talorme.com to understand all interview prep features and API endpoints"""

    results = {
        "features": [],
        "api_endpoints": [],
        "ui_elements": [],
        "network_calls": [],
        "errors": []
    }

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        )

        # Track network requests
        page = await context.new_page()

        async def handle_request(request):
            if '/api/' in request.url:
                results["network_calls"].append({
                    "method": request.method,
                    "url": request.url,
                    "headers": dict(request.headers),
                    "post_data": request.post_data if request.method == "POST" else None
                })
                print(f" API Call: {request.method} {request.url}")

        async def handle_response(response):
            if '/api/' in response.url:
                try:
                    body = await response.text()
                    results["api_endpoints"].append({
                        "url": response.url,
                        "status": response.status,
                        "response_preview": body[:500] if body else None
                    })
                    print(f" Response: {response.status} {response.url}")
                except:
                    pass

        page.on("request", handle_request)
        page.on("response", handle_response)

        print("[+] Navigating to talorme.com...")
        await page.goto('https://talorme.com', wait_until='networkidle')
        await page.wait_for_timeout(3000)

        # Take screenshot of homepage
        await page.screenshot(path='talorme_homepage.png')
        print(" Screenshot saved: talorme_homepage.png")

        # Look for navigation and click through sections
        print("\n Exploring navigation...")
        nav_links = await page.locator('nav a, [role="navigation"] a').all()

        for link in nav_links:
            try:
                text = await link.text_content()
                href = await link.get_attribute('href')
                results["ui_elements"].append({
                    "type": "nav_link",
                    "text": text,
                    "href": href
                })
                print(f"   Navigation: {text} -> {href}")
            except:
                pass

        # Try to navigate to Interview Prep section
        print("\n Looking for Interview Prep section...")
        interview_prep_selectors = [
            'text="Interview Prep"',
            'text="interview prep"',
            'text="Interview"',
            '[href*="interview"]',
            '[href*="prep"]'
        ]

        for selector in interview_prep_selectors:
            try:
                element = page.locator(selector).first
                if await element.count() > 0:
                    print(f"   Found element with selector: {selector}")
                    await element.click()
                    await page.wait_for_timeout(2000)
                    await page.screenshot(path='talorme_interview_prep.png')
                    print("   Screenshot saved: talorme_interview_prep.png")
                    break
            except Exception as e:
                print(f"   Selector {selector} failed: {str(e)}")

        # Explore page content
        print("\n Analyzing page content...")

        # Look for buttons, forms, interactive elements
        buttons = await page.locator('button').all()
        for i, btn in enumerate(buttons[:10]):  # First 10 buttons
            try:
                text = await btn.text_content()
                role = await btn.get_attribute('role')
                aria_label = await btn.get_attribute('aria-label')
                results["ui_elements"].append({
                    "type": "button",
                    "text": text.strip() if text else None,
                    "role": role,
                    "aria_label": aria_label
                })
                print(f"   Button {i+1}: {text.strip() if text else aria_label or 'No label'}")
            except:
                pass

        # Look for forms
        forms = await page.locator('form').all()
        print(f"\n Found {len(forms)} forms on page")
        for i, form in enumerate(forms):
            try:
                inputs = await form.locator('input, textarea, select').all()
                input_details = []
                for inp in inputs:
                    inp_type = await inp.get_attribute('type')
                    inp_name = await inp.get_attribute('name')
                    inp_placeholder = await inp.get_attribute('placeholder')
                    input_details.append({
                        "type": inp_type,
                        "name": inp_name,
                        "placeholder": inp_placeholder
                    })
                results["ui_elements"].append({
                    "type": "form",
                    "index": i,
                    "inputs": input_details
                })
                print(f"   Form {i+1} has {len(inputs)} inputs")
            except:
                pass

        # Try to navigate to Tailor page
        print("\n Navigating to Tailor page...")
        try:
            tailor_link = page.locator('text="Tailor"').first
            if await tailor_link.count() > 0:
                await tailor_link.click()
                await page.wait_for_timeout(2000)
                await page.screenshot(path='talorme_tailor.png')
                print("   Screenshot saved: talorme_tailor.png")

                # Look for "Generate Interview Prep" or similar buttons
                prep_buttons = await page.locator('button:has-text("Prep"), button:has-text("Interview"), button:has-text("Generate")').all()
                for btn in prep_buttons:
                    text = await btn.text_content()
                    print(f"   Found action button: {text}")
        except Exception as e:
            print(f"   Could not navigate to Tailor: {str(e)}")

        # Try to find STAR Stories page
        print("\n Looking for STAR Stories...")
        try:
            star_link = page.locator('text="STAR"').first
            if await star_link.count() > 0:
                await star_link.click()
                await page.wait_for_timeout(2000)
                await page.screenshot(path='talorme_star_stories.png')
                print("   Screenshot saved: talorme_star_stories.png")
        except Exception as e:
            print(f"   Could not navigate to STAR Stories: {str(e)}")

        # Try to find Career Path page
        print("\n  Looking for Career Path...")
        try:
            career_link = page.locator('text="Career"').first
            if await career_link.count() > 0:
                await career_link.click()
                await page.wait_for_timeout(2000)
                await page.screenshot(path='talorme_career.png')
                print("   Screenshot saved: talorme_career.png")
        except Exception as e:
            print(f"   Could not navigate to Career Path: {str(e)}")

        # Get page source to analyze structure
        print("\n Extracting page structure...")
        page_content = await page.content()

        # Look for React root and data
        scripts = await page.locator('script').all()
        for script in scripts:
            try:
                content = await script.text_content()
                if content and ('window.__INITIAL_STATE__' in content or 'window.__DATA__' in content):
                    results["features"].append({
                        "type": "initial_state",
                        "preview": content[:500]
                    })
                    print("   Found initial state data")
            except:
                pass

        print("\n Waiting to observe more network activity...")
        await page.wait_for_timeout(5000)

        await browser.close()

    # Save results to file
    with open('talorme_exploration_results.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print("\n Exploration complete!")
    print(f" Found {len(results['network_calls'])} network calls")
    print(f" Found {len(results['api_endpoints'])} API responses")
    print(f" Found {len(results['ui_elements'])} UI elements")
    print(f" Results saved to: talorme_exploration_results.json")

    return results

if __name__ == "__main__":
    asyncio.run(explore_talorme())
