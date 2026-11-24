import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  publicDir: 'public',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (
            id.includes('/react/') ||
            id.includes('\\react\\') ||
            id.includes('/react-dom/') ||
            id.includes('\\react-dom\\') ||
            id.includes('/react-router/') ||
            id.includes('\\react-router\\') ||
            id.includes('/scheduler/') ||
            id.includes('\\scheduler\\')
          ) {
            return 'vendor';
          }
          if (id.includes('@firebase/auth') || id.includes('firebase/auth')) {
            return 'firebase-auth';
          }
          if (id.includes('@firebase/') || id.includes('/firebase/') || id.includes('\\firebase\\')) {
            return 'firebase';
          }
          if (
            id.includes('/motion/') ||
            id.includes('\\motion\\') ||
            id.includes('/framer-motion/') ||
            id.includes('\\framer-motion\\') ||
            id.includes('/motion-dom/') ||
            id.includes('\\motion-dom\\') ||
            id.includes('/motion-utils/') ||
            id.includes('\\motion-utils\\')
          ) {
            return 'motion';
          }
          if (
            id.includes('/radix-ui/') ||
            id.includes('\\radix-ui\\') ||
            id.includes('/@radix-ui/') ||
            id.includes('\\@radix-ui\\') ||
            id.includes('/@tabler/') ||
            id.includes('\\@tabler\\') ||
            id.includes('/sonner/') ||
            id.includes('\\sonner\\')
          ) {
            return 'ui';
          }
          return undefined;
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setup.js',
    css: true
  }
});
