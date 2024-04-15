import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import path from "path";
const currentDir = new URL('.', import.meta.url).pathname;

export default defineConfig({
  plugins: [
    react(),
    wasm(),
    topLevelAwait()
  ],
  resolve: { // Add this resolve configuration
    alias: {
      '@': path.resolve(currentDir, './src'),
      '@collections': path.resolve(currentDir, './tldraw-collections/src'),
    },
  },
})
