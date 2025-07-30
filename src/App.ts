import "./templates/partials";
import { renderRoute } from "./router";

export function App() {
  function updateView() {
    const root = document.querySelector("#app");
    console.log("roo000000000000000000000000000000t: ", root);
    if (!root) return;
    root.innerHTML = renderRoute();
  }
  console.log("Render route result:", renderRoute());

  document.addEventListener("DOMContentLoaded", () => {
    window.addEventListener("hashchange", updateView);
    updateView();
  });
}

// export function App() {
//   function updateView() {
//     const root = document.querySelector("#app");
//     if (!root) {
//       console.error("root #app not found");
//       return;
//     }

//     const html = renderRoute();
//     console.log("HTML:", html);
//     root.innerHTML = html;
//   }

//   document.addEventListener("DOMContentLoaded", () => {
//     window.addEventListener("hashchange", updateView);
//     updateView();
//   });
// }
