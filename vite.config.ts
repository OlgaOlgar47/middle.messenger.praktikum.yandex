import { defineConfig } from "vite";
import * as path from "path";
import handlebars from "vite-plugin-handlebars";

export default defineConfig({
  base: "./",
  plugins: [
    handlebars({
      partialDirectory: "./src/templates",
    }),
  ],
  server: {
    port: 3000,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
