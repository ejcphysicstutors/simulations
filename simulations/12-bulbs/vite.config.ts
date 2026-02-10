
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    base: '/simulations/simulations/12-bulbs/'
    build: {
    rollupOptions: {
      input: 'index.html' // Explicitly tell it index.html is in the root
    }
  }
});
