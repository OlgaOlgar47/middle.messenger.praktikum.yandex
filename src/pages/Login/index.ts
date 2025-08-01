import Handlebars from "handlebars";
import rawTemplate from "./Login.hbs?raw";
import styles from "../styles/authForm.module.sass";

export function renderLoginPage() {
  const template = Handlebars.compile(rawTemplate);
  return template({ styles });
}
