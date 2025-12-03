// D:\projects\fitapp-2025\vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// ✅ ambil Supabase URL dari env (AMAN)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',

      manifest: {
        name: 'Fitapp',
        short_name: 'Fitapp',
        description: 'LGBTQ+ Fitness Inspiration & Muscle Worship Blog',
        theme_color: '#10b981',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',

        icons: [
          {
            src: '/masculine-fitness-icon--128x128--minimalist-vector.svg',
            sizes: '128x128',
            type: 'image/svg+xml'
          },
          {
            src: '/masculine-fitness-icon--128x128--minimalist-vector.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: '/masculine-fitness-icon--128x128--minimalist-vector.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },

      workbox: {
        runtimeCaching: [
          {
            // Cache gambar umum
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          {
            // ✅ Supabase caching — tanpa hardcoded domain
            // Hanya cache GET dan bukan Functions
            urlPattern: ({ url, request }) => {
              if (!SUPABASE_URL) return false

              const isSupabase = url.href.startsWith(SUPABASE_URL)
              const isFunction = url.pathname.startsWith('/functions/v1/')
              const isGET = request.method === 'GET'

              return isSupabase && !isFunction && isGET
            },

            handler: 'NetworkFirst',

            options: {
              cacheName: 'supabase',
              networkTimeoutSeconds: 10,
            },
          },
        ],
      },
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 5173,
    open: true,
    host: true,
  },

  build: {
    outDir: 'dist',
    sourcemap: true,

    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router')
            ) {
              return 'vendor'
            }

            if (
              id.includes('lucide') ||
              id.includes('framer-motion')
            ) {
              return 'ui'
            }
          }
        },
      },
    },
  },
})
