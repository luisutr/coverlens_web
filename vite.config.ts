import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const disableHmr = process.env.COVERLENS_NO_HMR === '1';

const proxy = {
  '/api': {
    target: 'http://127.0.0.1:8080',
    changeOrigin: true,
  },
  '/games': {
    target: 'http://127.0.0.1:8080',
    changeOrigin: true,
  },
  '/covers': {
    target: 'http://127.0.0.1:8080',
    changeOrigin: true,
  },
};

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    hmr: disableHmr ? false : true,
    proxy,
  },
  preview: {
    host: true,
    port: 5173,
    strictPort: true,
    proxy,
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
