"""
Full workflow test: Upload resume → Generate tailored → Test all features
"""
import asyncio
from playwright.async_api import async_playwright
import sys
import io
import tempfile
import os

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

async def full_workflow():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, slow_mo=500)
        context = await browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = await context.new_page()

        api_calls = []
        api_responses = []

        page.on('request', lambda req: api_calls.append({'method': req.method, 'url': req.url}) if 'api' in req.url else None)

        async def log_response(response):
            if 'api' in response.url:
                api_responses.append({'url': response.url, 'status': response.status})

        page.on('response', log_response)

        print("=" * 80)
        print("FULL WORKFLOW TEST - Upload → Tailor → Verify All Features")
        print("=" * 80)

        # STEP 1: Upload resume
        print("\n[STEP 1] Navigating to /upload page...")
        await page.goto('https://talorme.com/upload', wait_until='networkidle', timeout=60000)
        await page.wait_for_timeout(3000)

        # Create test resume file
        test_resume_content = """JOHN DOE
john.doe@email.com | (555) 123-4567 | linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Senior Security Engineer with 10+ years of experience in cybersecurity, cloud security (AWS/Azure),
vulnerability management, and compliance frameworks (NIST, ISO 27001, SOC 2). Expert in security
automation, threat detection, and incident response.

TECHNICAL SKILLS
• Cloud Security: AWS Security Hub, Azure Security Center, GCP Security Command Center
• Frameworks: NIST Cybersecurity Framework, ISO 27001, SOC 2 Type II, HIPAA
• Tools: Splunk, CrowdStrike, Tenable, Qualys, Nessus
• Languages: Python, Bash, PowerShell
• Security: SIEM, IDS/IPS, WAF, DLP, Endpoint Protection
• DevSecOps: Jenkins, GitLab CI/CD, Docker, Kubernetes

PROFESSIONAL EXPERIENCE

Senior Security Engineer | TechCorp Inc | 2020 - Present
• Led cloud security architecture for AWS migration covering 500+ resources
• Implemented NIST Cybersecurity Framework controls reducing risk by 45%
• Automated security scanning pipeline reducing vulnerability detection time by 60%
• Managed SOC 2 Type II audit achieving 100% compliance with zero findings
• Built threat detection rules in Splunk decreasing MTTD by 40%

Security Engineer | SecureNet Solutions | 2015 - 2020
• Managed vulnerability management program scanning 2000+ endpoints monthly
• Conducted security assessments for 50+ client environments
• Implemented SIEM solution (Splunk) for 24/7 security monitoring
• Achieved ISO 27001 certification for organization
• Reduced critical vulnerabilities by 75% through remediation tracking

Security Analyst | DataGuard Corp | 2013 - 2015
• Monitored security events using SIEM tools (ArcSight, QRadar)
• Investigated and responded to 100+ security incidents
• Performed log analysis and threat hunting activities
• Created security documentation and runbooks

EDUCATION
Bachelor of Science in Computer Science
University of Technology | 2013

CERTIFICATIONS
• CISSP - Certified Information Systems Security Professional
• AWS Certified Security - Specialty
• CISM - Certified Information Security Manager
• CEH - Certified Ethical Hacker
"""

        print("Creating test resume file...")
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, encoding='utf-8') as f:
            f.write(test_resume_content)
            temp_file = f.name

        # Find file input
        file_input = await page.query_selector('input[type="file"]')
        if file_input:
            print("✓ Found file upload input")
            await file_input.set_input_files(temp_file)
            print("✓ Resume file attached, waiting for auto-upload...")

            # Upload triggers automatically - wait for success message
            try:
                await page.wait_for_selector('text=successfully', timeout=30000)
                print("✓✓✓ RESUME UPLOADED SUCCESSFULLY!")
                await page.wait_for_timeout(2000)
            except:
                print("⚠️  Did not see success message, but continuing...")
                await page.wait_for_timeout(5000)
        else:
            print("✗ File input not found on /upload page")

        os.unlink(temp_file)

        # STEP 2: Navigate to tailor page
        print("\n[STEP 2] Navigating to /tailor page...")
        await page.goto('https://talorme.com/tailor', wait_until='networkidle', timeout=60000)
        await page.wait_for_timeout(3000)

        # Check for resumes
        select_buttons = await page.query_selector_all('button:has-text("Select")')
        print(f"Found {len(select_buttons)} base resume(s)")

        if not select_buttons:
            print("\n✗ Resume not uploaded successfully")
            print("Manual action required: Go to https://talorme.com/upload and upload a resume")
            await browser.close()
            return

        # STEP 3: Select resume
        print("\n[STEP 3] Selecting first resume...")
        await select_buttons[0].click()
        await page.wait_for_timeout(1000)
        print("✓ Resume selected")

        # STEP 4: Fill job details
        print("\n[STEP 4] Filling job details...")
        company = await page.query_selector('input[placeholder*="ompany"], input[name="company"]')
        if company:
            await company.fill("Amazon Web Services")
            print("✓ Company: Amazon Web Services")

        title = await page.query_selector('input[placeholder*="Title"], input[name="jobTitle"]')
        if title:
            await title.fill("Senior Cloud Security Engineer")
            print("✓ Title: Senior Cloud Security Engineer")

        url = await page.query_selector('input[placeholder*="URL"], input[name="jobUrl"]')
        if url:
            await url.fill("https://amazon.jobs/en/jobs/2532156/senior-cloud-security-engineer")
            print("✓ URL: https://amazon.jobs/...")

        # STEP 5: Generate tailored resume
        print("\n[STEP 5] Generating tailored resume (THIS WILL TAKE 60-90 SECONDS)...")
        generate_btn = await page.query_selector('button:has-text("Generate")')
        if generate_btn:
            await generate_btn.click()
            print("✓ Clicked generate button")
            print("⏳ Waiting for AI to analyze and tailor resume...")

            try:
                # Wait for success (can take up to 90 seconds)
                await page.wait_for_selector('text=Success', timeout=120000)
                print("✓✓✓ RESUME GENERATED SUCCESSFULLY!")
                await page.wait_for_timeout(3000)

                # STEP 6: Check analysis components
                print("\n[STEP 6] Checking for NEW ANALYSIS COMPONENTS...")

                match_score = await page.query_selector('[data-testid="match-score"]')
                if match_score:
                    print("✓✓✓ MATCH SCORE COMPONENT FOUND!")
                    score_text = await match_score.inner_text()
                    print(f"    Preview: {score_text[:100]}")
                else:
                    print("✗ Match Score NOT found")

                resume_analysis = await page.query_selector('[data-testid="resume-analysis"]')
                if resume_analysis:
                    print("✓✓✓ RESUME ANALYSIS COMPONENT FOUND!")
                    analysis_text = await resume_analysis.inner_text()
                    print(f"    Preview: {analysis_text[:100]}")
                else:
                    print("✗ Resume Analysis NOT found")

                keyword_panel = await page.query_selector('[data-testid="keyword-panel"]')
                if keyword_panel:
                    print("✓✓✓ KEYWORD PANEL COMPONENT FOUND!")
                    keyword_text = await keyword_panel.inner_text()
                    print(f"    Preview: {keyword_text[:100]}")
                else:
                    print("✗ Keyword Panel NOT found")

                # Screenshot
                await page.screenshot(path='SUCCESS_all_components_working.png', full_page=True)
                print("\n📸 Screenshot saved: SUCCESS_all_components_working.png")

                # STEP 7: Test Interview Prep → Certifications
                print("\n[STEP 7] Testing Interview Prep Certifications...")
                interview_btn = await page.query_selector('button:has-text("View Interview Prep")')
                if interview_btn:
                    await interview_btn.click()
                    await page.wait_for_timeout(5000)
                    print("✓ Navigated to Interview Prep")

                    # Find and expand certifications
                    cert_section = await page.query_selector('text=Recommended Certifications')
                    if cert_section:
                        print("✓ Certifications section found")
                        await cert_section.click()
                        await page.wait_for_timeout(5000)

                        cert_component = await page.query_selector('[data-testid="certification-recommendations"]')
                        if cert_component:
                            print("✓✓✓ CERTIFICATION RECOMMENDATIONS WORKING!")
                            cert_text = await cert_component.inner_text()
                            print(f"    Preview: {cert_text[:100]}")
                        else:
                            print("✗ Certifications not loaded")
                    else:
                        print("✗ Certifications section not found")

            except Exception as e:
                print(f"\n✗ Generation failed or timed out: {e}")
                # Check for errors
                error_elem = await page.query_selector('.border-red-500, [class*="error"]')
                if error_elem:
                    error_text = await error_elem.inner_text()
                    print(f"Error message: {error_text}")

        # API CALLS SUMMARY
        print("\n[STEP 8] API Calls to New Endpoints:")
        new_api_calls = [call for call in api_calls if 'resume-analysis' in call['url'] or 'certifications' in call['url']]
        if new_api_calls:
            for call in new_api_calls:
                print(f"  ✓ {call['method']} {call['url']}")
        else:
            print("  ✗ NO CALLS TO NEW ENDPOINTS")

        print("\n[STEP 9] API Response Status:")
        new_responses = [resp for resp in api_responses if 'resume-analysis' in resp['url'] or 'certifications' in resp['url']]
        if new_responses:
            for resp in new_responses:
                status_symbol = "✓" if resp['status'] == 200 else "✗"
                print(f"  {status_symbol} {resp['status']} - {resp['url']}")
        else:
            print("  ⚠️  NO RESPONSES FROM NEW ENDPOINTS")

        print("\n" + "=" * 80)
        print("FULL WORKFLOW TEST COMPLETE")
        print("=" * 80)

        await browser.close()

if __name__ == '__main__':
    asyncio.run(full_workflow())
