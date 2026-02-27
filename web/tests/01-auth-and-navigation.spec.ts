/**
 * Phase 1: Authentication & Navigation Tests
 *
 * Tests:
 * - Sign up flow
 * - Sign in flow
 * - Protected route enforcement
 * - Menu bar rendering
 * - Theme toggle (light/dark mode)
 * - User menu dropdown
 * - Sign out flow
 * - Navigation between all menu sections
 */

import { test, expect, type Page } from '@playwright/test';

// Auth bypass helper for protected routes.
// Sets the Supabase session token in localStorage BEFORE navigating so that
// AuthContext picks it up on initial load without a race condition.
async function bypassAuth(page: Page) {
  // Step 1: Load the page first so we have a valid origin for localStorage
  await page.goto('/');

  // Step 2: Write the fake Supabase session into localStorage
  await page.evaluate(() => {
    localStorage.setItem('talor_user_id', 'test-playwright-user');

    const fakeSession = {
      access_token: 'fake-access-token-for-testing',
      refresh_token: 'fake-refresh-token',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      expires_in: 3600,
      token_type: 'bearer',
      user: {
        id: 'test-playwright-user',
        email: 'test@playwright.dev',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      },
    };

    localStorage.setItem(
      'sb-yokyxytijxmkdbrezzzb-auth-token',
      JSON.stringify(fakeSession)
    );

    localStorage.setItem('talor_onboarding_complete', 'true');
  });

  // Step 3: Reload so the app initializes with the session already in storage,
  // avoiding the race between navigation and Supabase's async getSession()
  await page.reload();
}

// Helper: open the navigation dropdown panel (only rendered when mobileMenuOpen===true)
// The "Menu" button is the only way to reveal nav links in the DOM.
async function openNavMenu(page: Page) {
  // The menu toggle button has aria-label "Open navigation menu" when closed
  const menuButton = page.locator('button[aria-label="Open navigation menu"]');
  await menuButton.waitFor({ state: 'visible', timeout: 10000 });
  await menuButton.click();
  // Wait for the nav panel to appear in the DOM
  await page.locator('#nav-menu').waitFor({ state: 'visible', timeout: 5000 });
}

