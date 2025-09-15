import Block from "@/framework/Block";
import { Link } from "@/components/Link";
import type { BaseProps } from "@/types";

import styles from "./ServerError.module.sass";

export interface ServerErrorProps extends BaseProps {
  link?: Link;
}

export class ServerError extends Block<ServerErrorProps> {
  constructor(props: ServerErrorProps = {}) {
    super("div", {
      ...props,
      styles,
      link: new Link({
        href: "/",
        label: "Вернуться на главную",
        className: styles.link,
      }),
    });
  }

  override render() {
    return `
      <div class="{{styles.Container}}">
        <h1>5**</h1>
        <p>Произошла ошибка на сервере</p>
        {{{link}}}
      </div>
    `;
  }
}
