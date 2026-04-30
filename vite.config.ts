import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// 智慧学习系统 Vite 完整配置
export default defineConfig({
  plugins: [
    react(),
    // PWA完整合规配置，自动生成manifest和Service Worker
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      // 完全匹配你public目录下的图标文件名，彻底解决路径报错
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
        // 【关键修正】完全匹配你现有的图标文件名，无多余路径
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "maskable-icon.png",
            sizes: "1024x1024",
            type: "image/png",
            purpose: "maskable"
          }
        ],
        // 声明硬件权限，确保拍照、语音功能正常使用
        permissions: ["camera", "microphone", "storage"],
        features: ["camera", "microphone", "local_storage"]
      },
      // Service Worker配置，解决离线访问、PWA警告问题
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
  // 必须：和你的仓库名完全一致，前后斜杠不能少
  base: '/smart-learning-system/',
  // 构建输出到docs目录，适配GitHub Pages部署
  build: {
    outDir: 'docs',
    emptyOutDir: true
  },
  server: {
    port: 5174,
    open: true
  }
})
