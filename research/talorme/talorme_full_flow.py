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

def explore_tailor_page():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()
        
        api_calls = []
        responses = []
        
        def handle_request(request):
            api_calls.append({
                'url': request.url,
                'method': request.method,
                'post_data': request.post_data if request.method == 'POST' else None
            })
        
        def handle_response(response):
            if 'api' in response.url or 'railway.app' in response.url:
                try:
                    body = response.text()
                except:
                    body = None
                responses.append({
                    'url': response.url,
                    'status': response.status,
                    'body_preview': body[:1000] if body else None
                })
        
        page.on('request', handle_request)
        page.on('response', handle_response)
        
        # Navigate to tailor page
        safe_print('=== NAVIGATING TO TAILOR PAGE ===')
        page.goto('https://talorme.com/tailor', wait_until='networkidle', timeout=60000)
        time.sleep(3)
        
        safe_print('URL: ' + page.url)
        safe_print('Title: ' + page.title())
        
        # Headings
        headings = page.query_selector_all('h1, h2, h3, h4, h5')
        safe_print('')
        safe_print('Headings:')
        for h in headings[:30]:
            text = h.inner_text().strip().replace('\n', ' ')
            if text:
                tag = h.evaluate('el => el.tagName')
                safe_print('  ' + tag + ': ' + text[:200])
        
        # Buttons
        buttons = page.query_selector_all('button')
        safe_print('')
        safe_print('Buttons: ' + str(len(buttons)))
        for btn in buttons[:20]:
            text = btn.inner_text().strip().replace('\n', ' ')
            if text and len(text) < 100:
                safe_print('  Button: ' + text)
        
        # Full page text
        safe_print('')
        safe_print('=== FULL PAGE TEXT ===')
        body_text = page.inner_text('body')
        safe_print(body_text[:3000])
        
        # Screenshot
        page.screenshot(path='C:/Users/derri/talorme_tailor_page.png', full_page=True)
        safe_print('')
        safe_print('Screenshot saved: talorme_tailor_page.png')
        
        # Now check saved-comparisons page (might have existing tailored resumes)
        safe_print('')
        safe_print('=== NAVIGATING TO SAVED COMPARISONS ===')
        page.goto('https://talorme.com/saved-comparisons', wait_until='networkidle', timeout=60000)
        time.sleep(3)
        
        safe_print('URL: ' + page.url)
        body_text = page.inner_text('body')
        safe_print(body_text[:3000])
        
        page.screenshot(path='C:/Users/derri/talorme_saved.png', full_page=True)
        
        # Check STAR Stories page
        safe_print('')
        safe_print('=== NAVIGATING TO STAR STORIES ===')
        page.goto('https://talorme.com/star-stories', wait_until='networkidle', timeout=60000)
        time.sleep(3)
        
        safe_print('URL: ' + page.url)
        body_text = page.inner_text('body')
        safe_print(body_text[:2000])
        
        # Check Career Path page
        safe_print('')
        safe_print('=== NAVIGATING TO CAREER PATH ===')
        page.goto('https://talorme.com/career-path', wait_until='networkidle', timeout=60000)
        time.sleep(3)
        
        safe_print('URL: ' + page.url)
        body_text = page.inner_text('body')
        safe_print(body_text[:2000])
        
        # API calls
        safe_print('')
        safe_print('=== API CALLS ===')
        for call in api_calls:
            if 'railway.app' in call['url'] or 'api' in call['url']:
                safe_print('  ' + call['method'] + ' ' + call['url'])
                if call['post_data']:
                    safe_print('    POST data: ' + str(call['post_data'])[:200])
        
        safe_print('')
        safe_print('=== API RESPONSES ===')
        for resp in responses[:20]:
            safe_print('  ' + str(resp['status']) + ' ' + resp['url'])
            if resp['body_preview']:
                safe_print('    Body: ' + resp['body_preview'][:300])
        
        browser.close()

if __name__ == '__main__':
    explore_tailor_page()
