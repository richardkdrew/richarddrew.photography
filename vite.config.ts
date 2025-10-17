/// <reference types="vitest" />
import { defineConfig } from 'vite'
import { resolve } from 'path'
import { versionInjector } from './src/plugins/vite-plugin-version-injector'

export default defineConfig({
  plugins: [versionInjector()],
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        '404': resolve(__dirname, '404.html')
      }
    }
  },
  server: {
    port: 3000,
    host: true,
    fs: {
      strict: false
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.{test,spec}.{js,ts}'],
    exclude: ['tests/manual/**']
  }
})