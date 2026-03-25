import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import injectHTML from 'vite-plugin-html-inject';

// ── Dev SW stub ───────────────────────────────────────────────────────────────
// Browser mencoba auto-update /sw.js dari cache lama → Vite tidak serve file
// ini → 404 → error "Not found". Fix: serve SW stub minimal di dev mode agar
// browser mendapat 200 dan langsung unregister sendiri (self.registration.unregister).
// Di production tidak aktif — Vite server hanya jalan saat `vite dev`.
// ─────────────────────────────────────────────────────────────────────────────
const devSwStub = `
// DEV STUB — unregister this service worker immediately
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.registration.unregister());
`;

const devSwMiddleware = {
  name: 'dev-sw-stub',
  apply: 'serve' as const,
  configureServer(server: any) {
    server.middlewares.use('/sw.js', (_req: any, res: any) => {
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Cache-Control', 'no-store');
      res.end(devSwStub);
    });
  },
};

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
    devSwMiddleware,
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
      compress: { passes: 3, drop_console: true, drop_debugger: true },
      mangle: { safari10: true },
      format: { comments: false },
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
          return 'assets/[name]-[hash][extname]';
        },
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("react-dom"))        return "vendor-react-dom";
          if (id.includes("react-router"))     return "vendor-router";
          if (id.includes("react-helmet"))     return "vendor-helmet";
          if (id.includes("react"))            return "vendor-react";
          if (id.includes("framer-motion"))    return "vendor-motion";
          if (id.includes("gsap"))             return "vendor-gsap";
          if (id.includes("@tanstack"))        return "vendor-query";
          if (id.includes("@supabase") ||
              id.includes("supabase"))         return "vendor-supabase";
          if (id.includes("zustand"))          return "vendor-state";
          if (id.includes("zod"))             return "vendor-zod";
          if (id.includes("@jsquash"))         return "vendor-wasm";
          if (id.includes("lucide"))           return "vendor-icons";
          if (id.includes("date-fns"))         return "vendor-datefns";
          if (id.includes("sonner") ||
              id.includes("react-hot-toast"))  return "vendor-toast";
          if (id.includes("react-hook-form") ||
              id.includes("@hookform"))        return "vendor-form";
          if (id.includes("react-share"))      return "vendor-share";
          if (id.includes("clsx") ||
              id.includes("tailwind-merge"))   return "vendor-css-utils";
          return "vendor-misc";
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    target: 'es2020',
    reportCompressedSize: false,
  },
  server: {
    open: true,
    proxy: {
      // ── Dev CORS proxy ────────────────────────────────────────────────────
      // Hanya aktif di localhost — di production tidak digunakan.
      // TwitterEmbed fetch ke /dev-proxy/allorigins?url=... → diteruskan
      // melalui Vite Node.js server sehingga tidak kena browser CORS block.
      // ─────────────────────────────────────────────────────────────────────
      '/dev-proxy/allorigins': {
        target: 'https://api.allorigins.win',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dev-proxy\/allorigins/, '/get'),
        configure: (proxy) => {
          proxy.on('error', () => {});
          proxy.on('proxyRes', (proxyRes) => {
            proxyRes.headers['access-control-allow-origin'] = '*';
          });
        },
      },
      '/dev-proxy/codetabs': {
        target: 'https://api.codetabs.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dev-proxy\/codetabs/, '/v1/proxy'),
        configure: (proxy) => {
          proxy.on('error', () => {});
          proxy.on('proxyRes', (proxyRes) => {
            proxyRes.headers['access-control-allow-origin'] = '*';
          });
        },
      },
      '/dev-proxy/syndication': {
        target: 'https://cdn.syndication.twimg.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dev-proxy\/syndication/, ''),
        configure: (proxy) => {
          proxy.on('error', () => {});
          proxy.on('proxyRes', (proxyRes) => {
            proxyRes.headers['access-control-allow-origin'] = '*';
          });
        },
      },
    },
  },
});