import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
      '/ws': {
        target: 'ws://localhost:3001',
        ws: true
      }
    }
  },
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT || 4173,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '.railway.app',
      '.up.railway.app'
    ]
  }
}); 