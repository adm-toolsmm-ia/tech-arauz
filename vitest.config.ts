import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: [
      'src/components/ui/__tests__/*.a11y.test.tsx',
      'src/components/organization/__tests__/*.test.tsx',
      'src/app/actions/__tests__/*.test.ts',
      'src/lib/**/__tests__/*.test.ts',
      'src/integrations/**/__tests__/*.test.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