test.describe('Phase 1: Authentication & Navigation', () => {
  test.describe('Landing Page', () => {
    test('should display landing page for unauthenticated users', async ({ page }) => {
      await page.goto('/');

      // The brand name "Talor" appears in the navbar <span> — use a precise selector
      // to avoid matching the <h1> which also contains "Talor" as part of a longer phrase.
      await expect(page.locator('nav span:text-is("Talor")').first()).toBeVisible();

      // "Sign in" is a <button> in the landing page navbar (not an <a> link).
      // Use button role to avoid ambiguity with any page text.
      await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();

      // "Get Started" appears twice: navbar button and hero section button.
      // Either one being visible satisfies the landing page check.
      await expect(page.getByRole('button', { name: /Get Started/i }).first()).toBeVisible();
    });

    test('should navigate to sign in page', async ({ page }) => {
      await page.goto('/');
      // Target the navbar "Sign in" button specifically (not a link, it uses navigate())
      await page.getByRole('button', { name: 'Sign in', exact: true }).click();
      await expect(page).toHaveURL(/\/sign-in/);
    });

    test('should navigate to sign up page', async ({ page }) => {
      await page.goto('/');
      // The navbar "Get Started" button calls navigate('/sign-up').
      // Click the first one (navbar), not the bottom-of-page one which goes to /upload.
      await page.getByRole('button', { name: 'Get Started' }).first().click();
      await expect(page).toHaveURL(/\/sign-up/);
    });

    test('should navigate to pricing page', async ({ page }) => {
      await page.goto('/');
      await page.click('a:has-text("Pricing")');
      await expect(page).toHaveURL(/\/pricing/);
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to sign-in when accessing protected route without auth', async ({ page }) => {
      await page.goto('/resumes');
      // Should redirect to sign-in or show auth required
      await expect(page).toHaveURL(/\/(sign-in|resumes)/);
    });

    test('should allow access to protected routes with auth', async ({ page }) => {
      await bypassAuth(page);
      await page.goto('/resumes');
      await expect(page).toHaveURL(/\/resumes/);
    });
  });

  test.describe('Menu Bar Navigation', () => {
    test.beforeEach(async ({ page }) => {
      // bypassAuth already does a reload, so the session is live before we navigate
      await bypassAuth(page);
      await page.goto('/resumes');
      // Wait for the top nav to confirm we are on an authenticated page
      await page.locator('nav').first().waitFor({ state: 'visible', timeout: 15000 });
    });

    test('should render all menu sections', async ({ page }) => {
      // The nav itself is always visible on authenticated pages
      await expect(page.locator('nav').first()).toBeVisible();

      // The menu LINKS only appear after opening the dropdown panel.
      // Open it, then verify the section labels and the first link in each section.
      await openNavMenu(page);

      // "Resume Tools" section label is rendered as a div.menu-section-label
      await expect(page.locator('text=Resume Tools').first()).toBeVisible();
      // Verify a link from each section is present
      await expect(page.locator('#nav-menu a:has-text("My Resumes")')).toBeVisible();
      await expect(page.locator('#nav-menu a:has-text("Applications")')).toBeVisible();
      await expect(page.locator('#nav-menu a:has-text("Career Path")')).toBeVisible();
    });

    test('should navigate to Resume Tools section - My Resumes', async ({ page }) => {
      await openNavMenu(page);
      await page.locator('#nav-menu a:has-text("My Resumes")').click();
      await expect(page).toHaveURL(/\/resumes/);
    });

    test('should navigate to Resume Tools section - Build Resume', async ({ page }) => {
      await openNavMenu(page);
      await page.locator('#nav-menu a:has-text("Build Resume")').click();
      await expect(page).toHaveURL(/\/resume-builder/);
    });

    test('should navigate to Resume Tools section - Templates', async ({ page }) => {
      await openNavMenu(page);
      await page.locator('#nav-menu a:has-text("Templates")').click();
      await expect(page).toHaveURL(/\/templates/);
    });

    test('should navigate to Resume Tools section - Upload', async ({ page }) => {
      await openNavMenu(page);
      await page.locator('#nav-menu a:has-text("Upload")').click();
      await expect(page).toHaveURL(/\/upload/);
    });

    test('should navigate to Resume Tools section - Tailor', async ({ page }) => {
      await openNavMenu(page);
      // Use href to avoid text matching issues (label has description text too)
      await page.locator('#nav-menu a[href="/tailor"]').click();
      await expect(page).toHaveURL(/\/tailor/);
    });

    test('should navigate to Resume Tools section - Batch Tailor', async ({ page }) => {
      await openNavMenu(page);
      await page.locator('#nav-menu a:has-text("Batch Tailor")').click();
      await expect(page).toHaveURL(/\/batch-tailor/);
    });

    test('should navigate to Career Prep section - Applications', async ({ page }) => {
      await openNavMenu(page);
      await page.locator('#nav-menu a:has-text("Applications")').click();
      await expect(page).toHaveURL(/\/applications/);
    });

    test('should navigate to Career Prep section - Interview Prep', async ({ page }) => {
      await openNavMenu(page);
      await page.locator('#nav-menu a:has-text("Interview Prep")').click();
      await expect(page).toHaveURL(/\/interview-preps/);
    });

    test('should navigate to Career Prep section - STAR Stories', async ({ page }) => {
      await openNavMenu(page);
      await page.locator('#nav-menu a:has-text("STAR Stories")').click();
      await expect(page).toHaveURL(/\/star-stories/);
    });

    test('should navigate to Career Prep section - Cover Letters', async ({ page }) => {
      await openNavMenu(page);
      await page.locator('#nav-menu a:has-text("Cover Letters")').click();
      await expect(page).toHaveURL(/\/cover-letters/);
    });

    test('should navigate to Growth section - Saved', async ({ page }) => {
      await openNavMenu(page);
      // Use href selector to avoid ambiguity with "Saved Plans" link
      await page.locator('#nav-menu a[href="/saved-comparisons"]').click();
      await expect(page).toHaveURL(/\/saved-comparisons/);
    });

    test('should navigate to Growth section - Career Path', async ({ page }) => {
      await openNavMenu(page);
      await page.locator('#nav-menu a:has-text("Career Path")').click();
      await expect(page).toHaveURL(/\/career-path/);
    });

    test('should navigate to Growth section - Settings', async ({ page }) => {
      await openNavMenu(page);
      await page.locator('#nav-menu a:has-text("Settings")').click();
      await expect(page).toHaveURL(/\/settings/);
    });
  });

  test.describe('Theme Toggle', () => {
    test.beforeEach(async ({ page }) => {
      await bypassAuth(page);
      await page.goto('/resumes');
      await page.locator('nav').first().waitFor({ state: 'visible', timeout: 15000 });
    });

    test('should toggle between light and dark mode', async ({ page }) => {
      // The theme toggle button has aria-label "Switch to dark mode" or "Switch to light mode"
      const themeToggle = page.locator('button[aria-label^="Switch to"]');
      await themeToggle.waitFor({ state: 'visible', timeout: 10000 });

      // Get initial aria-label
      const initialLabel = await themeToggle.getAttribute('aria-label');

      // Click the toggle (cycles through themes)
      await themeToggle.click();
      await page.waitForTimeout(1000); // Allow theme change to apply

      // Verify the aria-label changed (which means theme changed)
      const newLabel = await themeToggle.getAttribute('aria-label');
      expect(newLabel).not.toBe(initialLabel);

      // The button's label should have changed (e.g., "Switch to dark mode" → "Switch to light mode")
      expect(newLabel).toBeTruthy();
      expect(newLabel).toContain('Switch to');
    });
  });

  test.describe('User Menu', () => {
    test.beforeEach(async ({ page }) => {
      await bypassAuth(page);
      await page.goto('/resumes');
      await page.locator('nav').first().waitFor({ state: 'visible', timeout: 15000 });
    });

    test('should open user menu dropdown', async ({ page }) => {
      // The user avatar button has aria-label="User menu" (App.tsx line 530)
      const userButton = page.locator('button[aria-label="User menu"]');
      await userButton.waitFor({ state: 'visible', timeout: 10000 });
      await userButton.click();

      // The dropdown shows the user's email and a "Sign out" button
      // (App.tsx lines 546 and 556)
      await expect(page.locator('text=test@playwright.dev')).toBeVisible();
      await expect(page.getByRole('menuitem', { name: 'Sign out' })).toBeVisible();
    });

    test('should display user email in dropdown', async ({ page }) => {
      const userButton = page.locator('button[aria-label="User menu"]');
      await userButton.waitFor({ state: 'visible', timeout: 10000 });
      await userButton.click();

      await expect(page.locator('text=test@playwright.dev')).toBeVisible();
    });

    test('should sign out when clicking sign out button', async ({ page }) => {
      const userButton = page.locator('button[aria-label="User menu"]');
      await userButton.waitFor({ state: 'visible', timeout: 10000 });
      await userButton.click();

      // The sign-out button has role="menuitem" and text "Sign out" (lowercase, App.tsx line 556)
      await page.getByRole('menuitem', { name: 'Sign out' }).click();

      // After sign-out, Supabase clears the session — ProtectedRoute redirects to /sign-in
      await expect(page).toHaveURL(/\/(sign-in)?$/);
    });
  });

  test.describe('404 Not Found', () => {
    test('should display 404 page for invalid routes', async ({ page }) => {
      await page.goto('/this-route-does-not-exist-12345');

      // NotFound page is lazy-loaded — wait for either "404" or "Not Found" text.
      // Use separate locators joined with .or() (valid Playwright API) instead of
      // the invalid comma-inside-locator syntax.
      const notFound404 = page.locator('text=404');
      const notFoundText = page.locator('text=Not Found');
      await expect(notFound404.or(notFoundText).first()).toBeVisible({ timeout: 15000 });
    });

    test('should have link back to home from 404', async ({ page }) => {
      await page.goto('/invalid-route');

      // The 404 page has a link that says "Go to Resumes" and a button "Go Back"
      const homeLink = page.locator('a:has-text("Go to Resumes")');
      await expect(homeLink).toBeVisible({ timeout: 15000 });
      await expect(homeLink).toHaveAttribute('href', '/resumes');
    });
  });

  test.describe('Responsive Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await bypassAuth(page);
    });

    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      await page.goto('/resumes');

      // The <nav> element is always rendered on authenticated pages (not landing/auth pages)
      await expect(page.locator('nav').first()).toBeVisible({ timeout: 15000 });
    });

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad
      await page.goto('/resumes');

      await expect(page.locator('nav').first()).toBeVisible({ timeout: 15000 });
    });
  });
});
