import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: '0.0.0.0',  // 允许局域网访问
    allowedHosts: [   // 允许访问的主机列表
      'teeny-clinographic-shani.ngrok-free.dev',
      '.ngrok-free.dev'
    ],
    proxy: {
      '/api': {
      target: 'http://localhost:8080',  // 后端
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')  // 去掉 /api 前缀
      }
    }
  }
})
