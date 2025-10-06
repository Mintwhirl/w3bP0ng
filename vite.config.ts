import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/w3bP0ng/', // GitHub Pages deployment path
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@engine': path.resolve(__dirname, './src/engine'),
      '@rendering': path.resolve(__dirname, './src/rendering'),
      '@audio': path.resolve(__dirname, './src/audio'),
      '@ai': path.resolve(__dirname, './src/ai'),
      '@modes': path.resolve(__dirname, './src/modes'),
      '@ui': path.resolve(__dirname, './src/ui'),
      '@powerups': path.resolve(__dirname, './src/powerups'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
  build: {
    target: 'es2020',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-game': ['pixi.js', 'tone', 'zustand', 'gsap'],
        },
      },
    },
  },
  server: {
    port: 5173,
  },
});
