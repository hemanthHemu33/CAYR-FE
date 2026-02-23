import { readdirSync } from "node:fs";
import { resolve } from "node:path";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const collectHtmlInputs = (dir: string) =>
  readdirSync(resolve(__dirname, dir))
    .filter((file) => file.endsWith(".html"))
    .reduce<Record<string, string>>((inputs, file) => {
      const name = `${dir}/${file}`;
      inputs[name] = resolve(__dirname, dir, file);
      return inputs;
    }, {});

const collectJsInputs = (dir: string) =>
  readdirSync(resolve(__dirname, dir))
    .filter((file) => file.endsWith(".js"))
    .reduce<Record<string, string>>((inputs, file) => {
      const name = `${dir}/${file.replace(/\.js$/, "")}`;
      inputs[name] = resolve(__dirname, dir, file);
      return inputs;
    }, {});

const buildInputs = {
  ...collectHtmlInputs("web/app"),
  ...collectHtmlInputs("web/admin"),
  ...collectJsInputs("web/app/js"),
  ...collectJsInputs("web/admin/js"),
};

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
  build: {
    cssCodeSplit: false,
    rollupOptions: {
      input: buildInputs,
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name][extname]",
        manualChunks: () => undefined,
      },
    },
  },
});
