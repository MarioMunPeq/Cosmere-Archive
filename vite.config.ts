import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'path'

export default defineConfig({
  base: '/Cosmere-Archive/',
  build: {
    target: 'es2022',
    cssMinify: 'esbuild',
    chunkSizeWarningLimit: 1000,
    sourcemap: process.env.CI ? 'hidden' : false,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router/') ||
            id.includes('node_modules/react-router-dom/')
          )
            return 'vendor'
          if (id.includes('node_modules/d3-force') || id.includes('node_modules/d3-')) return 'd3'
          if (id.includes('node_modules/@tanstack/react-virtual')) return 'virtual'
        },
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    ...(process.env.ANALYZE
      ? [visualizer({ open: true, filename: 'dist/stats.html', gzipSize: true, brotliSize: true })]
      : []),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png', 'screenshots/*.png'],
      manifest: {
        name: 'Cosmere Archive',
        short_name: 'Cosmere Archive',
        description: 'Interactive visual encyclopedia of the Cosmere universe by Brandon Sanderson',
        start_url: '/Cosmere-Archive/',
        scope: '/Cosmere-Archive/',
        display: 'standalone',
        background_color: '#030712',
        theme_color: '#a855f7',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
        screenshots: [
          { src: '/screenshots/home.png', sizes: '1080x720', type: 'image/png', form_factor: 'wide' },
          { src: '/screenshots/characters.png', sizes: '1080x720', type: 'image/png', form_factor: 'wide' },
          { src: '/screenshots/timeline.png', sizes: '1080x720', type: 'image/png', form_factor: 'wide' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,json,png,svg,ico,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /\/screenshots\//,
            handler: 'CacheFirst',
            options: { cacheName: 'screenshots', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 } },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
