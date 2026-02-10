import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react({
      babel: {
        compact: true,
      },
    }),

    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "Brawnly-favicon.svg",
        "masculineLogo.svg",
        "Brawnly.gif",
        "myPride.gif"
      ],

      manifest: {
        name: "Brawnly App",
        short_name: "Brawnly",
        description: "Smart Fitness & Wellness Intelligence",
        theme_color: "#000000",

        icons: [
          {
            src: "Brawnly-favicon.svg",
            sizes: "64x64 32x32 24x24 16x16",
            type: "image/svg+xml",
          },
          {
            src: "masculineLogo.svg",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any maskable"
          },
          {
            src: "Brawnly.gif",
            sizes: "512x512",
            type: "image/gif",
          }
        ],
      },

      workbox: {
        /* ⭐ EXCLUDE WASM FROM PRECACHE */
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],

        runtimeCaching: [
          /* ⭐ WASM RUNTIME CACHE FIXED */
          {
            urlPattern: /\.wasm$/,
            handler: "CacheFirst",
            options: {
              cacheName: "wasm-cache",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },

          /* ⭐ SUPABASE STORAGE IMAGES */
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "supabase-images-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 2592000,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },

          /* ⭐ SUPABASE REST API */
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "supabase-api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 86400,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
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

    sourcemap: true,
    cssCodeSplit: true,
    cssMinify: true,

    minify: "terser",

    terserOptions: {
      compress: {
        passes: 3,
        drop_console: true,
        drop_debugger: true,
        dead_code: true,
        conditionals: true,
        booleans: true,
        unused: true,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },

    rollupOptions: {
      output: {
        entryFileNames: "assets/js/[hash].js",
        chunkFileNames: "assets/js/[hash].js",
        assetFileNames: "assets/[hash][extname]",

        /* ⭐ SMART CHUNK SPLIT */
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react")) return "react-vendor";
            if (id.includes("supabase")) return "supabase-vendor";
            if (id.includes("jsquash")) return "image-codec";
            return "vendor";
          }
        },
      },
    },

    chunkSizeWarningLimit: 1500,
  },
});
