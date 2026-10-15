import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const corePath = fileURLToPath(new URL('../core', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@core': corePath,
    },
    // core/ has no node_modules: dedupe resolves these packages from this app's
    // root, so imports made inside core/ find them and only one copy exists.
    dedupe: [
      'react',
      'react-dom',
      'react-redux',
      '@reduxjs/toolkit',
      'zod',
      'react-hook-form',
      '@hookform/resolvers',
    ],
  },
  server: {
    fs: {
      // Allow the dev server to serve core/ and design/, which live outside web/.
      allow: [repoRoot],
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
