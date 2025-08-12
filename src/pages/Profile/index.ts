import Handlebars from "handlebars";
import rawTemplate from "./Profile.hbs?raw";
import { renderRoundButton } from "@/components/RoundButton";

import styles from "./Profile.module.sass";

export function renderProfilePage() {
  const template = Handlebars.compile(rawTemplate);
  return template({
    styles,
    roundButton: renderRoundButton({ icon: "arrow-left" }),
  });
}
