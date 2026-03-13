import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        // In local dev, forward /api calls to the local Express backend
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
    build: {
      // Raise the chunk size warning limit slightly — Cropper.js is large by design
      chunkSizeWarningLimit: 600,
    },
  };
});
