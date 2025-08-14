import Block from "@/framework/Block";
import { FooterNav } from "@/components/FooterNav";

import styles from "./Layout.module.sass";

export class Layout extends Block {
  constructor(props: any) {
    super("div", {
      ...props,
      styles,
      FooterNav: new FooterNav({}),
    });
  }

  override render() {
    return `
      <div class="{{styles.page}}">
        <main class="{{styles.content}}">
          {{{content}}}
        </main>
        {{{FooterNav}}}
      </div>
    `;
  }
}
