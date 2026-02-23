import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4000,
    strictPort: true, // fails instead of switching to another port
    proxy: {
      "/apix": {
        target: process.env.VITE_BACKEND_ORIGIN,
        changeOrigin: true,
      },
    },
  },
});
