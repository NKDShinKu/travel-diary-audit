import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path';
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      { find: '@/*', replacement: path.resolve(__dirname, 'src/*') },
    ],
  },
  server: {
    proxy: {
      // 开发环境下的API代理配置
      '/api': {
        target: 'https://travel.achamster.live',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
