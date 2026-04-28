import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths"
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/smart-learning-system/',

  // 强制使用本地正常地址，彻底解决 EADDRNOTAVAIL
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
  },

  // 预览构建结果也用正确IP
  preview: {
    host: '0.0.0.0',
    port: 5173,
  },

  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    tsconfigPaths(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-192x192.svg', 'pwa-512x512.svg'],
      manifest: {
        name: '智慧学习整理系统',
        short_name: '智慧学习',
        description: '全学科学习整理与错题管理平台',
        theme_color: '#3B82F6',
        background_color: '#ffffff',
        start_url: '/smart-learning-system/',
        display: 'standalone',
        display_override: ['standalone', 'fullscreen'],
        lang: 'zh-CN',
        scope: '/smart-learning-system/',
        orientation: 'portrait-primary',
        icons: [
          {
            src: 'pwa-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: '知识归纳',
            short_name: '知识',
            url: '/smart-learning-system/knowledge',
            description: '管理知识点'
          },
          {
            name: '必背必记',
            short_name: '必记',
            url: '/smart-learning-system/memorize',
            description: '记忆检测'
          },
          {
            name: '错题整理',
            short_name: '错题',
            url: '/smart-learning-system/mistakes',
            description: '错题分析'
          }
        ],
        prefer_related_applications: false
      },
      workbox: {
        globPatterns: [
          '**/*.{html,js,css,ico,png,svg,jpg,jpeg,gif,woff,woff2,ttf,eot,json}'
        ],
        navigateFallback: '/smart-learning-system/index.html',
        maximumFileSizeToCacheInBytes: 999999999,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
})
