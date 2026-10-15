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
  /**
   * M1 · Block 8
   *
   * `@react-three/fiber` and `@react-three/drei` are excluded from dependency
   * pre-bundling. Without this, Vite's optimiser folds `three` into a single
   * 861 KB `react-three-fiber.esm` chunk, and `manualChunks` cannot split inside
   * an already-pre-bundled dependency. Excluding them lets Rollup see three as
   * individual modules, which is what makes the `three` / `r3f` split below
   * possible. Both packages ship ESM, so excluding them is safe.
   */
  optimizeDeps: {
    exclude: ['@react-three/fiber', '@react-three/drei'],
  },
  build: {
    target: 'es2022',
    cssMinify: 'esbuild',
    /**
     * Was 1000 KB, which silenced the warning about the 861 KB three chunk
     * instead of addressing it. The three chunk now sits just under this
     * ceiling; anything larger is a regression and should fail loudly.
     */
    chunkSizeWarningLimit: 400,
    sourcemap: process.env.CI ? 'hidden' : false,
    rollupOptions: {
      output: {
        /**
         * Rolldown (Vite 8) absorbs a `manualChunks` entry into its only
         * importer, so `three` was merged back into `r3f` — nothing else imports
         * it — leaving a single 872 KB chunk. `codeSplitting.groups` is honoured
         * as declared, so the split actually holds.
         *
         * `priority` is highest-wins, so the catch-all group sits last at 10.
         * Patterns use `[\\/]` as Rolldown documents for cross-platform safety,
         * and are anchored on a trailing separator so `node_modules/three/`
         * cannot also capture `node_modules/three-stdlib/`. Under pnpm the real
         * paths look like `node_modules/.pnpm/<pkg>@<ver>/node_modules/<pkg>/…`
         * and match as well.
         */
        codeSplitting: {
          groups: [
            // Higher priority wins, so the catch-all must be last.
            {
              name: 'vendor',
              priority: 40,
              test: /node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/,
            },
            { name: 'd3', priority: 35, test: /node_modules[\\/]d3-(force|dispatch|quadtree|timer)[\\/]/ },
            { name: 'gsap', priority: 35, test: /node_modules[\\/]gsap[\\/]/ },
            { name: 'three', priority: 30, test: /node_modules[\\/]three[\\/]/, maxSize: 380 * 1024 },
            { name: 'r3f', priority: 30, test: /node_modules[\\/]@react-three[\\/]/ },
            { name: 'vendor-misc', priority: 10, test: /node_modules[\\/]/ },
          ],
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
