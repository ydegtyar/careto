import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import { VitePWA } from 'vite-plugin-pwa';
import svgr from 'vite-plugin-svgr';
import path from 'path';
import * as babel from '@babel/core';
import locatorBabelPlugin from '@locator/babel-jsx';

function locatorJsPlugin() {
  return {
    name: 'vite-plugin-locator-js',
    enforce: 'pre' as const,
    transform(code: string, id: string) {
      if (process.env.NODE_ENV !== 'production' && /\.[jt]sx$/.test(id) && !id.includes('node_modules')) {
        const result = babel.transformSync(code, {
          filename: id,
          configFile: false,
          babelrc: false,
          presets: [
            ['@babel/preset-typescript', { isTSX: true, allExtensions: true }],
          ],
          plugins: [locatorBabelPlugin],
          sourceMaps: true,
        });
        if (result?.code) {
          return {
            code: result.code,
            map: result.map,
          };
        }
      }
    },
  };
}

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'dev'),
  },
  plugins: [
    locatorJsPlugin(),
    TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
    react(),
    svgr(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src/workers',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      injectRegister: false,
      manifest: {
        name: 'Careto',
        short_name: 'Careto',
        description: 'Auto Expense Manager',
        theme_color: '#0a0e1a',
        background_color: '#0a0e1a',
        display: 'standalone',
        id: '/garage',
        scope: '/',
        start_url: '/garage',
        shortcuts: [
          { name: 'Add Refuel', url: '/entries/new?kind=refuel' },
          { name: 'Add Expense', url: '/entries/new?kind=expense' },
        ],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        share_target: {
          action: '/share-target',
          method: 'POST',
          enctype: 'multipart/form-data',
          params: {
            title: 'title',
            text: 'text',
            url: 'url',
            files: [
              {
                name: 'receipt',
                accept: ['image/*', 'text/plain'],
              },
            ],
          },
        },
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,wasm}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
    }),
  ],
  optimizeDeps: {
    exclude: ['@sqlite.org/sqlite-wasm'],
  },
  worker: {
    format: 'es',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [path.resolve(__dirname, './src/styles')],
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'es2022',
  },
});
