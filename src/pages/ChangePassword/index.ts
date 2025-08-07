import Handlebars from "handlebars";
import rawTemplate from "./ChangePassword.hbs?raw";
import styles from "../styles/authForm.module.sass";

export function renderChangePasswordPage() {
  const template = Handlebars.compile(rawTemplate);
  return template({ styles });
}
