/**
 * Version Injection Contract Tests
 *
 * Tests that verify the version injection mechanism works correctly
 * during build process. These tests ensure:
 * 1. Version meta tag is injected into HTML
 * 2. Build date meta tag is injected into HTML
 * 3. Default version is used when VERSION env var not set
 * 4. No user-visible version text appears in UI
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Version Injection - Contract Tests', () => {
  const distPath = join(process.cwd(), 'dist');
  const indexHtmlPath = join(distPath, 'index.html');
  const aboutHtmlPath = join(distPath, 'about.html');

  describe('Build with VERSION environment variable', () => {
    beforeAll(() => {
      // Build with specific version
      process.env.VERSION = 'v1.2.3';
      execSync('npm run build', { stdio: 'inherit' });
    });

    afterAll(() => {
      delete process.env.VERSION;
    });

    it('should inject version meta tag into index.html', () => {
      expect(existsSync(indexHtmlPath)).toBe(true);
      const html = readFileSync(indexHtmlPath, 'utf-8');
      expect(html).toContain('<meta name="version" content="v1.2.3">');
    });

    it('should inject build-date meta tag into index.html', () => {
      const html = readFileSync(indexHtmlPath, 'utf-8');
      expect(html).toMatch(/<meta name="build-date" content="\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z">/);
    });

    it('should inject version meta tag into about.html', () => {
      expect(existsSync(aboutHtmlPath)).toBe(true);
      const html = readFileSync(aboutHtmlPath, 'utf-8');
      expect(html).toContain('<meta name="version" content="v1.2.3">');
    });

    it('should inject build-date meta tag into about.html', () => {
      const html = readFileSync(aboutHtmlPath, 'utf-8');
      expect(html).toMatch(/<meta name="build-date" content="\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z">/);
    });

    it('should place meta tags inside <head> element', () => {
      const html = readFileSync(indexHtmlPath, 'utf-8');
      const headStart = html.indexOf('<head');
      const headEnd = html.indexOf('</head>');
      const versionMetaIndex = html.indexOf('<meta name="version"');
      const buildDateMetaIndex = html.indexOf('<meta name="build-date"');

      expect(headStart).toBeGreaterThan(-1);
      expect(headEnd).toBeGreaterThan(headStart);
      expect(versionMetaIndex).toBeGreaterThan(headStart);
      expect(versionMetaIndex).toBeLessThan(headEnd);
      expect(buildDateMetaIndex).toBeGreaterThan(headStart);
      expect(buildDateMetaIndex).toBeLessThan(headEnd);
    });
  });

  describe('Build without VERSION environment variable', () => {
    beforeAll(() => {
      // Ensure VERSION is not set
      delete process.env.VERSION;
      execSync('npm run build', { stdio: 'inherit' });
    });

    it('should default to "v{year}.dev-local" when VERSION not set', () => {
      const html = readFileSync(indexHtmlPath, 'utf-8');
      const year = new Date().getFullYear();
      expect(html).toContain(`<meta name="version" content="v${year}.dev-local">`);
    });

    it('should still inject build-date meta tag', () => {
      const html = readFileSync(indexHtmlPath, 'utf-8');
      expect(html).toMatch(/<meta name="build-date" content="\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z">/);
    });
  });

  describe('User-visible version display', () => {
    beforeAll(() => {
      process.env.VERSION = 'v2025.001';
      execSync('npm run build', { stdio: 'inherit' });
    });

    afterAll(() => {
      delete process.env.VERSION;
    });

    it('should inject version into meta tag for portfolio-footer to read', () => {
      const html = readFileSync(indexHtmlPath, 'utf-8');
      expect(html).toContain('<meta name="version" content="v2025.001">');
    });

    it('should NOT display version in header', () => {
      const html = readFileSync(indexHtmlPath, 'utf-8');
      const headerMatch = html.match(/<header[^>]*>([\s\S]*?)<\/header>/i);
      if (headerMatch) {
        expect(headerMatch[1]).not.toMatch(/v\d{4}\.\d{3}/);
      }
    });
  });

  describe('Version format validation', () => {
    it('should accept semantic version format', () => {
      process.env.VERSION = 'v2.5.10';
      execSync('npm run build', { stdio: 'inherit' });

      const html = readFileSync(indexHtmlPath, 'utf-8');
      expect(html).toContain('<meta name="version" content="v2.5.10">');

      delete process.env.VERSION;
    });

    it('should accept dev version format', () => {
      process.env.VERSION = 'dev-a1b2c3d';
      execSync('npm run build', { stdio: 'inherit' });

      const html = readFileSync(indexHtmlPath, 'utf-8');
      expect(html).toContain('<meta name="version" content="dev-a1b2c3d">');

      delete process.env.VERSION;
    });
  });
});
