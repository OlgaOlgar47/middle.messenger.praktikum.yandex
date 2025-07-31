import Handlebars from "handlebars";
import rawTemplate from "./Login.hbs?raw";
import styles from "./Login.module.sass";

export function renderLoginPage() {
  console.log("styles2: ", styles);
  const template = Handlebars.compile(rawTemplate);
  return template({ styles });
}
