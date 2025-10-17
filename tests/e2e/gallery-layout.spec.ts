import { test, expect } from '@playwright/test';

/**
 * Gallery Layout E2E Tests
 *
 * These tests require real browser layout calculations and cannot run in JSDOM.
 * They verify responsive breakpoints, column layout, and aspect ratio preservation
 * using actual browser rendering.
 *
 * Tests converted from: tests/gallery/gallery-masonry-layout.test.ts
 */

test.describe('Masonry Gallery - Responsive Layout', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to gallery page
    await page.goto('/');

    // Wait for gallery to be visible and loaded
    await page.waitForSelector('masonry-gallery', { state: 'visible' });

    // Wait for images to start loading (manifest loaded)
    await page.waitForSelector('.masonry-column', { timeout: 10000 });
  });

  test('should display 1-3 columns on mobile (< 768px)', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 400, height: 800 });

    // Wait for layout to recalculate
    await page.waitForTimeout(500);

    // Count columns
    const columns = await page.locator('.masonry-column').count();

    // On mobile, should typically be 1-3 columns
    expect(columns).toBeGreaterThanOrEqual(1);
    expect(columns).toBeLessThanOrEqual(3);
  });

  test('should display 3+ columns on desktop (≥ 1200px)', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1400, height: 900 });

    // Wait for layout to recalculate
    await page.waitForTimeout(500);

    // Count columns
    const columns = await page.locator('.masonry-column').count();

    // Desktop should have 3 or more columns
    expect(columns).toBeGreaterThanOrEqual(3);
  });

  test('should maintain image aspect ratios', async ({ page }) => {
    // Use desktop viewport for consistent testing
    await page.setViewportSize({ width: 1200, height: 900 });

    // Wait for images to load
    await page.waitForSelector('picture img', { state: 'visible' });

    // Get first few images
    const images = page.locator('picture img').first();

    // Wait for image to load
    await images.waitFor({ state: 'visible' });

    // Check that image has aspect-ratio CSS applied
    const aspectRatio = await images.evaluate((img) => {
      const computed = window.getComputedStyle(img);
      return computed.aspectRatio;
    });

    // Should have aspect-ratio set (not 'auto')
    expect(aspectRatio).toBeTruthy();
    expect(aspectRatio).not.toBe('auto');
  });

  test('should display columns on tablet (768-1023px)', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 800, height: 1024 });

    // Wait for layout
    await page.waitForTimeout(500);

    const columns = await page.locator('.masonry-column').count();

    // Tablet should have 1-4 columns
    expect(columns).toBeGreaterThanOrEqual(1);
    expect(columns).toBeLessThanOrEqual(4);
  });

  test('should display columns on large tablet (1024-1199px)', async ({ page }) => {
    // Set large tablet viewport
    await page.setViewportSize({ width: 1100, height: 800 });

    // Wait for layout
    await page.waitForTimeout(500);

    const columns = await page.locator('.masonry-column').count();

    // Large tablet should have 1-5 columns
    expect(columns).toBeGreaterThanOrEqual(1);
    expect(columns).toBeLessThanOrEqual(5);
  });

  test('should recalculate layout on resize', async ({ page }) => {
    // Start with desktop
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.waitForTimeout(500);

    const desktopColumns = await page.locator('.masonry-column').count();
    expect(desktopColumns).toBeGreaterThanOrEqual(3);

    // Resize to mobile
    await page.setViewportSize({ width: 400, height: 800 });
    await page.waitForTimeout(500);

    const mobileColumns = await page.locator('.masonry-column').count();
    expect(mobileColumns).toBeLessThanOrEqual(3);

    // Mobile should have fewer columns than desktop
    expect(mobileColumns).toBeLessThan(desktopColumns);
  });

  test('should load gallery images progressively', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1200, height: 900 });

    // Wait for at least some images to load
    await page.waitForSelector('picture img', { state: 'visible', timeout: 10000 });

    // Count visible images
    const visibleImages = await page.locator('picture img').count();

    // Should have loaded multiple images
    expect(visibleImages).toBeGreaterThan(0);
  });

  test('should have proper ARIA attributes on gallery', async ({ page }) => {
    const gallery = page.locator('masonry-gallery');

    // Check ARIA attributes
    await expect(gallery).toHaveAttribute('role', 'main');
    await expect(gallery).toHaveAttribute('aria-label');

    const ariaLabel = await gallery.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel).toContain('gallery');
  });
});
