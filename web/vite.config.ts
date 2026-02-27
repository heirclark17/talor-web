import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['lucide-react', 'react-hot-toast'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'https://resume-ai-backend-production-3134.up.railway.app',
        changeOrigin: true,
        secure: true,
        // 5-minute timeout for long-running AI operations (Firecrawl + Perplexity + OpenAI)
        timeout: 300_000,
        proxyTimeout: 300_000,
      },
    },
  },
  define: {
    'process.env': {},
  },
})
