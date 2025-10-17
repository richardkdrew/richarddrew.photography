/**
 * Vite Plugin: Version Injector
 *
 * Injects version and build date into HTML meta tags during build.
 *
 * Meta tags injected:
 * - <meta name="version" content="v1.0.0"> (or "dev-local" if VERSION not set)
 * - <meta name="build-date" content="2025-10-16T14:32:00Z">
 *
 * Usage in vite.config.ts:
 * import { versionInjector } from './src/plugins/vite-plugin-version-injector';
 *
 * export default defineConfig({
 *   plugins: [versionInjector()]
 * });
 */

import type { Plugin } from 'vite';

export function versionInjector(): Plugin {
  const version = process.env.VERSION || 'dev-local';
  const buildDate = new Date().toISOString();

  return {
    name: 'version-injector',

    transformIndexHtml(html: string) {
      // Inject version and build-date meta tags into <head>
      const versionMeta = `<meta name="version" content="${version}">`;
      const buildDateMeta = `<meta name="build-date" content="${buildDate}">`;

      // Insert before closing </head> tag
      const headCloseIndex = html.indexOf('</head>');

      if (headCloseIndex === -1) {
        console.warn('vite-plugin-version-injector: </head> tag not found, skipping injection');
        return html;
      }

      return html.slice(0, headCloseIndex) +
        `    ${versionMeta}\n` +
        `    ${buildDateMeta}\n` +
        html.slice(headCloseIndex);
    }
  };
}
