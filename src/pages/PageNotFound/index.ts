import Handlebars from "handlebars";
import rawTemplate from "./PageNotFound.hbs?raw";
import styles from "./PageNotFound.module.sass";

export function renderPageNotFound() {
  const template = Handlebars.compile(rawTemplate);
  return template({ styles });
}
