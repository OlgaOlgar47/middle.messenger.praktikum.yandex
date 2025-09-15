import Block from "@/framework/Block";
import type { BaseProps } from "@/types";
import { Link } from "../Link";

import styles from "./FooterNav.module.sass";

export interface FooterNavProps extends BaseProps {
  links?: Link[];
}

export class FooterNav extends Block<FooterNavProps> {
  constructor(props: FooterNavProps) {
    super("nav", {
      styles,
      ...props,
      links: [
        new Link({ href: "/", label: "Вход" }),
        new Link({ href: "/sign-up", label: "Регистрация" }),
        new Link({ href: "/messenger", label: "Список чатов" }),
        new Link({ href: "/profile", label: "Профиль" }),
        new Link({ href: "/404", label: "404" }),
        new Link({ href: "/500", label: "Ошибка 5**" }),
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
