import Handlebars from "handlebars";
import rawTemplate from "./Register.hbs?raw";
import styles from "../styles/authForm.module.sass";

export function renderRegisterPage() {
  const template = Handlebars.compile(rawTemplate);
  return template({ styles });
}
