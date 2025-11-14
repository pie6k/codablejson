import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "index.ts"),
        superjson: resolve(__dirname, "superjson.ts"),
      },
      formats: ["es", "cjs"],
      fileName: (format, entryName) => `${entryName}.${format === "es" ? "mjs" : "cjs"}`,
    },
    sourcemap: true,
    outDir: "dist",
    minify: false,
    rollupOptions: {
      external: ["superjson"],
      output: {
        manualChunks: undefined,
      },
    },
  },
});
