import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    // 自动生成service worker，实现离线可用
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{html,js,css,ico,png,svg,json,webp}'],
        navigateFallback: '/index.html'
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  // 关键：适配路径，避免找不到文件
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // 强制复制public文件夹的内容到dist根目录
    publicDir: 'public'
  },
  server: {
    port: 5174
  }
})
