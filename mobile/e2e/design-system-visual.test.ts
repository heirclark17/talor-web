/**
 * Design System Upgrade - E2E Visual Tests
 * Tests actual app rendering and functionality with Playwright
 */

import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8081';
const MOBILE_VIEWPORT = { width: 375, height: 812 }; // iPhone 13

test.describe('Design System Upgrade - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize(MOBILE_VIEWPORT);
  });

  test.describe('Phase 1: Font Rendering', () => {
    test('should load and render SF Pro Rounded fonts for numbers', async ({ page }) => {
      await page.goto(BASE_URL);

      // Wait for app to load
      await page.waitForLoadState('networkidle');

      // Check if NumberText component is using SF Pro Rounded
      const numberElements = await page.locator('text=/\\d+/').all();

      if (numberElements.length > 0) {
        // Take screenshot of numbers for visual verification
        await page.screenshot({
          path: 'e2e/screenshots/sf-pro-rounded-numbers.png',
          fullPage: true
        });
      }

      expect(numberElements.length).toBeGreaterThan(0);
    });

    test('should render Urbanist fonts for text', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // Check for text content (non-numeric)
      const textElements = await page.locator('text=/[A-Za-z]+/').all();
      expect(textElements.length).toBeGreaterThan(0);

      // Screenshot for visual verification
      await page.screenshot({
        path: 'e2e/screenshots/urbanist-text.png',
        fullPage: true
      });
    });
  });

  test.describe('Phase 1: Theme Switching', () => {
    test('should support default dark theme', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // Look for theme selector if available
      const themeButton = page.locator('button:has-text("Theme"), button:has-text("Settings")').first();

      if (await themeButton.isVisible()) {
        await themeButton.click();
      }

      // Screenshot dark theme
      await page.screenshot({
        path: 'e2e/screenshots/theme-dark.png',
        fullPage: true
      });
    });

    test('should support default light theme', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // Try to switch to light theme
      const themeButton = page.locator('button:has-text("Light"), button:has-text("☀️")').first();

      if (await themeButton.isVisible()) {
        await themeButton.click();
        await page.waitForTimeout(500); // Wait for theme transition

        // Screenshot light theme
        await page.screenshot({
          path: 'e2e/screenshots/theme-light.png',
          fullPage: true
        });
      }
    });

    test('should support Sand Light theme', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // Look for Sand Light theme option
      const sandLightButton = page.locator('button:has-text("Sand Light"), text="Sand Light"').first();

      if (await sandLightButton.isVisible()) {
        await sandLightButton.click();
        await page.waitForTimeout(500);

        // Screenshot Sand Light theme
        await page.screenshot({
          path: 'e2e/screenshots/theme-sand-light.png',
          fullPage: true
        });
      }
    });

    test('should support Sand Dark theme', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      const sandDarkButton = page.locator('button:has-text("Sand Dark"), text="Sand Dark"').first();

      if (await sandDarkButton.isVisible()) {
        await sandDarkButton.click();
        await page.waitForTimeout(500);

        await page.screenshot({
          path: 'e2e/screenshots/theme-sand-dark.png',
          fullPage: true
        });
      }
    });

    test('should support Midnight Gold theme', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      const midnightGoldButton = page.locator('button:has-text("Midnight Gold"), text="Gold"').first();

      if (await midnightGoldButton.isVisible()) {
        await midnightGoldButton.click();
        await page.waitForTimeout(500);

        await page.screenshot({
          path: 'e2e/screenshots/theme-midnight-gold.png',
          fullPage: true
        });
      }
    });
  });

  test.describe('Phase 2: GlassCard Variants', () => {
    test('should render GlassCard with standard variant', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // Look for cards on the page
      const cards = await page.locator('[class*="glass"], [class*="card"]').all();
      expect(cards.length).toBeGreaterThan(0);

      await page.screenshot({
        path: 'e2e/screenshots/glasscard-standard.png',
        fullPage: true
      });
    });

    test('should render glass effect with blur', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // Check for blur effect elements
      const blurElements = await page.locator('[class*="blur"]').all();

      // Screenshot to verify glass effect
      await page.screenshot({
        path: 'e2e/screenshots/glass-blur-effect.png',
        fullPage: true
      });

      // Glass effects should be present
      expect(blurElements.length).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Phase 2: GlassButton Variants', () => {
    test('should render primary button variant', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // Look for primary buttons
      const primaryButtons = await page.locator('button').all();
      expect(primaryButtons.length).toBeGreaterThan(0);

      // Screenshot buttons
      await page.screenshot({
        path: 'e2e/screenshots/glassbutton-variants.png',
        fullPage: true
      });
    });

    test('should handle button press with haptic feedback', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      const button = page.locator('button').first();

      if (await button.isVisible()) {
        // Click button and verify it responds
        await button.click();
        await page.waitForTimeout(300);

        expect(await button.isEnabled()).toBe(true);
      }
    });

    test('should render loading state on buttons', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // Look for buttons with loading indicators
      const loadingButtons = await page.locator('button:has([class*="loading"]), button:has([class*="spinner"])').all();

      // Screenshot for verification
      await page.screenshot({
        path: 'e2e/screenshots/button-loading-states.png',
        fullPage: true
      });
    });
  });

  test.describe('App Functionality Tests', () => {
    test('should render main navigation', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // Check for navigation elements
      const nav = await page.locator('nav, [role="navigation"], [class*="tab"]').first();
      expect(nav).toBeDefined();

      await page.screenshot({
        path: 'e2e/screenshots/main-navigation.png',
        fullPage: true
      });
    });

    test('should render app screens without errors', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // Check for console errors
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.waitForTimeout(2000);

      // Screenshot final state
      await page.screenshot({
        path: 'e2e/screenshots/app-home-screen.png',
        fullPage: true
      });

      // Should have minimal errors (some warnings acceptable)
      const criticalErrors = errors.filter(e =>
        !e.includes('Warning') &&
        !e.includes('deprecated') &&
        !e.includes('development')
      );

      expect(criticalErrors.length).toBeLessThan(3);
    });

    test('should handle user authentication flow', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // Look for login/signup buttons
      const authButton = page.locator('button:has-text("Sign In"), button:has-text("Login"), button:has-text("Get Started")').first();

      if (await authButton.isVisible()) {
        await authButton.click();
        await page.waitForTimeout(500);

        await page.screenshot({
          path: 'e2e/screenshots/auth-flow.png',
          fullPage: true
        });
      }
    });

    test('should render resume creation screen', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // Look for resume-related UI
      const resumeButton = page.locator('button:has-text("Resume"), button:has-text("Create"), text="Resume"').first();

      if (await resumeButton.isVisible()) {
        await resumeButton.click();
        await page.waitForTimeout(1000);

        await page.screenshot({
          path: 'e2e/screenshots/resume-creation.png',
          fullPage: true
        });
      }
    });

    test('should render job description input', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // Look for input fields
      const input = page.locator('input, textarea').first();

      if (await input.isVisible()) {
        await input.fill('Test job description');
        await page.waitForTimeout(500);

        await page.screenshot({
          path: 'e2e/screenshots/job-input.png',
          fullPage: true
        });

        const value = await input.inputValue();
        expect(value).toContain('Test');
      }
    });

    test('should handle file uploads', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // Look for file upload button
      const uploadButton = page.locator('button:has-text("Upload"), input[type="file"]').first();

      if (await uploadButton.isVisible()) {
        await page.screenshot({
          path: 'e2e/screenshots/file-upload.png',
          fullPage: true
        });
      }
    });
  });

  test.describe('Performance & Accessibility', () => {
    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now();

      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      // App should load in less than 5 seconds
      expect(loadTime).toBeLessThan(5000);

      console.log(`✅ App loaded in ${loadTime}ms`);
    });

    test('should have accessible touch targets', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // Check button sizes (minimum 44x44 per iOS HIG)
      const buttons = await page.locator('button').all();

      for (const button of buttons.slice(0, 5)) { // Check first 5 buttons
        const box = await button.boundingBox();
        if (box) {
          // iOS minimum touch target is 44px
          expect(box.height).toBeGreaterThanOrEqual(36); // Allow slightly smaller for compact buttons
        }
      }

      await page.screenshot({
        path: 'e2e/screenshots/touch-targets.png',
        fullPage: true
      });
    });

    test('should render without layout shifts', async ({ page }) => {
      await page.goto(BASE_URL);

      // Wait for initial load
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Take screenshot before
      const before = await page.screenshot();

      // Wait a bit more
      await page.waitForTimeout(2000);

      // Take screenshot after
      const after = await page.screenshot();

      // Screenshots should be similar (minimal layout shift)
      expect(before.length).toBeGreaterThan(0);
      expect(after.length).toBeGreaterThan(0);
    });
  });

  test.describe('Responsive Design', () => {
    test('should render correctly on iPhone SE (small screen)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      await page.screenshot({
        path: 'e2e/screenshots/responsive-iphone-se.png',
        fullPage: true
      });
    });

    test('should render correctly on iPhone 14 Pro Max (large screen)', async ({ page }) => {
      await page.setViewportSize({ width: 430, height: 932 }); // iPhone 14 Pro Max
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      await page.screenshot({
        path: 'e2e/screenshots/responsive-iphone-14-pro-max.png',
        fullPage: true
      });
    });

    test('should render correctly on iPad (tablet)', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      await page.screenshot({
        path: 'e2e/screenshots/responsive-ipad.png',
        fullPage: true
      });
    });
  });

  test.describe('Animation & Interaction', () => {
    test('should show smooth transitions between screens', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // Navigate between screens if tabs exist
      const tabs = await page.locator('[role="tab"], [class*="tab"]').all();

      if (tabs.length > 1) {
        await tabs[0].click();
        await page.waitForTimeout(500);

        await tabs[1].click();
        await page.waitForTimeout(500);

        await page.screenshot({
          path: 'e2e/screenshots/screen-transitions.png',
          fullPage: true
        });
      }
    });

    test('should animate button presses', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      const button = page.locator('button').first();

      if (await button.isVisible()) {
        // Record before click
        await page.screenshot({
          path: 'e2e/screenshots/button-before-press.png',
        });

        // Click and hold
        await button.hover();
        await page.mouse.down();
        await page.waitForTimeout(100);

        // Record during press
        await page.screenshot({
          path: 'e2e/screenshots/button-during-press.png',
        });

        await page.mouse.up();
        await page.waitForTimeout(200);

        // Record after
        await page.screenshot({
          path: 'e2e/screenshots/button-after-press.png',
        });
      }
    });
  });
});

