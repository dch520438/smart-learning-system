import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // PWA配置，自动生成Service Worker
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false,
      // 缓存所有静态资源，实现离线访问
      workbox: {
        globPatterns: ['**/*.{html,js,css,ico,png,svg,woff,woff2,webmanifest}'],
        // 运行时缓存，确保API、图片资源正常加载
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'external-resources',
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  // 必须：和仓库名完全一致，前后斜杠不能少
  base: '/smart-learning-system/',
  server: {
    port: 5174,
    open: true
  }
})
