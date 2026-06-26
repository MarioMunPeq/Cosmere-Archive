import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/Cosmere-Archive/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router/')
          )
            return 'vendor'
        },
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(), // Tailwind CSS v4 as a Vite plugin
    ...(process.env.ANALYZE ? [visualizer({ open: true })] : []),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
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
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,json,png,svg,ico,woff2}'],
        runtimeCaching: [],
      },
    }),
  ],
  resolve: {
    alias: {
      // "@" is a shortcut for "./src", so we can write "import X from '@/types'"
      // instead of "../../../src/types". This keeps imports clean as the project grows.
      '@': path.resolve(__dirname, './src'),
    },
  },
})
