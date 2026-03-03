import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";
import injectHTML from 'vite-plugin-html-inject';

export default defineConfig({
  optimizeDeps: {
    exclude: ['@jsquash/webp', '@jsquash/avif']
  },
  plugins: [
    react({
      babel: {
        compact: true,
      },
    }),
    injectHTML(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [], 
      manifest: {
        name: "Brawnly App",
        short_name: "Brawnly",
        description: "Smart Fitness & Wellness Intelligence",
        theme_color: "#000000",
        background_color: "#000000",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/assets/Brawnly-favicon.svg",
            sizes: "64x64 32x32 24x24 16x16",
            type: "image/svg+xml",
          },
          {
            src: "/assets/masculineLogo.svg",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any maskable"
          },
          {
            src: "/assets/Brawnly.gif",
            sizes: "512x512",
            type: "image/gif",
          }
        ],
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ["**/*.{js,css,html}"],
        globIgnores: [
          "**/node_modules/**/*",
          "sw.js",
          "workbox-*.js",
          "assets/*.svg",
          "assets/*.gif",
          "assets/*.png",
          "assets/*.jpg",
          "assets/*.jpeg"
        ],
        runtimeCaching: [
          {
            urlPattern: /\.wasm$/,
            handler: "CacheFirst",
            options: {
              cacheName: "wasm-cache",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 31536000
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-images-cache",
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 2592000,
              }
            },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "supabase-api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 86400,
              }
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    __REACT_DEVTOOLS_GLOBAL_HOOK__: "undefined",
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    cssCodeSplit: true,
    cssMinify: true,
    minify: "terser",
    terserOptions: {
      compress: {
        passes: 3,
        drop_console: true,
        drop_debugger: true,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: "assets/js/[hash].js",
        chunkFileNames: "assets/js/[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react")) return "react-vendor";
            if (id.includes("react-dom")) return "react-dom-vendor";
            if (id.includes("supabase")) return "supabase-vendor";
            if (id.includes("@jsquash")) return "wasm-vendor";
            return "vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    target: 'es2020',
    reportCompressedSize: false,
  },
  server: {
    open: true,
  },
});