import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');

    // Should display the page title
    await expect(page).toHaveTitle(/Supply Chain Tracker/);
  });

  test('should show connect wallet button when not connected', async ({ page }) => {
    await page.goto('/');

    // Should have a connect wallet button or similar element
    const connectButton = page.getByRole('button', { name: /connect wallet/i });
    await expect(connectButton).toBeVisible();
  });

  test('should display language selector', async ({ page }) => {
    await page.goto('/');

    // Should have language selector
    const languageButton = page.getByRole('button').filter({ hasText: /English|Español/ });
    await expect(languageButton).toBeVisible();
  });

  test('should be able to switch language', async ({ page }) => {
    await page.goto('/');

    // Open language selector
    const languageButton = page.getByRole('button').filter({ hasText: /English|Español/ }).first();
    await languageButton.click();

    // Click on language option
    const spanishOption = page.getByRole('menuitem', { name: /Español/i });
    await expect(spanishOption).toBeVisible();
  });

  test('should have navigation links', async ({ page }) => {
    await page.goto('/');

    // Should have navigation elements
    const nav = page.locator('nav, header').first();
    await expect(nav).toBeVisible();
  });
});
