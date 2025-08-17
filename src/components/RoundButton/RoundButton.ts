import Block from "@/framework/Block";
import type { BaseProps } from "@/types";

import styles from "./RoundButton.module.sass";

export interface RoundButtonProps extends BaseProps {
  icon: string;
  type?: "button" | "submit" | "reset";
  onClick?: (e: Event) => void;
}

export class RoundButton extends Block<RoundButtonProps> {
  constructor(props: RoundButtonProps) {
    super("button", {
      ...props,
      styles,
      events: {
        click: (e: Event) => props.onClick?.(e),
      },
    });
  }

  override render() {
    return `
      <button class="{{styles.button}}" type="{{type}}">
        <img src="/images/{{icon}}.svg" alt="{{icon}}" class="{{styles.icon}}" />
      </button>
    `;
  }
}
