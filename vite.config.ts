import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const SUPABASE_URL = env.VITE_SUPABASE_URL || "";

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: "auto",
        manifest: {
          name: "Fitapp",
          short_name: "Fitapp",
          description: "LGBTQ+ Fitness Inspiration & Muscle Worship Blog",
          theme_color: "#10b981",
          background_color: "#ffffff",
          display: "standalone",
          orientation: "portrait-primary",
          icons: [
            {
              src: "/masculine-logo.svg",
              sizes: "512x512",
              type: "image/svg+xml",
              purpose: "any maskable"
            }
          ]
        },
        // Simplified workbox configuration
        workbox: {
          runtimeCaching: [
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
              handler: "CacheFirst",
              options: {
                cacheName: "images",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
                }
              }
            },
            // Simplified Supabase caching
            {
              urlPattern: ({ url }) => {
                return url.href.startsWith(SUPABASE_URL) && 
                       !url.pathname.includes("/auth/") &&
                       !url.pathname.includes("/storage/");
              },
              handler: "NetworkFirst",
              options: {
                cacheName: "supabase-api",
                networkTimeoutSeconds: 10
              }
            }
          ]
        }
      })
    ],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src")
      }
    },

    server: {
      port: 5173,
      open: true,
      host: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'X-Content-Type-Options': 'nosniff',
      }
    },

    build: {
      outDir: "dist",
      sourcemap: true,
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name]-[hash].js`,
          chunkFileNames: `assets/[name]-[hash].js`,
          assetFileNames: `assets/[name]-[hash].[ext]`,
          
          manualChunks: id => {
            if (id.includes("node_modules")) {
              if (
                id.includes("react") ||
                id.includes("react-dom") ||
                id.includes("react-router")
              ) {
                return "vendor";
              }
              if (id.includes("lucide") || id.includes("framer-motion")) {
                return "ui";
              }
            }
          }
        }
      }
    },

    preview: {
      port: 4173,
      strictPort: true,
    }
  };
});