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

def full_generation_flow():
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
        
        # Go to tailor page (resume already uploaded from previous run)
        safe_print('=' * 60)
        safe_print('TAILOR PAGE')
        safe_print('=' * 60)
        page.goto('https://talorme.com/tailor', wait_until='networkidle', timeout=60000)
        time.sleep(3)
        
        # Select resume
        radio = page.query_selector('input[type="radio"]')
        if radio:
            radio.click()
            safe_print('Selected resume')
            time.sleep(1)
        
        # Fill job URL and click extract
        job_url_input = page.query_selector('input[type="url"]')
        if job_url_input:
            job_url_input.fill('https://careers.microsoft.com/job/12345')
            safe_print('Filled job URL')
        
        # Click Extract Details (will fail but show manual fields)
        extract_btn = page.query_selector('button:has-text("Extract")')
        if extract_btn:
            extract_btn.click()
            safe_print('Clicked Extract Details')
            time.sleep(5)
        
        # Now fill manual fields
        body_text = page.inner_text('body')
        safe_print('')
        safe_print('Page after extraction attempt:')
        safe_print(body_text[:2000])
        
        # List all inputs now
        inputs = page.query_selector_all('input')
        safe_print('')
        safe_print('All inputs now:')
        for inp in inputs:
            inp_type = inp.get_attribute('type') or 'text'
            placeholder = inp.get_attribute('placeholder') or ''
            name = inp.get_attribute('name') or ''
            value = inp.get_attribute('value') or ''
            safe_print('  type=' + inp_type + ', name=' + name + ', placeholder=' + placeholder[:40] + ', value=' + value[:30])
        
        # Fill Company Name
        company_input = page.query_selector('input[placeholder*="Enter company name"]')
        if company_input:
            company_input.fill('Microsoft')
            safe_print('Filled company: Microsoft')
        
        # Fill Job Title
        title_input = page.query_selector('input[placeholder*="Enter job title"]')
        if title_input:
            title_input.fill('Senior Security Program Manager')
            safe_print('Filled title: Senior Security Program Manager')
        
        time.sleep(2)
        
        # Now generate
        generate_btn = page.query_selector('button:has-text("Generate Tailored Resume")')
        if generate_btn:
            is_disabled = generate_btn.get_attribute('disabled')
            safe_print('')
            safe_print('Generate button disabled: ' + str(is_disabled))
            
            generate_btn.click()
            safe_print('Clicked Generate!')
            
            # Wait for generation (AI takes time)
            safe_print('Waiting for AI generation...')
            for i in range(12):  # Wait up to 2 minutes
                time.sleep(10)
                body_text = page.inner_text('body')
                if 'generating' in body_text.lower() or 'loading' in body_text.lower():
                    safe_print('Still generating... (' + str((i+1)*10) + 's)')
                elif 'interview' in body_text.lower() or 'comparison' in body_text.lower():
                    safe_print('Generation complete!')
                    break
            
            time.sleep(3)
            safe_print('')
            safe_print('Current URL: ' + page.url)
            body_text = page.inner_text('body')
            safe_print('')
            safe_print('Final page content:')
            safe_print(body_text[:4000])
            
            page.screenshot(path='C:/Users/derri/talorme_result.png', full_page=True)
        
        # Check for Interview Prep link/button
        safe_print('')
        safe_print('=' * 60)
        safe_print('LOOKING FOR INTERVIEW PREP')
        safe_print('=' * 60)
        
        interview_elements = page.query_selector_all('button:has-text("Interview"), a:has-text("Interview"), [class*="interview"]')
        safe_print('Interview-related elements: ' + str(len(interview_elements)))
        for el in interview_elements[:10]:
            text = el.inner_text().strip()[:100]
            safe_print('  Element: ' + text)
        
        # Print API calls
        safe_print('')
        safe_print('=' * 60)
        safe_print('API CALLS')
        safe_print('=' * 60)
        for call in api_calls:
            if 'railway.app' in call['url']:
                safe_print(call['method'] + ' ' + call['url'])
        
        safe_print('')
        safe_print('=' * 60)
        safe_print('API RESPONSES (with data)')
        safe_print('=' * 60)
        for resp in api_responses:
            if resp['body'] and len(resp['body']) > 50:
                safe_print(str(resp['status']) + ' ' + resp['url'])
                safe_print('  Body: ' + resp['body'][:800])
                safe_print('')
        
        browser.close()

if __name__ == '__main__':
    full_generation_flow()
