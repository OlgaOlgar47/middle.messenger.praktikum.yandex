import { defineConfig } from "vite";
import * as path from "path";
import handlebars from "vite-plugin-handlebars";

export default defineConfig({
  base: "./",
  plugins: [
    handlebars({
      partialDirectory: "./src/templates",
      defaultLayout: false,
      context: page => {
        switch (page) {
          case "login":
            return { title: "Авторизация" };
          case "register":
            return { title: "Регистрация" };
          case "chats":
            return { title: "Чаты" };
          case "profile":
            return { title: "Профиль" };
          case "404":
            return { title: "404 - Не найдено" };
          case "500":
            return { title: "5** - Ошибка сервера" };
          default:
            return { title: "Мессенджер" };
        }
      },
    }),
  ],
  server: {
    port: 3000,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    },
  },
  appType: "spa",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
