import { test, expect } from '@playwright/test';
async function bypassAuth(page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('talor_user_id', 'test-playwright-user');
    const s = { access_token: 'fake', refresh_token: 'fake', expires_at: Math.floor(Date.now()/1000)+3600, expires_in: 3600, token_type: 'bearer', user: { id: 'test-playwright-user', email: 'test@playwright.dev', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: new Date().toISOString() }};
    localStorage.setItem('sb-yokyxytijxmkdbrezzzb-auth-token', JSON.stringify(s));
    localStorage.setItem('talor_onboarding_complete', 'true');
  });
  await page.reload();
}
test.describe('Phase 09: applications', () => {
  test.beforeEach(async ({ page }) => { await bypassAuth(page); await page.goto('/applications'); });
  test('should load page', async ({ page }) => { await expect(page).toHaveURL(/\/applications/); await expect(page.locator('body')).toBeVisible(); });
  test('should work on mobile', async ({ page }) => { await page.setViewportSize({ width: 375, height: 667 }); await expect(page.locator('body')).toBeVisible(); });
});
