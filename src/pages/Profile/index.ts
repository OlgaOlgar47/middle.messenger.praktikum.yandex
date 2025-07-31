import Handlebars from "handlebars";
import rawTemplate from "./Profile.hbs?raw";
import styles from "./Profile.module.sass";

export function renderProfilePage() {
  const template = Handlebars.compile(rawTemplate);
  return template({ styles });
}

