import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  // Rutas relativas para que el build sirva igual en la raiz de un dominio
  // o en un subdirectorio como el de GitHub Pages.
  base: './',
  // GitHub Pages publica desde la rama main, carpeta /docs, asi que el build
  // se versiona en el repo en lugar de ir a dist/.
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
