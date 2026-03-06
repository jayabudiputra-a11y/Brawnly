import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";
import injectHTML from 'vite-plugin-html-inject';
import prerender from '@prerenderer/rollup-plugin';
import Renderer from '@prerenderer/renderer-puppeteer';

const isVercel = process.env.VERCEL === '1';

export default defineConfig({
  base: '/',
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
    !isVercel && prerender({
      routes: ['/'],
      renderer: new Renderer({
        renderAfterDocumentEvent: 'render-event',
        headless: true
      }),
      // @ts-ignore
      staticDir: path.resolve(__dirname, 'dist'),
    }),
    VitePWA({
      registerType: "autoUpdate",
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
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 7 * 1024 * 1024,
        globPatterns: ["**/*.{js,css,html,svg,png,jpg,jpeg,gif,webp,wasm}"],
        globIgnores: [
          "**/assets/Brawnly-favicon.svg",
          "**/assets/favicon.svg",
          "**/assets/masculineLogo.svg",
          "**/assets/Brawnly.gif",
          "**/assets/Brawnly-17aDfvayqUvay.gif",
          "**/assets/Brawnly-17VaIyauwVGvanab8Vf.gif",
          "**/assets/myAvatar.jpg",
          "**/assets/myPride.gif"
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
                maxEntries: 100,
                maxAgeSeconds: 2592000
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
                maxEntries: 50,
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
        entryFileNames: "assets/js/[name]-[hash].js",
        chunkFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          return 'assets/[name][extname]';
        },
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("framer-motion")) return "vendor-motion";
            if (id.includes("@tanstack")) return "vendor-query";
            if (id.includes("react-dom")) return "vendor-react-dom";
            if (id.includes("react-router")) return "vendor-router";
            if (id.includes("react")) return "vendor-react";
            if (id.includes("supabase")) return "vendor-supabase";
            if (id.includes("@jsquash")) return "vendor-wasm";
            if (id.includes("lucide")) return "vendor-icons";
            if (id.includes("react-helmet")) return "vendor-helmet";
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