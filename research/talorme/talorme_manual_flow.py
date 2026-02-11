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

def manual_interview_flow():
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
        
        # First upload a resume
        safe_print('=' * 60)
        safe_print('STEP 1: UPLOAD RESUME')
        safe_print('=' * 60)
        page.goto('https://talorme.com/upload', wait_until='networkidle', timeout=60000)
        time.sleep(2)
        
        # Upload the resume
        file_input = page.query_selector('input[type="file"]')
        if file_input:
            resume_path = 'C:/Users/derri/Downloads/Justin_Washington_Cyber_PM_Resume.docx'
            file_input.set_input_files(resume_path)
            safe_print('Uploading resume...')
            time.sleep(8)  # Wait for upload and parsing
            page.wait_for_load_state('networkidle')
            safe_print('Resume uploaded!')
        
        # Go to tailor page
        safe_print('')
        safe_print('=' * 60)
        safe_print('STEP 2: TAILOR PAGE')
        safe_print('=' * 60)
        page.goto('https://talorme.com/tailor', wait_until='networkidle', timeout=60000)
        time.sleep(3)
        
        body_text = page.inner_text('body')
        safe_print(body_text[:1500])
        
        # Select the resume checkbox
        checkbox = page.query_selector('input[type="checkbox"]')
        if checkbox:
            checkbox.click()
            safe_print('')
            safe_print('Selected resume checkbox')
            time.sleep(1)
        
        # Fill job URL
        inputs = page.query_selector_all('input')
        safe_print('')
        safe_print('Found ' + str(len(inputs)) + ' inputs')
        for inp in inputs:
            placeholder = inp.get_attribute('placeholder') or ''
            inp_type = inp.get_attribute('type') or 'text'
            name = inp.get_attribute('name') or ''
            safe_print('  Input: type=' + inp_type + ', name=' + name + ', placeholder=' + placeholder[:50])
        
        # Fill in the form fields manually
        # Job URL
        job_url_input = page.query_selector('input[placeholder*="linkedin"], input[placeholder*="URL"]')
        if job_url_input:
            job_url_input.fill('https://www.linkedin.com/jobs/view/4131576313')
            safe_print('Filled job URL')
        
        # Company Name
        company_input = page.query_selector('input[placeholder*="company"], input[placeholder*="Company"]')
        if company_input:
            company_input.fill('Microsoft')
            safe_print('Filled company name: Microsoft')
        
        # Job Title
        title_input = page.query_selector('input[placeholder*="title"], input[placeholder*="Title"]')
        if title_input:
            title_input.fill('Senior Security Program Manager')
            safe_print('Filled job title: Senior Security Program Manager')
        
        time.sleep(2)
        body_text = page.inner_text('body')
        safe_print('')
        safe_print('Form after filling:')
        safe_print(body_text[:2000])
        
        page.screenshot(path='C:/Users/derri/talorme_form_filled.png', full_page=True)
        
        # Check if Generate button is enabled
        generate_btn = page.query_selector('button:has-text("Generate Tailored Resume")')
        if generate_btn:
            is_disabled = generate_btn.get_attribute('disabled')
            safe_print('')
            safe_print('Generate button disabled: ' + str(is_disabled))
            
            if not is_disabled:
                safe_print('Clicking Generate Tailored Resume...')
                generate_btn.click()
                
                # Wait for generation
                safe_print('Waiting for AI generation (this takes time)...')
                time.sleep(60)  # AI generation can take a while
                
                safe_print('')
                safe_print('Current URL: ' + page.url)
                body_text = page.inner_text('body')
                safe_print('Page content:')
                safe_print(body_text[:3000])
                
                page.screenshot(path='C:/Users/derri/talorme_generated.png', full_page=True)
        
        # Print API calls
        safe_print('')
        safe_print('=' * 60)
        safe_print('API CALLS')
        safe_print('=' * 60)
        for call in api_calls:
            if 'railway.app' in call['url']:
                safe_print(call['method'] + ' ' + call['url'])
                if call['post_data']:
                    safe_print('  POST: ' + str(call['post_data'])[:300])
        
        safe_print('')
        safe_print('=' * 60)
        safe_print('API RESPONSES')
        safe_print('=' * 60)
        for resp in api_responses:
            safe_print(str(resp['status']) + ' ' + resp['url'])
            if resp['body']:
                safe_print('  Body preview: ' + resp['body'][:500])
        
        browser.close()

if __name__ == '__main__':
    manual_interview_flow()
