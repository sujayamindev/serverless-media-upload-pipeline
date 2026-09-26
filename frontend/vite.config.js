import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis'
  },
  build: {
    // The CloudFront CSP has no data: in font-src/default-src, so never inline assets.
    assetsInlineLimit: 0
  }
})
