import Block from "@/framework/Block";
import { FooterNav } from "@/components/FooterNav";
import type { BaseProps } from "@/types";

import styles from "./Layout.module.sass";

export interface LayoutProps extends BaseProps {
  content: Block | string;
  FooterNav?: FooterNav;
}

export class Layout extends Block<LayoutProps> {
  constructor(props: LayoutProps) {
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
      </div>
    `;
  }
}
