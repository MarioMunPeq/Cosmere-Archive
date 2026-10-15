import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'path'
import type { Plugin } from 'vite'

/**
 * M1 · Block 4
 * Injects <link rel="preload" as="font"> for the self-hosted woff2 files that
 * src/design/fonts.css references. Vite fingerprints those assets, so the href
 * is only known at build time and cannot be written by hand in index.html.
 *
 * Only the `normal` faces are preloaded: they are the ones used above the fold.
 * The italic display face is fetched lazily by the browser when first needed.
 */
const CRITICAL_FONTS = ['eb-garamond-latin-wght-normal', 'inter-latin-wght-normal']

function fontPreload(): Plugin {
  let base = '/'
  return {
    name: 'font-preload',
    apply: 'build',
    configResolved(config) {
      base = config.base
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const bundle = ctx.bundle
        if (!bundle) return html

        const hrefs = Object.keys(bundle)
          .filter((f) => CRITICAL_FONTS.some((n) => f.includes(n)) && f.endsWith('.woff2'))
          .map((f) => `${base}${f}`)

        if (hrefs.length === 0) return html

        const tags = hrefs
          .map((h) => `<link rel="preload" href="${h}" as="font" type="font/woff2" crossorigin>`)
          .join('\n    ')

        return html.includes('</title>')
          ? html.replace('</title>', `</title>\n    ${tags}`)
          : html.replace(/<head>/, `<head>\n    ${tags}`)
      },
    },
  }
}

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
        },
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    fontPreload(),
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
