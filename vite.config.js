/**
 * Vite Configuration for Solar360
 */
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  publicDir: false, // No usar publicDir, los archivos están en la raíz
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    },
    copyPublicDir: false
  },
  server: {
    port: 3000,
    open: true,
    cors: true,
    fs: {
      // Permitir servir archivos desde la raíz del proyecto
      allow: ['..']
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'assets/js'),
      '@config': resolve(__dirname, 'assets/js/config'),
      '@utils': resolve(__dirname, 'assets/js/utils'),
      '@components': resolve(__dirname, 'assets/js/components')
    }
  }
});

