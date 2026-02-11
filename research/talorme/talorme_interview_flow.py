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

def interview_prep_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()
        
        api_calls = []
        api_responses = []
        
        def handle_request(request):
            api_calls.append({
                'url': request.url,
                'method': request.method,
                'post_data': request.post_data if request.method == 'POST' else None
            })
        
        def handle_response(response):
            if 'railway.app' in response.url:
                try:
                    body = response.text()
                except:
                    body = None
                api_responses.append({
                    'url': response.url,
                    'status': response.status,
                    'body': body
                })
        
        page.on('request', handle_request)
        page.on('response', handle_response)
        
        # Go to tailor page
        safe_print('=' * 60)
        safe_print('TAILOR PAGE - SELECT RESUME AND JOB')
        safe_print('=' * 60)
        page.goto('https://talorme.com/tailor', wait_until='networkidle', timeout=60000)
        time.sleep(3)
        
        # Select the resume
        resume_checkbox = page.query_selector('input[type="checkbox"]')
        if resume_checkbox:
            resume_checkbox.click()
            safe_print('Selected resume')
            time.sleep(1)
        
        # Fill job URL with a real job posting
        job_url_input = page.query_selector('input[placeholder*="URL"], input[name*="url"]')
        if not job_url_input:
            # Try different selector
            inputs = page.query_selector_all('input')
            for inp in inputs:
                placeholder = inp.get_attribute('placeholder') or ''
                if 'url' in placeholder.lower() or 'job' in placeholder.lower():
                    job_url_input = inp
                    break
        
        if job_url_input:
            # Use a real LinkedIn job URL for testing
            job_url = 'https://www.linkedin.com/jobs/view/4131576313'
            job_url_input.fill(job_url)
            safe_print('Filled job URL: ' + job_url)
            time.sleep(1)
            
            # Click Extract Details
            extract_btn = page.query_selector('button:has-text("Extract")')
            if extract_btn:
                extract_btn.click()
                safe_print('Clicked Extract Details')
                time.sleep(10)  # Wait for extraction
                page.wait_for_load_state('networkidle')
        
        body_text = page.inner_text('body')
        safe_print('')
        safe_print('Page after extraction:')
        safe_print(body_text[:2500])
        
        page.screenshot(path='C:/Users/derri/talorme_after_extract.png', full_page=True)
        
        # Now click Generate Tailored Resume
        safe_print('')
        safe_print('=' * 60)
        safe_print('GENERATING TAILORED RESUME')
        safe_print('=' * 60)
        
        generate_btn = page.query_selector('button:has-text("Generate Tailored Resume")')
        if generate_btn:
            generate_btn.click()
            safe_print('Clicked Generate Tailored Resume')
            
            # Wait for generation (this might take a while)
            safe_print('Waiting for generation...')
            time.sleep(30)  # AI generation takes time
            
            # Check if page changed
            safe_print('Current URL: ' + page.url)
            body_text = page.inner_text('body')
            safe_print('')
            safe_print('Page content:')
            safe_print(body_text[:3000])
            
            page.screenshot(path='C:/Users/derri/talorme_after_generate.png', full_page=True)
        
        # Print all API calls
        safe_print('')
        safe_print('=' * 60)
        safe_print('ALL API CALLS')
        safe_print('=' * 60)
        for call in api_calls:
            if 'railway.app' in call['url']:
                safe_print(call['method'] + ' ' + call['url'])
        
        # Print API responses
        safe_print('')
        safe_print('=' * 60)
        safe_print('API RESPONSES')
        safe_print('=' * 60)
        for resp in api_responses:
            safe_print(str(resp['status']) + ' ' + resp['url'])
            if resp['body'] and len(resp['body']) > 100:
                # Parse JSON if possible
                try:
                    data = json.loads(resp['body'])
                    safe_print('  Keys: ' + str(list(data.keys())[:10]))
                    safe_print('  Preview: ' + resp['body'][:800])
                except:
                    safe_print('  Body: ' + resp['body'][:500])
        
        browser.close()

if __name__ == '__main__':
    interview_prep_flow()
