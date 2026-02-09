import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react({
      babel: {
        compact: true,
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

        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "x";
          }
        },
      },
    },
  },
});