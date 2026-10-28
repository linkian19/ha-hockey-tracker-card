import { defineConfig } from "vite";
import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));

export default defineConfig({
  define: {
    __VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    lib: {
      entry: "src/hockey-tracker-card.js",
      formats: ["es"],
      fileName: () => "hockey-tracker-card.js",
    },
    target: "es2020",
    outDir: "dist",
    emptyOutDir: true,
  },
});
