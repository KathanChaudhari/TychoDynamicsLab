import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import {
  visualizer,
} from "rollup-plugin-visualizer";
import {
  defineConfig,
} from "vite";

export default defineConfig(
  ({ mode }) => ({
    plugins: [
      react(),
      tailwindcss(),

      mode === "analyze" &&
        visualizer({
          filename:
            "dist/bundle-report.html",
          template: "treemap",
          open: true,
          gzipSize: true,
          brotliSize: true,
        }),
    ].filter(Boolean),

    build: {
      sourcemap:
        mode === "analyze",
    },
  })
);