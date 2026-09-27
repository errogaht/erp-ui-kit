import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Behavioral tests exercise public components with native DOM interactions.
export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', setupFiles: ['./tests/setup.ts'], include: ['tests/**/*.test.tsx'] },
})
