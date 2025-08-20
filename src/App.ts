import { renderRoute } from "./router";
import { Layout } from "./components/Layout";

export class App {
  private root: HTMLElement | null;

  constructor() {
    this.root = document.querySelector("#app");
    this.init();
  }

  private updateView = (): void => {
    if (!this.root) return;
    const page = renderRoute();
    if (page) {
      const layoutInstance = new Layout({ content: page });
      this.root.innerHTML = "";
      const layoutContent = layoutInstance.getContent();
      if (layoutContent) {
        this.root.appendChild(layoutContent);
      }
    }
  };

  private init(): void {
    window.addEventListener("hashchange", this.updateView);
    this.updateView();
  }
}
