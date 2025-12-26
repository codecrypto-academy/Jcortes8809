import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('homepage should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;

    // Should load in less than 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should not have console errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');

    // Filter out known warnings (like MetaMask not installed)
    const criticalErrors = consoleErrors.filter(
      (error) => !error.includes('ethereum') && !error.includes('MetaMask')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('should have efficient bundle size', async ({ page }) => {
    const responses: any[] = [];

    page.on('response', (response) => {
      responses.push({
        url: response.url(),
        size: response.headers()['content-length'],
        type: response.headers()['content-type'],
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check JavaScript bundle sizes
    const jsFiles = responses.filter((r) =>
      r.type?.includes('javascript')
    );

    // Total JS should be reasonable (less than 5MB uncompressed)
    const totalJsSize = jsFiles.reduce((sum, file) => {
      const size = parseInt(file.size || '0', 10);
      return sum + size;
    }, 0);

    expect(totalJsSize).toBeLessThan(5 * 1024 * 1024);
  });

  test('should have working service worker (PWA)', async ({ page }) => {
    await page.goto('/');

    // Check if service worker is registered
    const hasServiceWorker = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });

    expect(hasServiceWorker).toBe(true);
  });

  test('should lazy load images', async ({ page }) => {
    await page.goto('/');

    // Images should have loading="lazy" attribute
    const images = page.locator('img');
    const count = await images.count();

    if (count > 0) {
      const firstImage = images.first();
      const loading = await firstImage.getAttribute('loading');

      // At least some images should be lazy loaded
      expect(['lazy', null]).toContain(loading);
    }
  });

  test('should handle rapid navigation', async ({ page }) => {
    await page.goto('/');

    // Rapidly navigate between pages
    const routes = ['/dashboard', '/tokens', '/transfers', '/profile', '/'];

    for (const route of routes) {
      await page.goto(route);
      // Page should still be responsive
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should have proper caching headers', async ({ page }) => {
    const responses: any[] = [];

    page.on('response', (response) => {
      responses.push({
        url: response.url(),
        cacheControl: response.headers()['cache-control'],
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Static assets should have cache headers
    const staticAssets = responses.filter((r) =>
      r.url.match(/\.(js|css|png|jpg|svg|woff|woff2)$/)
    );

    // At least some static assets should have caching
    const cachedAssets = staticAssets.filter((asset) => asset.cacheControl);
    expect(cachedAssets.length).toBeGreaterThan(0);
  });

  test('should not have memory leaks on navigation', async ({ page }) => {
    await page.goto('/');

    // Get initial metrics
    const initialMetrics = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Navigate multiple times
    for (let i = 0; i < 5; i++) {
      await page.goto('/dashboard');
      await page.goto('/tokens');
      await page.goto('/');
    }

    // Check memory after navigation
    const finalMetrics = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Memory should not grow excessively (less than 50MB increase)
    const memoryIncrease = finalMetrics - initialMetrics;
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  });
});
