/**
 * Vite Configuration for Solar360
 */
import { defineConfig } from 'vite';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  root: '.',
  publicDir: false,
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'images/**/*',
          dest: 'images'
        },
        {
          src: 'styles.css',
          dest: '.'
        }
      ]
    })
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        sobreNosotros: resolve(__dirname, 'sobre-nosotros.html')
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

