import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mockBackend from './mock/mockBackend.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // `npm run dev:mock` simulates the AWS backend locally (see mock/mockBackend.js).
  plugins: [react(), mode === 'mock' && mockBackend()],
  define: {
    global: 'globalThis'
  },
  build: {
    // The CloudFront CSP has no data: in font-src/default-src, so never inline assets.
    assetsInlineLimit: 0
  }
}))
