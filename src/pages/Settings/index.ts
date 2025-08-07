import Handlebars from "handlebars";
import rawTemplate from "./Settings.hbs?raw";
import styles from "../styles/authForm.module.sass";

export function renderSettingsPage() {
  const template = Handlebars.compile(rawTemplate);
  return template({ styles });
}
