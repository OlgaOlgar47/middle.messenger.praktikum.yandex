import Block from "@/framework/Block";
import { Link } from "../Link";

import styles from "./FooterNav.module.sass";

export class FooterNav extends Block {
  constructor(props: any) {
    super("nav", {
      styles,
      ...props,
      links: [
        new Link({ href: "#/login", label: "Вход" }),
        new Link({ href: "#/register", label: "Регистрация" }),
        new Link({ href: "#/chats", label: "Список чатов" }),
        new Link({ href: "#/profile", label: "Профиль" }),
        new Link({ href: "#/404", label: "404" }),
        new Link({ href: "#/500", label: "Ошибка 5**" }),
      ],
    });
  }
  override render() {
    return `
      <nav class="{{styles.footer}}">
        <ul class="{{styles.navList}}">
          {{#each links}}
            {{{ this }}}
          {{/each}}
        </ul>
      </nav>
    `;
  }
}
