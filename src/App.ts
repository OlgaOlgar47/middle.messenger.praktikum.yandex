// import { renderRoute } from "./router";
// import { Layout } from "./components/Layout";

// export class App {
//   private root: HTMLElement | null;

//   constructor() {
//     this.root = document.querySelector("#app");
//     this.init();
//   }

//   private updateView = (): void => {
//     if (!this.root) return;
//     const page = renderRoute();
//     if (page) {
//       const layoutInstance = new Layout({ content: page });
//       this.root.innerHTML = "";
//       const layoutContent = layoutInstance.getContent();
//       if (layoutContent) {
//         this.root.appendChild(layoutContent);
//       }
//     }
//   };

//   private init(): void {
//     window.addEventListener("hashchange", this.updateView);
//     this.updateView();
//   }
// }

import Router from "./framework/Router";

import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ChatList } from "./pages/ChatList";
import { Profile } from "./pages/Profile";
import { Settings } from "./pages/Settings";
import { PageNotFound } from "./pages/PageNotFound";

export class App {
  constructor() {
    this.init();
  }

  private init(): void {
    const router = new Router("#app");

    router
      .use("/", Login)
      .use("/register", Register)
      .use("/settings", Settings)
      .use("/chats", ChatList)
      .use("/profile", Profile)
      .use("/404", PageNotFound);

    router.start();
  }
}
