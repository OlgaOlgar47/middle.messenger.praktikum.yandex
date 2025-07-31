import { renderLoginPage } from "./pages/Login";
import { renderRegisterPage } from "./pages/Register";
import { renderChatsListPage } from "./pages/ChatList";

export function renderRoute(): string {
  const hash = window.location.hash;

  switch (hash) {
    case "#/register":
      return renderRegisterPage();
    case "#/chats":
      return renderChatsListPage();
    case "#/login":
    default:
      return renderLoginPage();
  }
}

// import { renderLoginPage } from "@/pages/Login";
// import { renderRegisterPage } from "@/pages/Register";
// import { renderChatsListPage } from "@/pages/ChatsList";
// import { renderChatFeedPage } from "@/pages/ChatFeed";
// import { renderSettingsPage } from "@/pages/Settings";
// import { renderNotFoundPage } from "@/pages/NotFound";
// import { renderError500Page } from "@/pages/Error500";

// export function renderRoute(): string {
//   const hash = window.location.hash;

//   switch (hash) {
//     case "#/register":
//       return renderRegisterPage();
//     case "#/chats":
//       return renderChatsListPage();
//     case "#/feed":
//       return renderChatFeedPage();
//     case "#/settings":
//       return renderSettingsPage();
//     case "#/404":
//       return renderNotFoundPage();
//     case "#/500":
//       return renderError500Page();
//     case "#/login":
//     case "":
//     default:
//       return renderLoginPage();
//   }
// }
