import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const coopCoepHeaders = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
}

export default defineConfig({
  base: '/back-dev-guide/',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    target: 'esnext',
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: { headers: coopCoepHeaders },
  preview: { headers: coopCoepHeaders },
})
