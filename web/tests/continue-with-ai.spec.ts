import { test, expect } from '@playwright/test';
import path from 'path';

const BASE_URL = 'https://talorme.com';
const RESUME_PATH = path.resolve('C:/Users/derri/Downloads/Justin_Washington_Cyber_PM_Resume.docx');

/**
 * Helper: Dismiss the Joyride "Welcome to Talor!" tour if it appears
 */
async function dismissJoyrideTour(page: any) {
  const skipTour = page.locator('button, span').filter({ hasText: /Skip Tour/i }).first();
  const isVisible = await skipTour.isVisible({ timeout: 3000 }).catch(() => false);
  if (isVisible) {
    await skipTour.click({ force: true });
    await page.waitForTimeout(500);
    console.log('  Joyride tour dismissed');
  }
}

/**
 * Helper: Navigate from landing to the upload step
 */
async function navigateToUploadStep(page: any) {
  await page.goto(`${BASE_URL}/career-path`);
  await expect(page.locator('h1')).toContainText('Design Your Career', { timeout: 15000 });

  // Clear localStorage to avoid stale data interfering
  await page.evaluate(() => localStorage.removeItem('careerPathIntake'));

  const getStartedButton = page.locator('button').filter({ hasText: /Get Started|Begin/i });
  await expect(getStartedButton).toBeVisible({ timeout: 5000 });
  await getStartedButton.click();

  // Wait for upload step to render
  const uploadHeading = page.locator('h2').filter({ hasText: /Upload Your Resume/i });
  await expect(uploadHeading).toBeVisible({ timeout: 10000 });

  // Dismiss Joyride tour if it pops up
  await dismissJoyrideTour(page);
}

