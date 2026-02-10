import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'https://resume-ai-backend-production-3134.up.railway.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  define: {
    'process.env': {},
  },
})
