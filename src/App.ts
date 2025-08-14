import "./templates/partials";
import { renderRoute } from "./router";
import { Layout } from "./components/Layout";

export class App {
  private root: HTMLElement | null;

  constructor() {
    this.root = document.querySelector("#app");
    this.init();
  }

  // private updateView = (): void => {
  //   if (!this.root) return;
  //   const page = renderRoute();
  //   const layout = new Layout({ content: page });
  //   const layoutContent = layout.getContent();
  //   if (layoutContent) {
  //     this.root.appendChild(layoutContent);
  //   }
  // };

  private updateView = (): void => {
    if (!this.root) return;
    const page = renderRoute(); // Получаем экземпляр Block
    if (page) {
      const layoutInstance = new Layout({ content: page }); // Передаём page как content
      this.root.innerHTML = "";
      const layoutContent = layoutInstance.getContent(); // Предполагаю, getContent возвращает DOM
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
