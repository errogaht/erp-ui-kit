import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The public site contains generic examples only; it has no application data.
export default defineConfig({
  root: 'docs', base: '/erp-ui-kit/', plugins: [react()],
  build: { outDir: '../site', emptyOutDir: true },
})
