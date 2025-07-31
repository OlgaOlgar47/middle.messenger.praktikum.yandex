import "./templates/partials";
import { renderRoute } from "./router";
import { renderLayout } from "./components/Layout";

export function App() {
  function updateView() {
    const root = document.querySelector("#app");
    if (!root) return;
    const page = renderRoute();
    root.innerHTML = renderLayout(page);
  }

  document.addEventListener("DOMContentLoaded", () => {
    window.addEventListener("hashchange", updateView);
    updateView();
  });
}
