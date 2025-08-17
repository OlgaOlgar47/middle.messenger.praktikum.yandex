import Block from "@/framework/Block";
import type { BaseProps } from "@/types";

export interface LinkProps extends BaseProps {
  href: string;
  label: string;
  onClick?: (e: Event) => void;
}

export class Link extends Block<LinkProps> {
  constructor(props: LinkProps) {
    super("a", {
      ...props,
      events: {
        click: (e: Event) => {
          if (typeof props.onClick === "function") {
            props.onClick(e);
          }
        },
      },
    });
  }

  override render() {
    return `<a href="{{href}}" class="{{className}}">{{label}}</a>`;
  }
}
