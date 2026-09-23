import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: `http://127.0.0.1:${process.env.API_PORT || 8787}`,
        changeOrigin: false,
      },
      "/uploads": {
        target: `http://127.0.0.1:${process.env.API_PORT || 8787}`,
        changeOrigin: false,
      },
    },
  },
  // Optimize the lazy panorama dependency at startup so the first tour
  // never triggers a development reload that clears session state.
  optimizeDeps: { include: ["pannellum"] },
});
