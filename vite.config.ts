import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Ajustado al nombre exacto de tu repositorio en GitHub
  base: process.env.NODE_ENV === 'production' ? '/expedientes/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Eliminé 'terser' a menos que lo tengas instalado, 
    // Vite usa 'esbuild' por defecto que es más rápido.
    minify: 'esbuild', 
  },
})