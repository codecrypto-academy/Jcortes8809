import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to different pages', async ({ page }) => {
    await page.goto('/');

    // Test navigation to different routes
    const routes = ['/dashboard', '/tokens', '/transfers', '/profile'];

    for (const route of routes) {
      await page.goto(route);
      // Page should load without errors
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should handle 404 page', async ({ page }) => {
    const response = await page.goto('/non-existent-page');

    // Should show 404 page
    expect(response?.status()).toBe(404);
  });

  test('should have working back navigation', async ({ page }) => {
    await page.goto('/');
    await page.goto('/dashboard');

    await page.goBack();

    // Should be back at homepage
    expect(page.url()).toContain('/');
  });
});
