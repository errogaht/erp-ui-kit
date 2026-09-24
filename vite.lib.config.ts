import { defineConfig } from 'vite'

// Keep runtime dependencies external so consumers can tree-shake the AI chat and own one React runtime.
export default defineConfig({
  build: {
    lib: { entry: 'src/index.ts', formats: ['es'], fileName: 'index', cssFileName: 'style' },
    rollupOptions: { external: (id) => /^(react($|\/)|react-dom($|\/)|react-select($|\/)|react-markdown($|\/)|remark-gfm($|\/)|@tiptap\/(core|react|pm|starter-kit|extension-placeholder|extension-image)($|\/))/.test(id) },
    outDir: 'dist', emptyOutDir: false, sourcemap: true,
  },
})
