import { defineConfig } from 'vite'
import path from 'path';

export default defineConfig({
  resolve: {
    root: './',
    base: '/',
    publicDir: './public',
    alias: {
      '@': path.resolve(__dirname, 'src'),
      components: path.resolve(__dirname, 'src/components'),
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
  build: {
    sourcemap: true,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 2000,
  },
  server: {
    host: 'localhost',
    port: 3000,
  }
})
