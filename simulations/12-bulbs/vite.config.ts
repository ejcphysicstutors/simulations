
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/simulations/simulations/12-bulbs/', // Add this line here!
  server: {
    port: 3000
  }
});
