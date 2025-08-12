import Handlebars from "handlebars";
import rawTemplate from "./ServerErrorPage.hbs?raw";
import styles from "./ServerErrorPage.module.sass";

export function renderServerErrorPage() {
  const template = Handlebars.compile(rawTemplate);
  return template({ styles });
}
