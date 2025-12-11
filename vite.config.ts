import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  // Service Worker faylini to'g'ridan-to'g'ri nusxalash
  publicDir: 'public' 
});