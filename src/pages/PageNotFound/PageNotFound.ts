import Block from "@/framework/Block";
import { Link } from "@/components/Link";
import styles from "./PageNotFound.module.sass";

export class PageNotFound extends Block {
  constructor(props: any = {}) {
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
        <h1>404</h1>
        <p>Страница не найдена</p>
        {{{link}}}
      </div>
    `;
  }
}
