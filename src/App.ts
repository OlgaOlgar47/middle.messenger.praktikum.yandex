import Router from "./framework/Router";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ChatList } from "./pages/ChatList";
import { ConnectedProfile } from "./pages/Profile";
import { ConnectedSettings } from "./pages/Settings";
import { PageNotFound } from "./pages/PageNotFound";
import { ServerError } from "./pages/ServerError";
import { AuthController } from "./controllers/AuthController";
// ✅ экспортируем общий роутер
export const router = new Router("#app"); // или Router.getInstance("#app")

router
  .use("/", Login)
  .use("/sign-up", Register)
  .use("/register", Register)
  .use("/settings", ConnectedSettings)
  .use("/messenger", ChatList)
  .use("/profile", ConnectedProfile)
  .use("/404", PageNotFound)
  .use("/500", ServerError);

export class App {
  constructor() {
    this.init();
  }

  private async init() {
    try {
      await AuthController.fetchUser();
      // Пользователь авторизован - перенаправляем в мессенджер если на главной
      if (["/", "/sign-up", "/register"].includes(window.location.pathname)) {
        router.go("/messenger");
      }
    } catch {
      // Пользователь НЕ авторизован - проверяем доступ к приватным страницам
      if (["/messenger", "/settings", "/profile"].includes(window.location.pathname)) {
        router.go("/");
      }
    }
    router.start();
  }
}
