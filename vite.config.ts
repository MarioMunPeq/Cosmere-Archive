import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/Cosmere-Archive/',
  plugins: [
    react(),
    tailwindcss(), // Tailwind CSS v4 as a Vite plugin
  ],
  resolve: {
    alias: {
      // "@" is a shortcut for "./src", so we can write "import X from '@/types'"
      // instead of "../../../src/types". This keeps imports clean as the project grows.
      '@': path.resolve(__dirname, './src'),
    },
  },
})
