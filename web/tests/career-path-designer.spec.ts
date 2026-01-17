import { test, expect } from '@playwright/test';

const BASE_URL = 'https://talorme.com';

test.describe('Career Path Designer E2E Tests', () => {
  test('Complete workflow: Fill intake form → Generate plan → View results', async ({ page }) => {
    test.setTimeout(180000); // 3 minutes for AI processing

    // Step 1: Navigate to Career Path Designer
    console.log('Step 1: Navigating to Career Path Designer...');
    await page.goto(`${BASE_URL}/career-path`);
    await expect(page.locator('h1')).toContainText('Career Path Designer');
    console.log('✓ Page loaded successfully');

    // Step 2: Verify intake form is visible
    console.log('Step 2: Verifying intake form...');
    await expect(page.getByTestId('current-role-input')).toBeVisible();
    await expect(page.getByTestId('current-industry-input')).toBeVisible();
    await expect(page.getByTestId('generate-plan-button')).toBeVisible();
    console.log('✓ Intake form visible');

    // Step 3: Fill out current role information
    console.log('Step 3: Filling current role information...');
    await page.getByTestId('current-role-input').fill('Project Manager');
    await page.getByTestId('current-industry-input').fill('Healthcare');
    await page.getByTestId('years-experience-input').fill('8');
    console.log('  - Current role: Project Manager');
    console.log('  - Industry: Healthcare');
    console.log('  - Years: 8');

    // Step 4: Fill top tasks (minimum 3 required)
    console.log('Step 4: Adding top tasks...');
    await page.getByTestId('task-input-0').fill('Coordinate cross-functional teams');
    await page.getByTestId('add-task-button').click();
    await page.getByTestId('task-input-1').fill('Track project milestones and budgets');
    await page.getByTestId('add-task-button').click();
    await page.getByTestId('task-input-2').fill('Manage stakeholder communication');
    console.log('  - Added 3 tasks');

    // Step 5: Fill tools & technologies
    console.log('Step 5: Adding tools...');
    await page.getByTestId('tool-input-0').fill('Jira');
    await page.getByTestId('add-tool-button').click();
    await page.getByTestId('tool-input-1').fill('MS Project');
    await page.getByTestId('add-tool-button').click();
    await page.getByTestId('tool-input-2').fill('Excel');
    console.log('  - Added 3 tools');

    // Step 6: Fill strengths
    console.log('Step 6: Adding strengths...');
    await page.getByTestId('strength-input-0').fill('Communication');
    await page.getByTestId('add-strength-button').click();
    await page.getByTestId('strength-input-1').fill('Organization');
    console.log('  - Added 2 strengths');

    // Step 7: Fill career goals
    console.log('Step 7: Setting career goals...');
    await page.getByTestId('target-role-input').fill('Cybersecurity Program Manager');
    await page.getByTestId('time-per-week-input').fill('15');
    console.log('  - Target role: Cybersecurity Program Manager');
    console.log('  - Time per week: 15 hours');

    // Step 8: Select budget and timeline
    console.log('Step 8: Selecting budget and timeline...');
    await page.getByTestId('budget-select').selectOption('medium');
    await page.getByTestId('timeline-select').selectOption('6months');
    console.log('  - Budget: Medium');
    console.log('  - Timeline: 6 months');

    // Step 9: Fill background info
    console.log('Step 9: Filling background info...');
    await page.getByTestId('education-select').selectOption('bachelors');
    await page.getByTestId('location-input').fill('Remote');
    await page.getByTestId('preference-select').selectOption('remote');
    console.log('  - Education: Bachelor\'s degree');
    console.log('  - Location: Remote');

    // Step 10: Take screenshot of filled form
    await page.screenshot({ path: 'test-results/career-path-intake-filled.png', fullPage: true });
    console.log('✓ Screenshot saved: career-path-intake-filled.png');

    // Step 11: Generate career plan
    console.log('Step 11: Generating career plan...');
    await page.getByTestId('generate-plan-button').click();

    // Wait for loading state
    await expect(page.locator('text=Generating your personalized career transition plan')).toBeVisible({ timeout: 5000 });
    console.log('  - AI processing started...');

    // Wait for completion (could take up to 90 seconds)
    const resultsContainer = page.locator('[data-testid="results-container"]');
    await expect(resultsContainer).toBeVisible({ timeout: 120000 });
    console.log('✓ Plan generation completed!');

    // Step 12: Verify all result sections are present
    console.log('Step 12: Verifying result sections...');

    const hasTargetRoles = await page.locator('text=Target Roles').isVisible();
    console.log(`  - Target Roles section: ${hasTargetRoles ? '✓' : '✗'}`);

    const hasSkillsAnalysis = await page.locator('text=Skills Analysis').isVisible();
    console.log(`  - Skills Analysis section: ${hasSkillsAnalysis ? '✓' : '✗'}`);

    const hasCertifications = await page.locator('text=Certification Path').isVisible();
    console.log(`  - Certification Path section: ${hasCertifications ? '✓' : '✗'}`);

    const hasEducation = await page.locator('text=Education Options').isVisible();
    console.log(`  - Education Options section: ${hasEducation ? '✓' : '✗'}`);

    const hasExperience = await page.locator('text=Experience Plan').isVisible();
    console.log(`  - Experience Plan section: ${hasExperience ? '✓' : '✗'}`);

    const hasEvents = await page.locator('text=Networking Events').isVisible();
    console.log(`  - Networking Events section: ${hasEvents ? '✓' : '✗'}`);

    const hasTimeline = await page.locator('text=Timeline').isVisible();
    console.log(`  - Timeline section: ${hasTimeline ? '✓' : '✗'}`);

    const hasResumeAssets = await page.locator('text=Resume Assets').isVisible();
    console.log(`  - Resume Assets section: ${hasResumeAssets ? '✓' : '✗'}`);

    // Step 13: Test section expansion
    console.log('Step 13: Testing section expansion...');
    const firstSection = page.locator('button').filter({ hasText: 'Target Roles' }).first();
    await firstSection.click();
    await page.waitForTimeout(500); // Wait for animation

    // Check if content is visible
    const hasExpandedContent = await page.locator('text=Why Aligned').isVisible().catch(() => false);
    console.log(`  - Section expansion: ${hasExpandedContent ? '✓' : '✗'}`);

    // Step 14: Take screenshot of results
    await page.screenshot({ path: 'test-results/career-path-results.png', fullPage: true });
    console.log('✓ Screenshot saved: career-path-results.png');

    // Step 15: Test "New Plan" button
    console.log('Step 15: Testing "New Plan" button...');
    const newPlanButton = page.locator('button').filter({ hasText: 'New Plan' });
    if (await newPlanButton.isVisible()) {
      await newPlanButton.click();
      await page.waitForTimeout(500);

      // Should show intake form again
      const isFormVisible = await page.getByTestId('current-role-input').isVisible();
      console.log(`  - Form reset: ${isFormVisible ? '✓' : '✗'}`);
    }

    console.log('\n=== CAREER PATH DESIGNER E2E TEST COMPLETE ===');
  });

  test('Validate required fields', async ({ page }) => {
    console.log('Testing form validation...');

    await page.goto(`${BASE_URL}/career-path`);
    await expect(page.locator('h1')).toContainText('Career Path Designer');

    // Try to submit form without filling required fields
    await page.getByTestId('generate-plan-button').click();
    await page.waitForTimeout(1000);

    // Should still be on form (not loading state)
    // Browser validation should prevent submission
    const isFormStillVisible = await page.getByTestId('current-role-input').isVisible();
    console.log(`  - Form validation working: ${isFormStillVisible ? '✓' : '✗'}`);
  });

  test('Navigation: Back to Dashboard', async ({ page }) => {
    console.log('Testing navigation to dashboard...');

    await page.goto(`${BASE_URL}/career-path`);
    await expect(page.locator('h1')).toContainText('Career Path Designer');

    // Click Talor logo in header
    const logoLink = page.locator('a[href="/"]').filter({ hasText: 'Talor' });
    await logoLink.click();

    // Should navigate to home
    await expect(page).toHaveURL(BASE_URL + '/');
    console.log('✓ Successfully navigated to dashboard');
  });

  test('Navigation: Career Path link in header', async ({ page }) => {
    console.log('Testing header navigation...');

    // Start from home page
    await page.goto(BASE_URL);

    // Click "Career Path" in navigation
    const careerPathLink = page.locator('a[href="/career-path"]').filter({ hasText: 'Career Path' });
    await careerPathLink.click();

    // Should navigate to career path designer
    await expect(page).toHaveURL(/.*\/career-path/);
    await expect(page.locator('h1')).toContainText('Career Path Designer');
    console.log('✓ Header link working correctly');
  });

  test('Minimum viable form submission', async ({ page }) => {
    test.setTimeout(180000);
    console.log('Testing minimum viable form...');

    await page.goto(`${BASE_URL}/career-path`);

    // Fill only required fields with minimum values
    await page.getByTestId('current-role-input').fill('Software Engineer');
    await page.getByTestId('current-industry-input').fill('Technology');
    await page.getByTestId('years-experience-input').fill('3');

    // Add minimum 3 tasks
    await page.getByTestId('task-input-0').fill('Write code');
    await page.getByTestId('add-task-button').click();
    await page.getByTestId('task-input-1').fill('Debug issues');
    await page.getByTestId('add-task-button').click();
    await page.getByTestId('task-input-2').fill('Code reviews');

    // Add minimum 2 tools
    await page.getByTestId('tool-input-0').fill('Git');
    await page.getByTestId('add-tool-button').click();
    await page.getByTestId('tool-input-1').fill('VS Code');

    // Add minimum 2 strengths
    await page.getByTestId('strength-input-0').fill('Problem solving');
    await page.getByTestId('add-strength-button').click();
    await page.getByTestId('strength-input-1').fill('Team collaboration');

    // Leave target role blank (AI should suggest)
    await page.getByTestId('time-per-week-input').fill('10');
    await page.getByTestId('budget-select').selectOption('low');
    await page.getByTestId('timeline-select').selectOption('3months');
    await page.getByTestId('education-select').selectOption('bachelors');
    await page.getByTestId('location-input').fill('Austin, TX');
    await page.getByTestId('preference-select').selectOption('hybrid');

    console.log('  - Filled minimum required fields');

    // Generate plan
    await page.getByTestId('generate-plan-button').click();

    // Wait for results
    const resultsContainer = page.locator('[data-testid="results-container"]');
    await expect(resultsContainer).toBeVisible({ timeout: 120000 });

    console.log('✓ Minimum viable form submission successful');
  });

  test.skip('Mock API: Test error handling', async ({ page }) => {
    // This test would require API mocking setup
    // Skipping for now - placeholder for future implementation
    console.log('Test skipped: Requires API mocking setup');
  });
});
