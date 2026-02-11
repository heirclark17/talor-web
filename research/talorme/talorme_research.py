# -*- coding: utf-8 -*-
import sys
import io

# Force UTF-8 output
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

from playwright.sync_api import sync_playwright
import json
import time

def safe_print(text):
    """Print text safely, replacing problematic characters"""
    try:
        print(text)
    except UnicodeEncodeError:
        print(text.encode('ascii', 'replace').decode('ascii'))

def research_talorme():
    results = {
        'homepage': {},
        'links': [],
        'buttons': [],
        'headings': [],
        'api_calls': [],
        'interview_references': []
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
        safe_print('Page title: ' + page.title())
        safe_print('URL: ' + page.url)
        
        results['homepage']['title'] = page.title()
        results['homepage']['url'] = page.url
        
        time.sleep(3)
        
        safe_print('')
        safe_print('=== HOMEPAGE CONTENT ===')
        
        # Look for all links
        all_links = page.query_selector_all('a')
        safe_print('')
        safe_print('All links found: ' + str(len(all_links)))
        for link in all_links[:40]:
            href = link.get_attribute('href') or ''
            text = link.inner_text().strip().replace('\n', ' ')
            if text and len(text) < 100:
                safe_print('  Link: ' + text + ' --> ' + href)
                results['links'].append({'text': text, 'href': href})
        
        # Look for buttons
        buttons = page.query_selector_all('button')
        safe_print('')
        safe_print('Buttons found: ' + str(len(buttons)))
        for btn in buttons[:15]:
            text = btn.inner_text().strip().replace('\n', ' ')
            if text and len(text) < 100:
                safe_print('  Button: ' + text)
                results['buttons'].append(text)
        
        # Get headings
        headings = page.query_selector_all('h1, h2, h3')
        safe_print('')
        safe_print('Headings:')
        for h in headings[:25]:
            text = h.inner_text().strip().replace('\n', ' ')
            if text:
                tag = h.evaluate('el => el.tagName')
                safe_print('  ' + tag + ': ' + text[:150])
                results['headings'].append({'tag': tag, 'text': text[:150]})
        
        # Look for interview references in HTML
        html = page.content()
        if 'interview' in html.lower():
            safe_print('')
            safe_print('=== INTERVIEW REFERENCES FOUND IN HTML ===')
            # Find elements mentioning interview
            interview_elements = page.query_selector_all('*')
            for el in interview_elements[:500]:
                try:
                    text = el.inner_text()
                    if 'interview' in text.lower() and len(text) < 500:
                        safe_print('  Found: ' + text[:200].replace('\n', ' '))
                        results['interview_references'].append(text[:200])
                except:
                    pass
        
        # Print API calls
        safe_print('')
        safe_print('=== API CALLS ===')
        for call in api_calls[:30]:
            safe_print('  ' + call['method'] + ' ' + call['url'])
            results['api_calls'].append(call)
        
        # Save results to JSON
        with open('C:/Users/derri/talorme_homepage_research.json', 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        safe_print('')
        safe_print('=== RESULTS SAVED TO talorme_homepage_research.json ===')
        
        browser.close()
        return results

if __name__ == '__main__':
    research_talorme()
