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

def complete_user_journey():
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
                    'body': body[:2000] if body else None
                })
        
        page.on('request', handle_request)
        page.on('response', handle_response)
        
        # STEP 1: Upload page
        safe_print('=' * 60)
        safe_print('STEP 1: UPLOAD PAGE')
        safe_print('=' * 60)
        page.goto('https://talorme.com/upload', wait_until='networkidle', timeout=60000)
        time.sleep(2)
        
        safe_print('URL: ' + page.url)
        body_text = page.inner_text('body')
        safe_print(body_text[:1500])
        
        # Check for file upload input
        file_input = page.query_selector('input[type="file"]')
        if file_input:
            safe_print('')
            safe_print('File input found!')
            accept = file_input.get_attribute('accept') or ''
            safe_print('  Accept types: ' + accept)
        
        page.screenshot(path='C:/Users/derri/talorme_step1_upload.png', full_page=True)
        
        # Try uploading the sample resume
        safe_print('')
        safe_print('Attempting to upload resume...')
        resume_path = 'C:/Users/derri/Downloads/Justin_Washington_Cyber_PM_Resume.docx'
        
        try:
            # Look for the file input
            file_inputs = page.query_selector_all('input[type="file"]')
            safe_print('File inputs found: ' + str(len(file_inputs)))
            
            if file_inputs:
                file_inputs[0].set_input_files(resume_path)
                safe_print('File uploaded!')
                time.sleep(5)  # Wait for processing
                page.wait_for_load_state('networkidle')
                
                body_text = page.inner_text('body')
                safe_print('')
                safe_print('Page after upload:')
                safe_print(body_text[:1500])
                
                page.screenshot(path='C:/Users/derri/talorme_step1b_after_upload.png', full_page=True)
        except Exception as e:
            safe_print('Upload error: ' + str(e))
        
        # STEP 2: Tailor page
        safe_print('')
        safe_print('=' * 60)
        safe_print('STEP 2: TAILOR PAGE')
        safe_print('=' * 60)
        page.goto('https://talorme.com/tailor', wait_until='networkidle', timeout=60000)
        time.sleep(3)
        
        body_text = page.inner_text('body')
        safe_print(body_text[:2000])
        
        page.screenshot(path='C:/Users/derri/talorme_step2_tailor.png', full_page=True)
        
        # Try to fill in job URL
        job_url_input = page.query_selector('input[placeholder*="URL"], input[name*="url"], input[type="url"]')
        if job_url_input:
            safe_print('')
            safe_print('Found job URL input')
            sample_job_url = 'https://www.linkedin.com/jobs/view/3801234567'
            job_url_input.fill(sample_job_url)
            safe_print('Filled job URL: ' + sample_job_url)
            
            # Click Extract Details button
            extract_btn = page.query_selector('button:has-text("Extract Details")')
            if extract_btn:
                safe_print('Clicking Extract Details...')
                extract_btn.click()
                time.sleep(5)
                page.wait_for_load_state('networkidle')
                
                body_text = page.inner_text('body')
                safe_print('')
                safe_print('After extraction:')
                safe_print(body_text[:2000])
        
        # Print API calls so far
        safe_print('')
        safe_print('=' * 60)
        safe_print('API CALLS SO FAR')
        safe_print('=' * 60)
        for call in api_calls:
            if 'railway.app' in call['url']:
                safe_print(call['method'] + ' ' + call['url'])
                if call['post_data']:
                    safe_print('  Data: ' + str(call['post_data'])[:300])
        
        safe_print('')
        safe_print('API RESPONSES:')
        for resp in api_responses:
            safe_print(str(resp['status']) + ' ' + resp['url'])
            if resp['body']:
                safe_print('  Body: ' + resp['body'][:500])
        
        browser.close()

if __name__ == '__main__':
    complete_user_journey()
