import Router from "./framework/Router";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ConnectedChatList } from "./pages/ChatList";
import { ConnectedProfile } from "./pages/Profile";
import { ConnectedSettings } from "./pages/Settings";
import { ChangePassword } from "./pages/ChangePassword";
import { PageNotFound } from "./pages/PageNotFound";
import { ServerError } from "./pages/ServerError";
import { AuthController } from "./controllers/AuthController";
// ✅ экспортируем общий роутер
export const router = new Router("#app"); // или Router.getInstance("#app")

router
  .use("/", Login)
  .use("/sign-up", Register)
  .use("/settings", ConnectedSettings)
  .use("/changePassword", ChangePassword)
  .use("/messenger", ConnectedChatList)
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
      if (
        ["/messenger", "/settings", "/profile", "/changePassword"].includes(
          window.location.pathname
        )
      ) {
        router.go("/");
      }
    }
    router.start();
  }
}
