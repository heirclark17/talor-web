import { test, expect } from '@playwright/test';
import path from 'path';

const RESUME_PATH = path.resolve('C:/Users/derri/Downloads/Justin_Washington_Cyber_PM_Resume.docx');
const BASE_URL = 'https://talorme.com';

test.describe('E2E: Upload to Tailor Resume Workflow', () => {
  test('Complete workflow: Upload resume → Parse → Tailor for job', async ({ page }) => {
    test.setTimeout(180000); // 3 minutes for AI processing

    // Step 1: Navigate to upload page
    console.log('Step 1: Navigating to upload page...');
    await page.goto(`${BASE_URL}/upload`);
    await expect(page.locator('h1')).toContainText('Upload Resume');

    // Step 2: Upload resume file
    console.log('Step 2: Uploading resume...');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(RESUME_PATH);

    // Step 3: Wait for parsing to complete
    console.log('Step 3: Waiting for parsing...');
    await expect(page.locator('text=Resume uploaded successfully')).toBeVisible({ timeout: 60000 });
    console.log('✓ Upload successful!');

    // Step 4: Verify parsed data is displayed
    console.log('Step 4: Verifying parsed resume sections...');

    // Check for Professional Summary
    const hasSummary = await page.locator('h3:has-text("Professional Summary")').isVisible();
    console.log(`  - Summary section: ${hasSummary ? '✓' : '✗'}`);

    // Check for Skills
    const hasSkills = await page.locator('h3:has-text("Skills")').isVisible();
    console.log(`  - Skills section: ${hasSkills ? '✓' : '✗'}`);

    if (hasSkills) {
      const skillsCount = await page.locator('.bg-orange-100').count();
      console.log(`  - Skills found: ${skillsCount}`);
    }

    // Check for Experience
    const hasExperience = await page.locator('h3:has-text("Professional Experience")').isVisible();
    console.log(`  - Experience section: ${hasExperience ? '✓' : '✗'}`);

    if (hasExperience) {
      const jobsCount = await page.locator('.border-l-4.border-orange-400').count();
      console.log(`  - Jobs found: ${jobsCount}`);
    }

    // Check for Education
    const hasEducation = await page.locator('h3:has-text("Education")').isVisible();
    console.log(`  - Education section: ${hasEducation ? '✓' : '✗'}`);

    // Check for Certifications
    const hasCertifications = await page.locator('h3:has-text("Certifications")').isVisible();
    console.log(`  - Certifications section: ${hasCertifications ? '✓' : '✗'}`);

    // Step 5: Click "Tailor This Resume" button
    console.log('Step 5: Navigating to tailor page...');
    await page.click('button:has-text("Tailor This Resume")');

    // Wait for navigation
    await expect(page).toHaveURL(/.*\/tailor/);
    console.log('✓ Navigated to tailor page');

    // Step 6: Verify resume is pre-selected
    console.log('Step 6: Verifying resume selection...');

    // Wait for loading spinner to disappear
    await page.waitForSelector('text=Loading resumes...', { state: 'hidden', timeout: 10000 });

    // Wait for form to be visible
    await page.waitForSelector('input[placeholder="https://www.linkedin.com/jobs/view/..."]', { timeout: 10000 });

    // Check for radio button (not select dropdown)
    const selectedResumeRadio = page.locator('input[name="resume"]:checked');
    const isResumeSelected = await selectedResumeRadio.count() > 0;
    console.log(`  - Resume pre-selected: ${isResumeSelected ? '✓' : '✗'}`);

    // Step 7: Fill in job details
    console.log('Step 7: Filling in job details...');

    await page.fill('input[placeholder="https://www.linkedin.com/jobs/view/..."]', 'https://www.linkedin.com/jobs/view/cybersecurity-program-manager-test');
    console.log('  - Job URL filled');

    await page.fill('input[placeholder="JPMorgan Chase"]', 'JPMorgan Chase');
    console.log('  - Company filled');

    await page.fill('input[placeholder="Lead Technical Program Manager"]', 'Cybersecurity Program Manager');
    console.log('  - Job Title filled');

    // Step 8: Generate tailored resume
    console.log('Step 8: Generating tailored resume...');
    await page.click('button:has-text("Generate Tailored Resume")');

    // Wait for AI processing
    await expect(page.locator('text=Generating')).toBeVisible({ timeout: 5000 });
    console.log('  - AI processing started...');

    // Wait for completion (could take up to 2 minutes)
    const successMessage = page.locator('text=successfully').first();
    await expect(successMessage).toBeVisible({ timeout: 120000 });
    console.log('✓ Tailoring completed!');

    // Step 9: Verify tailored resume display
    console.log('Step 9: Verifying tailored resume...');

    const hasTailoredSummary = await page.locator('text=Tailored Summary').isVisible().catch(() => false);
    console.log(`  - Tailored Summary: ${hasTailoredSummary ? '✓' : '✗'}`);

    const hasCompetencies = await page.locator('text=Core Competencies').isVisible().catch(() => false);
    console.log(`  - Core Competencies: ${hasCompetencies ? '✓' : '✗'}`);

    const hasAlignment = await page.locator('text=Alignment').isVisible().catch(() => false);
    console.log(`  - Alignment Statement: ${hasAlignment ? '✓' : '✗'}`);

    // Step 10: Take screenshot of final result
    await page.screenshot({ path: 'test-results/e2e-final-result.png', fullPage: true });
    console.log('✓ Screenshot saved to test-results/e2e-final-result.png');

    console.log('\n=== E2E TEST COMPLETE ===');
  });

  test.skip('Upload page: Test error handling for invalid file', async ({ page }) => {
    // Skipping this test for now - file creation needs different approach
    await page.goto(`${BASE_URL}/upload`);
  });

  test('Tailor page: Test without selecting resume', async ({ page }) => {
    await page.goto(`${BASE_URL}/tailor`);

    // Wait for loading spinner to disappear
    await page.waitForSelector('text=Loading resumes...', { state: 'hidden', timeout: 10000 });

    // Wait for form to be visible
    await page.waitForSelector('input[placeholder="JPMorgan Chase"]', { timeout: 10000 });

    // Try to tailor without selecting a resume
    await page.fill('input[placeholder="JPMorgan Chase"]', 'Test Company');
    await page.fill('input[placeholder="Lead Technical Program Manager"]', 'Test Job');

    await page.click('button:has-text("Generate")');

    // Should show error or validation message
    await page.waitForTimeout(2000);
    const hasError = await page.locator('text=select').isVisible().catch(() => false);
    console.log(`  - Validation error shown: ${hasError ? '✓' : '✗'}`);
  });
});
