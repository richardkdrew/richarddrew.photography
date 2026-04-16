import { test, expect } from '@playwright/test';

/**
 * Gallery Layout E2E Tests
 *
 * These tests require real browser layout calculations and cannot run in JSDOM.
 * They verify responsive behaviour of the uniform-gallery component using actual
 * browser rendering.
 */

test.describe('Uniform Gallery - Responsive Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Wait for gallery to be visible and populated
    await page.waitForSelector('uniform-gallery', { state: 'visible' });
    await page.waitForSelector('.gallery-item', { timeout: 10000 });
  });

  test('should render gallery items on mobile (< 576px)', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 800 });
    await page.waitForTimeout(300);

    const items = await page.locator('.gallery-item').count();
    expect(items).toBeGreaterThan(0);

    // On mobile each item should be full-width (single column)
    const firstItem = page.locator('.gallery-item').first();
    const itemBox = await firstItem.boundingBox();
    const galleryBox = await page.locator('uniform-gallery').boundingBox();
    expect(itemBox!.width).toBeCloseTo(galleryBox!.width, -1);
  });

  test('should render gallery items on desktop (≥ 1200px)', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.waitForTimeout(300);

    const items = await page.locator('.gallery-item').count();
    expect(items).toBeGreaterThan(0);

    // On desktop items should share rows (not full width)
    const firstItem = page.locator('.gallery-item').first();
    const itemBox = await firstItem.boundingBox();
    const galleryBox = await page.locator('uniform-gallery').boundingBox();
    expect(itemBox!.width).toBeLessThan(galleryBox!.width);
  });

  test('should maintain uniform row height on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.waitForTimeout(300);

    // All items in the same row should have the same height
    const heights = await page.locator('.gallery-item').evaluateAll(
      items => items.map(el => Math.round(el.getBoundingClientRect().height))
    );

    // Every item should have the same height (uniform rows)
    const uniqueHeights = new Set(heights);
    expect(uniqueHeights.size).toBe(1);
  });

  test('should load gallery images progressively', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.waitForSelector('picture img', { state: 'visible', timeout: 10000 });

    const visibleImages = await page.locator('picture img').count();
    expect(visibleImages).toBeGreaterThan(0);
  });

  test('should have proper ARIA attributes on gallery', async ({ page }) => {
    const gallery = page.locator('uniform-gallery');

    await expect(gallery).toHaveAttribute('role', 'main');
    await expect(gallery).toHaveAttribute('aria-label');

    const ariaLabel = await gallery.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel?.toLowerCase()).toContain('gallery');
  });

  test('should switch to single-column on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(300);

    // On mobile items should stack (each takes full width, height is auto via aspect-ratio)
    const items = await page.locator('.gallery-item').all();
    expect(items.length).toBeGreaterThan(0);

    for (const item of items.slice(0, 3)) {
      const box = await item.boundingBox();
      const galleryBox = await page.locator('uniform-gallery').boundingBox();
      // Item width should be close to gallery width (within 10px for gap)
      expect(box!.width).toBeGreaterThan(galleryBox!.width * 0.9);
    }
  });
});
