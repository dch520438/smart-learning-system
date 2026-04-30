import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 自动生成Service Worker，解决PWA黄色警告
    VitePWA({
      registerType: 'autoUpdate',
      // 内置完整manifest配置，自动生成文件，避免手动路径错误
      manifest: {
        name: "智慧学习系统",
        short_name: "智慧学习",
        start_url: "/smart-learning-system/",
        display: "standalone",
        background_color: "#f0f5ff",
        theme_color: "#2563eb",
        description: "全学科智慧学习整理系统",
        orientation: "fullSensor",
        scope: "/smart-learning-system/",
        lang: "zh-CN",
        icons: [
          {
            src: "icons/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "icons/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "icons/maskable-icon.png",
            sizes: "1024x1024",
            type: "image/png",
            purpose: "maskable"
          }
        ],
        permissions: ["camera", "microphone", "storage"],
        features: ["camera", "microphone", "local_storage"]
      },
      workbox: {
        globPatterns: ['**/*.{html,js,css,ico,png,svg,woff,woff2,webmanifest}'],
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
  // 关键修正：构建产物直接输出到docs目录，无需手动重命名dist
  build: {
    outDir: 'docs',
    emptyOutDir: true
  },
  server: {
    port: 5174,
    open: true
  }
})
