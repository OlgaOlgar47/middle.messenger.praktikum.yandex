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
    strictPort: true,
    fs: {
      strict: false,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
