import Handlebars from "handlebars";
import rawTemplate from "./Layout.hbs?raw";
import { renderFooterNav } from "@/components/FooterNav";

import styles from "./Layout.module.sass";

const template = Handlebars.compile(rawTemplate);

export function renderLayout(content: string): string {
  return template({
    styles,
    content,
    footer: renderFooterNav(),
  });
}
