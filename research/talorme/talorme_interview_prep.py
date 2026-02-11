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

def research_interview_prep():
    results = {
        'page_structure': {},
        'ui_components': {},
        'api_calls': [],
        'content_sections': [],
    }
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()
        
        api_calls = []
        def handle_request(request):
            api_calls.append({
                'url': request.url,
                'method': request.method,
            })
        
        page.on('request', handle_request)
        
        safe_print('=== NAVIGATING TO INTERVIEW PREP PAGE ===')
        page.goto('https://talorme.com/interview-preps', wait_until='networkidle', timeout=60000)
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
        
        # Lists
        lists = page.query_selector_all('ul, ol')
        safe_print('')
        safe_print('Lists: ' + str(len(lists)))
        for lst in lists[:5]:
            items = lst.query_selector_all('li')
            safe_print('  List with ' + str(len(items)) + ' items')
        
        # Full page text
        safe_print('')
        safe_print('=== FULL PAGE TEXT ===')
        body_text = page.inner_text('body')
        safe_print(body_text[:4000])
        
        # Screenshot
        page.screenshot(path='C:/Users/derri/talorme_interview_prep.png', full_page=True)
        safe_print('')
        safe_print('Screenshot saved')
        
        # API calls
        safe_print('')
        safe_print('=== API CALLS ===')
        for call in api_calls:
            safe_print('  ' + call['method'] + ' ' + call['url'])
        
        browser.close()

if __name__ == '__main__':
    research_interview_prep()
