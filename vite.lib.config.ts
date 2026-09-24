import { defineConfig } from 'vite'

// Keep React and react-select external so host applications own a single runtime.
export default defineConfig({
  build: {
    lib: { entry: 'src/index.ts', formats: ['es'], fileName: 'index', cssFileName: 'style' },
    rollupOptions: { external: (id) => /^(react($|\/)|react-dom($|\/)|react-select($|\/))/.test(id) },
    outDir: 'dist', emptyOutDir: false, sourcemap: true,
  },
})
