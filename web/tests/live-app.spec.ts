import { test, expect } from '@playwright/test';
import path from 'path';

// Test the LIVE deployed app on Vercel
const LIVE_APP_URL = 'https://web-7oq0jaaou-heirclark17s-projects.vercel.app';
const RESUME_FILE_PATH = path.join('C:', 'Users', 'derri', 'Downloads', 'Justin_Washington_Cyber_PM_Resume.docx');

test.describe('Talor Live App - End to End Test', () => {

  test('should load the home page with Talor branding', async ({ page }) => {
    await page.goto(LIVE_APP_URL);

    // Wait for React to render
    await page.waitForLoadState('networkidle');

    // Check for Talor branding in sidebar
    const talorHeading = page.locator('h1:has-text("Talor")');
    await expect(talorHeading).toBeVisible({ timeout: 10000 });

    console.log('✅ Homepage loaded successfully');
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto(LIVE_APP_URL);
    await page.waitForLoadState('networkidle');

    // Check navigation links exist
    const uploadLink = page.locator('a[href="/upload"]');
    const tailorLink = page.locator('a[href="/tailor"]');

    await expect(uploadLink).toBeVisible();
    await expect(tailorLink).toBeVisible();

    console.log('✅ Navigation links present');
  });

  test('should navigate to Upload Resume page', async ({ page }) => {
    await page.goto(LIVE_APP_URL);
    await page.waitForLoadState('networkidle');

    // Click Upload Resume link
    await page.click('a[href="/upload"]');
    await page.waitForTimeout(1000);

    // Verify we're on upload page
    const uploadHeading = page.locator('h1:has-text("Upload Resume")');
    await expect(uploadHeading).toBeVisible({ timeout: 5000 });

    console.log('✅ Upload page navigation works');
  });

  test('should upload a resume successfully', async ({ page }) => {
    await page.goto(`${LIVE_APP_URL}/upload`);
    await page.waitForLoadState('networkidle');

    // Find the file input
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();

    // Upload the resume
    console.log(`📤 Uploading resume from: ${RESUME_FILE_PATH}`);
    await fileInput.setInputFiles(RESUME_FILE_PATH);

    // Wait for upload to complete (look for success message)
    const successMessage = page.locator('text=Resume uploaded successfully');
    await expect(successMessage).toBeVisible({ timeout: 30000 });

    console.log('✅ Resume uploaded successfully!');

    // Verify parsed data is shown
    const parsedSection = page.locator('text=Parsed Resume');
    await expect(parsedSection).toBeVisible();

    console.log('✅ Resume parsed and displayed');
  });

  test('should navigate to Tailor Resume page and list resumes', async ({ page }) => {
    await page.goto(`${LIVE_APP_URL}/tailor`);
    await page.waitForLoadState('networkidle');

    // Check for Talor heading
    const talorHeading = page.locator('h1:has-text("Talor")');
    await expect(talorHeading).toBeVisible({ timeout: 10000 });

    // Wait for resumes to load
    await page.waitForTimeout(3000);

    // Check if resume list is present or "no resumes" message
    const selectResumeSection = page.locator('text=Select Base Resume');
    await expect(selectResumeSection).toBeVisible();

    console.log('✅ Tailor page loaded with resume selection');
  });

  test('FULL E2E: Upload resume and tailor it for a job', async ({ page }) => {
    // Step 1: Upload a resume
    console.log('🔄 Step 1: Uploading resume...');
    await page.goto(`${LIVE_APP_URL}/upload`);
    await page.waitForLoadState('networkidle');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(RESUME_FILE_PATH);

    const successMessage = page.locator('text=Resume uploaded successfully');
    await expect(successMessage).toBeVisible({ timeout: 30000 });
    console.log('✅ Step 1 complete: Resume uploaded');

    // Step 2: Navigate to Tailor page
    console.log('🔄 Step 2: Navigating to tailor page...');
    await page.click('a[href="/tailor"]');
    await page.waitForTimeout(2000);

    const talorHeading = page.locator('h1:has-text("Talor")');
    await expect(talorHeading).toBeVisible();
    console.log('✅ Step 2 complete: On tailor page');

    // Step 3: Select the uploaded resume
    console.log('🔄 Step 3: Selecting resume...');
    await page.waitForTimeout(3000); // Wait for resume list to load

    // Click the first resume radio button
    const firstResume = page.locator('input[type="radio"]').first();
    if (await firstResume.isVisible()) {
      await firstResume.click();
      console.log('✅ Step 3 complete: Resume selected');
    } else {
      console.log('ℹ️  No resumes to select (may need manual upload first)');
    }

    // Step 4: Fill in job details
    console.log('🔄 Step 4: Filling job details...');
    await page.fill('input[placeholder*="linkedin.com"]', 'https://www.linkedin.com/jobs/view/test-cybersecurity-job');
    await page.fill('input[placeholder*="JPMorgan"]', 'JPMorgan Chase');
    await page.fill('input[placeholder*="Lead Technical"]', 'Lead Technical Program Manager - Cybersecurity');
    console.log('✅ Step 4 complete: Job details entered');

    // Step 5: Generate tailored resume
    console.log('🔄 Step 5: Generating tailored resume (this may take 30-60 seconds)...');
    const generateButton = page.locator('button:has-text("Generate Tailored Resume")');

    // Check if button is enabled
    if (await generateButton.isEnabled()) {
      await generateButton.click();

      // Wait for tailoring to complete (this calls Claude AI + Perplexity, can take time)
      const comparisonView = page.locator('text=Resume Comparison');
      await expect(comparisonView).toBeVisible({ timeout: 120000 }); // 2 minutes max

      console.log('✅ Step 5 complete: Resume tailored!');

      // Step 6: Verify side-by-side comparison
      console.log('🔄 Step 6: Verifying side-by-side comparison...');
      const originalResumePanel = page.locator('text=Original Resume');
      const tailoredResumePanel = page.locator('text=Tailored Resume');

      await expect(originalResumePanel).toBeVisible();
      await expect(tailoredResumePanel).toBeVisible();

      console.log('✅ Step 6 complete: Side-by-side comparison displayed!');
      console.log('🎉 FULL END-TO-END TEST PASSED!');

      // Take a screenshot of the comparison
      await page.screenshot({ path: 'live-app-comparison.png', fullPage: true });
      console.log('📸 Screenshot saved: live-app-comparison.png');
    } else {
      console.log('⚠️  Generate button is disabled - may need to select a resume first');
    }
  });

  test('should verify backend connection', async ({ page }) => {
    // Test direct API call to backend
    const healthResponse = await page.request.get(
      'https://resume-ai-backend-production-3134.up.railway.app/api/health'
    );

    expect(healthResponse.ok()).toBeTruthy();
    console.log('✅ Backend health check passed');

    const healthData = await healthResponse.json();
    console.log('Backend status:', healthData);
  });
});
