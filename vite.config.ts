import { defineConfig } from "vite";
import handlebars from "vite-plugin-handlebars";
import * as path from "path";

export default defineConfig({
  plugins: [
    handlebars({
      partialDirectory: path.resolve(__dirname, "src/templates"),
    }),
  ],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
