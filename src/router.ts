import { renderLoginPage } from "./pages/Login";
import { renderRegisterPage } from "./pages/Register";
import { renderChatsListPage } from "./pages/ChatList";
import { renderProfilePage } from "./pages/Profile";
import { renderSettingsPage } from "./pages/Settings";
import { renderPageNotFound } from "./pages/PageNotFound";
import { renderServerErrorPage } from "./pages/ServerErrorPage";

export function renderRoute(): string {
  const hash = window.location.hash;

  switch (hash) {
    case "#/register":
      return renderRegisterPage();
    case "#/chats":
      return renderChatsListPage();
    case "#/profile":
      return renderProfilePage();
    case "#/settings":
      return renderSettingsPage();
    case "#/404":
      return renderPageNotFound();
    case "#/500":
      return renderServerErrorPage();
    case "#/login":
    default:
      return renderLoginPage();
  }
}
