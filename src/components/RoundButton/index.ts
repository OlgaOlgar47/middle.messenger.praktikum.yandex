import Handlebars from "handlebars";
import rawTemplate from "./RoundButton.hbs?raw";
import styles from "./RoundButton.module.sass";

const template = Handlebars.compile(rawTemplate);

export function renderRoundButton({
  type = "button",
  icon = "arrow-right",
}: {
  type?: string;
  icon?: "arrow-left" | "arrow-right";
}): string {
  return template({
    styles,
    type,
    icon,
  });
}