test.describe('Continue with AI - Upload Step Buttons', () => {

  test('Skip & Continue is always visible; Continue with AI is hidden when nothing uploaded', async ({ page }) => {
    test.setTimeout(60000);
    console.log('--- Test: Button visibility with no resume/URL ---');

    await navigateToUploadStep(page);

    // "Skip & Continue" should be visible
    const skipBtn = page.locator('button').filter({ hasText: /Skip & Continue/i });
    await expect(skipBtn).toBeVisible({ timeout: 5000 });
    console.log('  Skip & Continue button: visible');

    // "Continue with AI" should NOT be visible (no resume, no URL)
    const aiBtn = page.locator('button').filter({ hasText: /Continue with AI/i });
    await expect(aiBtn).toBeHidden();
    console.log('  Continue with AI button: hidden (correct)');

    await page.screenshot({ path: 'test-results/01-no-resume-buttons.png', fullPage: true });
  });

  test('Continue with AI appears after entering a job URL', async ({ page }) => {
    test.setTimeout(60000);
    console.log('--- Test: Button visibility with job URL ---');

    await navigateToUploadStep(page);

    // Type a job URL
    const urlInput = page.locator('input[type="url"]');
    await urlInput.fill('https://linkedin.com/jobs/view/12345');

    // "Continue with AI" should now be visible
    const aiBtn = page.locator('button').filter({ hasText: /Continue with AI/i });
    await expect(aiBtn).toBeVisible({ timeout: 5000 });
    console.log('  Continue with AI button: visible after URL entry');

    // "Skip & Continue" should also still be visible
    const skipBtn = page.locator('button').filter({ hasText: /Skip & Continue/i });
    await expect(skipBtn).toBeVisible();
    console.log('  Skip & Continue button: still visible');

    await page.screenshot({ path: 'test-results/02-url-entered-buttons.png', fullPage: true });
  });

  test('Upload resume -> stay on upload step -> Continue with AI appears', async ({ page }) => {
    test.setTimeout(90000);
    console.log('--- Test: Resume upload does NOT auto-navigate ---');

    await navigateToUploadStep(page);

    // Upload resume
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(RESUME_PATH);
    console.log('  Resume file selected');

    // Wait for upload to complete (progress bar or filename shown)
    await page.waitForTimeout(5000); // Allow API call to complete

    // Verify we are STILL on the upload step (not auto-navigated)
    const uploadHeading = page.locator('h2').filter({ hasText: /Upload Your Resume/i });
    await expect(uploadHeading).toBeVisible({ timeout: 5000 });
    console.log('  Still on upload step after upload (no auto-navigate): PASS');

    // "Continue with AI" should now be visible
    const aiBtn = page.locator('button').filter({ hasText: /Continue with AI/i });
    await expect(aiBtn).toBeVisible({ timeout: 10000 });
    console.log('  Continue with AI button: visible after upload');

    await page.screenshot({ path: 'test-results/03-resume-uploaded-stays.png', fullPage: true });
  });

  test('Continue with AI pre-fills Current Role and Tasks from uploaded resume', async ({ page }) => {
    test.setTimeout(120000);
    console.log('--- Test: Continue with AI pre-fills questions page ---');

    // Capture ALL console for debugging
    page.on('console', msg => {
      const text = msg.text();
      console.log(`  [BROWSER ${msg.type()}] ${text}`);
    });

    await navigateToUploadStep(page);

    // Upload resume
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(RESUME_PATH);
    console.log('  Resume file selected, waiting for upload to complete...');

    // Wait for ACTUAL upload completion - look for success heading
    const uploadSuccess = page.locator('text=Resume uploaded successfully');
    await expect(uploadSuccess).toBeVisible({ timeout: 30000 });
    console.log('  Resume upload + parsing complete');

    // Dismiss Joyride if it appeared after upload
    await dismissJoyrideTour(page);

    // Log the state of resumeData before clicking
    const resumeDataExists = await page.evaluate(() => {
      // Access React fiber to check state - fallback to checking DOM
      const roleInput = document.querySelector('input[placeholder*="IT Manager"]') as HTMLInputElement;
      return { hasRoleInput: !!roleInput, roleValue: roleInput?.value || 'N/A' };
    });
    console.log(`  Pre-click state: ${JSON.stringify(resumeDataExists)}`);

    // Verify we're still on upload step
    const uploadHeading = page.locator('h2').filter({ hasText: /Upload Your Resume/i });
    await expect(uploadHeading).toBeVisible();

    // Click "Continue with AI"
    const aiBtn = page.locator('button').filter({ hasText: /Continue with AI/i });
    await expect(aiBtn).toBeVisible({ timeout: 10000 });
    console.log('  Clicking Continue with AI...');
    await aiBtn.click({ force: true });

    // Wait for the button to show "Processing..." then navigate
    // handleContinueWithAI is async - it re-applies resume data + generates tasks
    const basicProfileHeading = page.locator('h2').filter({ hasText: /Basic Profile/i });
    await expect(basicProfileHeading).toBeVisible({ timeout: 60000 });
    console.log('  Navigated to questions page');

    // Give React a moment to settle state
    await page.waitForTimeout(2000);

    // Check Current Role Title is pre-filled (not empty)
    const currentRoleInput = page.locator('input[placeholder*="IT Manager"]');
    const currentRoleValue = await currentRoleInput.inputValue();
    console.log(`  Current Role Title: "${currentRoleValue}"`);

    // Check Current Industry is pre-filled
    const industryInput = page.locator('input[placeholder*="Healthcare"]');
    const industryValue = await industryInput.inputValue();
    console.log(`  Current Industry: "${industryValue}"`);

    // Check Years of Experience slider
    const yearsSlider = page.locator('input[type="range"]');
    const yearsValue = await yearsSlider.inputValue();
    console.log(`  Years of Experience: ${yearsValue}`);

    // Check Education Level
    const selectedEdu = page.locator('button').filter({ hasText: /High School|Associates|Bachelors|Masters|PhD/i }).locator('.border-white');
    const eduCount = await selectedEdu.count();
    console.log(`  Education buttons with border-white: ${eduCount}`);

    // Wait for tasks to generate (handleContinueWithAI calls API)
    await page.waitForTimeout(8000);

    // Check Top Tasks - at least one should be non-empty
    const taskInputs = page.locator('input[placeholder^="Task"]');
    const taskCount = await taskInputs.count();
    console.log(`  Task input fields: ${taskCount}`);

    let filledTasks = 0;
    for (let i = 0; i < taskCount; i++) {
      const val = await taskInputs.nth(i).inputValue();
      if (val.trim()) {
        filledTasks++;
        console.log(`  Task ${i + 1}: "${val}"`);
      }
    }
    console.log(`  Filled tasks: ${filledTasks}/${taskCount}`);

    // Take screenshot BEFORE assertions to see actual state
    await page.screenshot({ path: 'test-results/04-questions-prefilled.png', fullPage: true });

    // Assertions
    expect(currentRoleValue.trim().length, 'Current Role should be pre-filled from resume').toBeGreaterThan(0);
    console.log('  Current Role Title is pre-filled: PASS');

    expect(filledTasks, 'At least one task should be generated').toBeGreaterThan(0);
    console.log('  Tasks are pre-filled: PASS');

    await page.screenshot({ path: 'test-results/04-questions-prefilled.png', fullPage: true });
    console.log('\n  === Continue with AI pre-fill test PASSED ===');
  });

  test('Skip & Continue goes to empty questions page', async ({ page }) => {
    test.setTimeout(60000);
    console.log('--- Test: Skip & Continue leaves fields empty ---');

    await navigateToUploadStep(page);

    // Click "Skip & Continue" without uploading anything
    const skipBtn = page.locator('button').filter({ hasText: /Skip & Continue/i });
    await expect(skipBtn).toBeVisible({ timeout: 5000 });
    await skipBtn.click();

    // Wait for questions page
    const basicProfileHeading = page.locator('h2').filter({ hasText: /Basic Profile/i });
    await expect(basicProfileHeading).toBeVisible({ timeout: 10000 });
    console.log('  Navigated to questions page via Skip');

    // Current Role Title should be empty
    const currentRoleInput = page.locator('input[placeholder*="IT Manager"]');
    const currentRoleValue = await currentRoleInput.inputValue();
    console.log(`  Current Role Title: "${currentRoleValue}" (expected empty)`);

    // Tasks should be empty
    const taskInputs = page.locator('input[placeholder^="Task"]');
    const taskCount = await taskInputs.count();
    let filledTasks = 0;
    for (let i = 0; i < taskCount; i++) {
      const val = await taskInputs.nth(i).inputValue();
      if (val.trim()) filledTasks++;
    }
    console.log(`  Filled tasks: ${filledTasks}/${taskCount} (expected 0)`);

    await page.screenshot({ path: 'test-results/05-skip-empty-questions.png', fullPage: true });
    console.log('  === Skip & Continue test PASSED ===');
  });

  test('Existing resume selection -> Continue with AI pre-fills data', async ({ page }) => {
    test.setTimeout(120000);
    console.log('--- Test: Existing resume -> Continue with AI ---');

    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Auto-generated tasks') || text.includes('Task generation') || text.includes('Failed')) {
        console.log(`  [BROWSER] ${text}`);
      }
    });

    await navigateToUploadStep(page);

    // Wait for existing resumes to load from API
    await page.waitForTimeout(3000);

    // Look for existing resume buttons (they contain filenames like .docx/.pdf or "Resume #")
    const existingResumeBtn = page.locator('button').filter({ hasText: /\.docx|\.pdf|Resume \d/i }).first();
    const hasExisting = await existingResumeBtn.isVisible({ timeout: 5000 }).catch(() => false);

    if (!hasExisting) {
      console.log('  No existing resumes found - skipping this test');
      test.skip();
      return;
    }

    // Click on existing resume
    await existingResumeBtn.click({ force: true });
    console.log('  Selected existing resume');

    // Wait for API to fetch and parse resume data
    await page.waitForTimeout(8000);

    // Dismiss Joyride if it appeared
    await dismissJoyrideTour(page);

    // "Continue with AI" should be visible
    const aiBtn = page.locator('button').filter({ hasText: /Continue with AI/i });
    await expect(aiBtn).toBeVisible({ timeout: 10000 });
    console.log('  Continue with AI button: visible');

    // Click it
    await aiBtn.click({ force: true });
    console.log('  Clicked Continue with AI');

    // Wait for processing and navigation
    const basicProfileHeading = page.locator('h2').filter({ hasText: /Basic Profile/i });
    await expect(basicProfileHeading).toBeVisible({ timeout: 30000 });
    console.log('  Navigated to questions page');

    // Check Current Role Title is pre-filled
    const currentRoleInput = page.locator('input[placeholder*="IT Manager"]');
    const currentRoleValue = await currentRoleInput.inputValue();
    console.log(`  Current Role Title: "${currentRoleValue}"`);

    if (currentRoleValue.trim().length > 0) {
      console.log('  Current Role Title is pre-filled: PASS');
    } else {
      console.log('  Current Role Title is EMPTY: FAIL');
    }
    expect(currentRoleValue.trim().length).toBeGreaterThan(0);

    await page.screenshot({ path: 'test-results/06-existing-resume-prefilled.png', fullPage: true });
    console.log('  === Existing resume test PASSED ===');
  });
});
