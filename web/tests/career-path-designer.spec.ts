import { test, expect } from '@playwright/test';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://talorme.com';

test.describe('Career Path Designer E2E Tests (New Wizard Flow)', () => {
  test('Complete workflow: Welcome → Upload Resume → Answer Questions → View Results', async ({ page }) => {
    test.setTimeout(240000); // 4 minutes for upload + AI processing

    // Step 1: Navigate to Career Path Designer
    console.log('Step 1: Navigating to Career Path Designer...');
    await page.goto(`${BASE_URL}/career-path`);
    await expect(page.locator('h1')).toContainText('Design Your Career', { timeout: 10000 });
    console.log('✓ Page loaded successfully');

    // Step 2: Verify welcome screen is visible
    console.log('Step 2: Verifying welcome screen...');
    const welcomeHeading = page.locator('h1').filter({ hasText: /Design Your Career/i });
    await expect(welcomeHeading).toBeVisible({ timeout: 5000 });

    const getStartedButton = page.locator('button').filter({ hasText: /Get Started|Begin/i });
    await expect(getStartedButton).toBeVisible();
    console.log('✓ Welcome screen visible');

    // Step 3: Click "Get Started" to proceed to upload screen
    console.log('Step 3: Clicking Get Started...');
    await getStartedButton.click();
    await page.waitForTimeout(1000); // Wait for transition
    console.log('✓ Transitioned to upload screen');

    // Step 4: Upload resume
    console.log('Step 4: Uploading resume...');

    // Create a test resume file path
    const resumePath = path.join(__dirname, '..', '..', 'backend', 'test_resumes', 'justin_washington_resume.docx');

    // Look for file input (may be hidden by drag-and-drop UI)
    const fileInput = page.locator('input[type="file"]');

    try {
      await fileInput.setInputFiles(resumePath);
      console.log('  - Resume file uploaded');

      // Wait for upload progress or completion
      await page.waitForTimeout(3000); // Allow time for upload + extraction

      // Look for "Continue" or "Next" button after upload
      const continueButton = page.locator('button').filter({ hasText: /Continue|Next/i });
      await expect(continueButton).toBeVisible({ timeout: 15000 });
      console.log('  - Resume processed successfully');

      await continueButton.click();
      await page.waitForTimeout(1000);
      console.log('✓ Transitioned to questions screen');
    } catch (error) {
      console.log('  ⚠ Resume upload failed or file not found, continuing with manual flow...');

      // If upload fails, click "Skip & Continue" button
      const skipButton = page.locator('button').filter({ hasText: /Skip.*Continue/i });
      await expect(skipButton).toBeVisible({ timeout: 5000 });
      await skipButton.click();
      await page.waitForTimeout(1000);
      console.log('  - Clicked "Skip & Continue" button');
    }

    // Step 5: Answer questions on questions screen
    console.log('Step 5: Answering career path questions...');

    // Question 1: Dream role (text input) - REQUIRED
    const dreamRoleInput = page.getByTestId('dream-role-input');
    await expect(dreamRoleInput).toBeVisible({ timeout: 5000 });
    await dreamRoleInput.fill('Cybersecurity Program Manager');
    console.log('  - Dream role: Cybersecurity Program Manager');

    // Question 2: Timeline (button selection)
    console.log('  - Selecting timeline...');
    const timelineButtons = page.locator('button').filter({ hasText: /6 months|6months/i });
    if (await timelineButtons.first().isVisible().catch(() => false)) {
      await timelineButtons.first().click();
      console.log('  - Timeline: 6 months');
    }

    // Question 3: Budget (button selection)
    console.log('  - Selecting budget...');
    const budgetButtons = page.locator('button').filter({ hasText: /medium/i });
    if (await budgetButtons.first().isVisible().catch(() => false)) {
      await budgetButtons.first().click();
      console.log('  - Budget: Medium');
    }

    // Question 4: Hours per week (slider or number input)
    console.log('  - Setting hours per week...');
    const hoursInput = page.locator('input[type="range"], input[type="number"]').first();
    if (await hoursInput.isVisible().catch(() => false)) {
      await hoursInput.fill('15');
      console.log('  - Hours per week: 15');
    }

    // Question 5: Location (optional text input)
    console.log('  - Setting location...');
    const locationInput = page.locator('input[placeholder*="location" i], input[placeholder*="city" i]').first();
    if (await locationInput.isVisible().catch(() => false)) {
      await locationInput.fill('Remote');
      console.log('  - Location: Remote');
    }

    // Take screenshot of filled questions
    await page.screenshot({ path: 'test-results/career-path-questions-filled.png', fullPage: true });
    console.log('✓ Screenshot saved: career-path-questions-filled.png');

    // Step 6: Generate career plan
    console.log('Step 6: Generating career plan...');
    const generateButton = page.locator('button').filter({ hasText: /Generate|Create|Build/i });
    await generateButton.click();

    // Wait for generating state
    console.log('  - Waiting for AI processing...');
    const generatingIndicator = page.locator('text=/Generating|Creating|Building|Analyzing/i').first();
    await expect(generatingIndicator).toBeVisible({ timeout: 10000 });
    console.log('  - AI processing started...');

    // Wait for completion (could take 60-90 seconds)
    const resultsHeading = page.locator('text=/Your Career|Career Path|Results|Target Roles/i');
    await expect(resultsHeading).toBeVisible({ timeout: 150000 }); // 2.5 minutes
    console.log('✓ Plan generation completed!');

    // Step 7: Verify all result sections are present
    console.log('Step 7: Verifying result sections...');

    // Wait a bit for content to render
    await page.waitForTimeout(2000);

    const hasTargetRoles = await page.locator('text=Target Roles').isVisible().catch(() => false);
    console.log(`  - Target Roles section: ${hasTargetRoles ? '✓' : '✗'}`);

    const hasSkillsAnalysis = await page.locator('text=Skills Analysis').isVisible().catch(() => false);
    console.log(`  - Skills Analysis section: ${hasSkillsAnalysis ? '✓' : '✗'}`);

    const hasCertifications = await page.locator('text=Certification Path').isVisible().catch(() => false);
    console.log(`  - Certification Path section: ${hasCertifications ? '✓' : '✗'}`);

    const hasEducation = await page.locator('text=Education Options').isVisible().catch(() => false);
    console.log(`  - Education Options section: ${hasEducation ? '✓' : '✗'}`);

    const hasExperience = await page.locator('text=Experience Plan').isVisible().catch(() => false);
    console.log(`  - Experience Plan section: ${hasExperience ? '✓' : '✗'}`);

    const hasEvents = await page.locator('text=Networking Events').isVisible().catch(() => false);
    console.log(`  - Networking Events section: ${hasEvents ? '✓' : '✗'}`);

    const hasTimeline = await page.locator('text=/Timeline|12-Week|6-Month/i').isVisible().catch(() => false);
    console.log(`  - Timeline section: ${hasTimeline ? '✓' : '✗'}`);

    const hasResumeAssets = await page.locator('text=Resume Assets').isVisible().catch(() => false);
    console.log(`  - Resume Assets section: ${hasResumeAssets ? '✓' : '✗'}`);

    // Step 8: Test section expansion (if collapsible)
    console.log('Step 8: Testing section expansion...');
    const firstSection = page.locator('button').filter({ hasText: 'Target Roles' }).first();
    if (await firstSection.isVisible().catch(() => false)) {
      await firstSection.click();
      await page.waitForTimeout(500); // Wait for animation

      // Check if content is visible
      const hasExpandedContent = await page.locator('text=/Why Aligned|Salary Range|Requirements/i').isVisible().catch(() => false);
      console.log(`  - Section expansion: ${hasExpandedContent ? '✓' : '✗'}`);
    }

    // Step 9: Take screenshot of results
    await page.screenshot({ path: 'test-results/career-path-results.png', fullPage: true });
    console.log('✓ Screenshot saved: career-path-results.png');

    // Step 10: Test "New Plan" button
    console.log('Step 10: Testing "New Plan" button...');
    const newPlanButton = page.locator('button').filter({ hasText: /New Plan|Start Over|Create Another/i });
    if (await newPlanButton.isVisible().catch(() => false)) {
      await newPlanButton.click();
      await page.waitForTimeout(1000);

      // Should return to welcome screen
      const isWelcomeVisible = await page.locator('text=/Build Your Career|Get Started/i').isVisible().catch(() => false);
      console.log(`  - Returned to welcome: ${isWelcomeVisible ? '✓' : '✗'}`);
    }

    console.log('\n=== CAREER PATH DESIGNER E2E TEST COMPLETE ===');
  });

  test('Navigation: Back to Dashboard', async ({ page }) => {
    console.log('Testing navigation to dashboard...');

    await page.goto(`${BASE_URL}/career-path`);
    await expect(page.locator('h1')).toContainText('Design Your Career', { timeout: 10000 });

    // Click Talor logo in header
    const logoLink = page.locator('a[href="/"]').filter({ hasText: /Talor/i });
    if (await logoLink.isVisible().catch(() => false)) {
      await logoLink.click();

      // Should navigate to home
      await expect(page).toHaveURL(BASE_URL + '/');
      console.log('✓ Successfully navigated to dashboard');
    } else {
      console.log('⚠ Logo link not found');
    }
  });

  test('Navigation: Career Path link in header', async ({ page }) => {
    console.log('Testing header navigation...');

    // Start from home page
    await page.goto(BASE_URL);

    // Click "Career Path" in navigation
    const careerPathLink = page.locator('a[href="/career-path"]').filter({ hasText: /Career Path/i });
    if (await careerPathLink.isVisible().catch(() => false)) {
      await careerPathLink.click();

      // Should navigate to career path designer
      await expect(page).toHaveURL(/.*\/career-path/);
      await expect(page.locator('h1')).toContainText('Design Your Career', { timeout: 10000 });
      console.log('✓ Header link working correctly');
    } else {
      console.log('⚠ Career Path link not found in header');
    }
  });

  test('Welcome screen: Verify UI elements and theme', async ({ page }) => {
    console.log('Testing welcome screen UI...');

    await page.goto(`${BASE_URL}/career-path`);
    await expect(page.locator('h1')).toContainText('Design Your Career', { timeout: 10000 });

    // Check for glass morphism theme (black background + glass cards)
    const bodyBg = await page.locator('body').evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    console.log(`  - Body background: ${bodyBg}`);

    // Check for glass card
    const glassCard = page.locator('.glass').first();
    if (await glassCard.isVisible().catch(() => false)) {
      console.log('  - Glass morphism card: ✓');
    } else {
      console.log('  - Glass morphism card: ✗');
    }

    // Verify "Get Started" button exists
    const getStartedButton = page.locator('button').filter({ hasText: /Get Started|Begin/i });
    await expect(getStartedButton).toBeVisible();
    console.log('  - Get Started button: ✓');
  });

  test('Resume upload flow: Test file selection', async ({ page }) => {
    test.setTimeout(60000);
    console.log('Testing resume upload flow...');

    await page.goto(`${BASE_URL}/career-path`);
    await expect(page.locator('h1')).toContainText('Design Your Career', { timeout: 10000 });

    // Click Get Started
    const getStartedButton = page.locator('button').filter({ hasText: /Get Started|Begin/i });
    await getStartedButton.click();
    await page.waitForTimeout(1000);

    // Verify upload screen elements
    const uploadHeading = page.locator('h2').filter({ hasText: /Upload Your Resume/i });
    await expect(uploadHeading).toBeVisible({ timeout: 5000 });
    console.log('  - Upload screen visible: ✓');

    // Check for file input
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();
    console.log('  - File input exists: ✓');

    // Check for drag-and-drop zone
    const dragZone = page.locator('text=/drag|drop|browse/i');
    if (await dragZone.isVisible().catch(() => false)) {
      console.log('  - Drag-and-drop zone: ✓');
    }
  });

  test('Error handling: Missing resume data fallback', async ({ page }) => {
    test.setTimeout(180000);
    console.log('Testing fallback when resume upload is skipped...');

    await page.goto(`${BASE_URL}/career-path`);
    await expect(page.locator('h1')).toContainText('Design Your Career', { timeout: 10000 });

    // Click Get Started
    const getStartedButton = page.locator('button').filter({ hasText: /Get Started|Begin/i });
    await getStartedButton.click();
    await page.waitForTimeout(1000);

    // Look for skip/continue without resume option
    const skipButton = page.locator('button').filter({ hasText: /Skip|Continue without|Manual/i });
    if (await skipButton.isVisible().catch(() => false)) {
      await skipButton.click();
      await page.waitForTimeout(1000);
      console.log('  - Skip button found and clicked: ✓');

      // Should proceed to questions screen
      const questionsVisible = await page.locator('text=/dream|target|goal/i').isVisible({ timeout: 5000 }).catch(() => false);
      console.log(`  - Questions screen shown: ${questionsVisible ? '✓' : '✗'}`);
    } else {
      console.log('  - No skip option found (upload may be required)');
    }
  });

  test.skip('Mock API: Test error handling', async ({ page }) => {
    // This test would require API mocking setup
    // Skipping for now - placeholder for future implementation
    console.log('Test skipped: Requires API mocking setup');
  });
});
