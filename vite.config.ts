import { readdirSync } from "node:fs";
import { resolve } from "node:path";

import { defineConfig, loadEnv } from "vite";
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
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      port: 4000,
      strictPort: true, // fails instead of switching to another port
      proxy: {
        "/apix": {
          target: env.VITE_BACKEND_ORIGIN,
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
          chunkFileNames: "[name].js",
          assetFileNames: "assets/[name][extname]",
          // Keep bundles page-local and deterministic for the migration phase.
          manualChunks: undefined,
        },
      },
    },
  };
});
