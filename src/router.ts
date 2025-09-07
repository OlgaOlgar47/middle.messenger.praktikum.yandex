import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ConnectedChatList } from "./pages/ChatList";
import { ConnectedProfile } from "./pages/Profile";
import { ConnectedSettings } from "./pages/Settings";
import { PageNotFound } from "./pages/PageNotFound";
import { ServerError } from "./pages/ServerError";
import { ChangePassword } from "./pages/ChangePassword";
import type Block from "./framework/Block";

export function renderRoute(): Block | string {
  const { hash } = window.location;

  if (!hash || hash === "#/") {
    window.location.replace("#/login");
    return "";
  }

  switch (hash) {
    case "#/register":
      return new Register({});
    case "#/chats":
      return new (ConnectedChatList as any)({});
    case "#/profile":
      return new (ConnectedProfile as any)({});
    case "#/settings":
      return new (ConnectedSettings as any)({});
    case "#/changePassword":
      return new ChangePassword({});
    case "#/404":
      return new PageNotFound({});
    case "#/500":
      return new ServerError({});
    case "#/login":
    default:
      return new Login({});
  }
}
