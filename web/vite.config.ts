import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const corePath = fileURLToPath(new URL('../core', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@core': corePath,
    },
    // core/ has no node_modules: dedupe resolves these packages from this app's
    // root, so imports made inside core/ find them and only one copy exists.
    dedupe: ['react', 'react-dom', 'react-redux', '@reduxjs/toolkit', 'zod'],
  },
  server: {
    fs: {
      // Allow the dev server to serve core/ and design/, which live outside web/.
      allow: [repoRoot],
    },
  },
})
