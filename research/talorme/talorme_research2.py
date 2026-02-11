# -*- coding: utf-8 -*-
import sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

from playwright.sync_api import sync_playwright
import json
import time

def safe_print(text):
    try:
        print(text)
    except UnicodeEncodeError:
        print(text.encode('ascii', 'replace').decode('ascii'))

def research_talorme_app():
    results = {
        'pages_visited': [],
        'api_calls': [],
        'ui_elements': {},
        'interview_prep': {}
    }
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()
        
        # Track all API calls
        api_calls = []
        def handle_request(request):
            api_calls.append({
                'url': request.url,
                'method': request.method,
                'resource_type': request.resource_type
            })
        
        page.on('request', handle_request)
        
        # Navigate to talorme.com
        safe_print('=== NAVIGATING TO TALORME.COM ===')
        page.goto('https://talorme.com', wait_until='networkidle', timeout=60000)
        time.sleep(2)
        
        # Click Get Started button
        safe_print('')
        safe_print('=== CLICKING GET STARTED ===')
        get_started_btn = page.query_selector('button:has-text("Get Started")')
        if get_started_btn:
            get_started_btn.click()
            time.sleep(3)
            page.wait_for_load_state('networkidle')
            safe_print('New URL: ' + page.url)
            results['pages_visited'].append({'name': 'after_get_started', 'url': page.url})
        
        # Take screenshot and analyze page
        safe_print('')
        safe_print('=== ANALYZING APP PAGE ===')
        safe_print('Current URL: ' + page.url)
        safe_print('Page title: ' + page.title())
        
        # Get all visible text elements
        headings = page.query_selector_all('h1, h2, h3, h4')
        safe_print('')
        safe_print('Headings on this page:')
        for h in headings[:20]:
            text = h.inner_text().strip().replace('\n', ' ')
            if text:
                tag = h.evaluate('el => el.tagName')
                safe_print('  ' + tag + ': ' + text[:150])
        
        # Look for navigation/sidebar
        nav_items = page.query_selector_all('nav a, aside a, [role="navigation"] a')
        safe_print('')
        safe_print('Navigation items: ' + str(len(nav_items)))
        for nav in nav_items[:20]:
            text = nav.inner_text().strip().replace('\n', ' ')
            href = nav.get_attribute('href') or ''
            if text:
                safe_print('  Nav: ' + text + ' --> ' + href)
        
        # Look for all links on the page
        all_links = page.query_selector_all('a')
        safe_print('')
        safe_print('All links: ' + str(len(all_links)))
        for link in all_links[:30]:
            text = link.inner_text().strip().replace('\n', ' ')
            href = link.get_attribute('href') or ''
            if text and len(text) < 100:
                safe_print('  Link: ' + text + ' --> ' + href)
        
        # Look for buttons
        buttons = page.query_selector_all('button')
        safe_print('')
        safe_print('Buttons: ' + str(len(buttons)))
        for btn in buttons[:20]:
            text = btn.inner_text().strip().replace('\n', ' ')
            if text and len(text) < 100:
                safe_print('  Button: ' + text)
        
        # Look for interview-related content
        html = page.content()
        if 'interview' in html.lower():
            safe_print('')
            safe_print('=== INTERVIEW CONTENT FOUND ===')
            body_text = page.inner_text('body')
            lines = body_text.split('\n')
            for line in lines:
                if 'interview' in line.lower() and len(line.strip()) > 5:
                    safe_print('  ' + line.strip()[:200])
        
        # Check for tabs, accordions, or other UI components
        safe_print('')
        safe_print('=== UI COMPONENTS ===')
        
        tabs = page.query_selector_all('[role="tab"], [data-tab], .tab, .tabs button')
        safe_print('Tabs found: ' + str(len(tabs)))
        for tab in tabs[:10]:
            text = tab.inner_text().strip()
            if text:
                safe_print('  Tab: ' + text)
        
        accordions = page.query_selector_all('[role="button"][aria-expanded], details, .accordion')
        safe_print('Accordions found: ' + str(len(accordions)))
        
        cards = page.query_selector_all('.card, [class*="card"]')
        safe_print('Cards found: ' + str(len(cards)))
        
        # Try navigating to different routes
        safe_print('')
        safe_print('=== TRYING DIFFERENT ROUTES ===')
        
        routes_to_try = [
            '/interview',
            '/interview-prep',
            '/dashboard',
            '/app',
            '/resumes',
            '/jobs'
        ]
        
        base_url = 'https://talorme.com'
        for route in routes_to_try:
            try:
                page.goto(base_url + route, wait_until='networkidle', timeout=10000)
                safe_print('Route ' + route + ' --> ' + page.url + ' (title: ' + page.title() + ')')
                results['pages_visited'].append({'route': route, 'url': page.url, 'title': page.title()})
            except Exception as e:
                safe_print('Route ' + route + ' --> Error: ' + str(e)[:50])
        
        # Print API calls
        safe_print('')
        safe_print('=== API CALLS ===')
        for call in api_calls:
            if 'api' in call['url'].lower() or call['method'] == 'POST':
                safe_print('  ' + call['method'] + ' ' + call['url'])
        
        results['api_calls'] = api_calls
        
        # Save results
        with open('C:/Users/derri/talorme_app_research.json', 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        safe_print('')
        safe_print('=== RESULTS SAVED ===')
        
        browser.close()
        return results

if __name__ == '__main__':
    research_talorme_app()