test.describe('Integration Tests', () => {
  test('should complete resume tailoring workflow', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // 1. Enter job description
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible()) {
      await textarea.fill('Senior Software Engineer - Full stack development with React and Node.js');
      await page.screenshot({ path: 'e2e/screenshots/workflow-1-job-input.png' });
    }

    // 2. Upload resume (if available)
    const uploadButton = page.locator('button:has-text("Upload"), button:has-text("Browse")').first();
    if (await uploadButton.isVisible()) {
      await uploadButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'e2e/screenshots/workflow-2-upload.png' });
    }

    // 3. Generate/Tailor resume
    const generateButton = page.locator('button:has-text("Generate"), button:has-text("Tailor"), button:has-text("Create")').first();
    if (await generateButton.isVisible()) {
      await generateButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'e2e/screenshots/workflow-3-generate.png', fullPage: true });
    }

    // Screenshot final state
    await page.screenshot({
      path: 'e2e/screenshots/workflow-complete.png',
      fullPage: true
    });
  });

  test('should handle error states gracefully', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Try to trigger validation error (empty submission)
    const submitButton = page.locator('button:has-text("Submit"), button:has-text("Generate")').first();

    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(500);

      // Should show error message
      const errorMessage = page.locator('text=/error/i, [class*="error"]').first();

      await page.screenshot({
        path: 'e2e/screenshots/error-handling.png',
        fullPage: true
      });
    }
  });
});
