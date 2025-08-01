import Handlebars from "handlebars";
import rawTemplate from "./Login.hbs?raw";
import styles from "./Login.module.sass";

export function renderLoginPage() {
  const template = Handlebars.compile(rawTemplate);
  return template({ styles });
}
