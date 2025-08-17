import Block from "@/framework/Block";
import type { BaseProps } from "@/types";

import styles from "./Button.module.sass";

export interface ButtonProps extends BaseProps {
  label: string;
  type?: "button" | "submit" | "reset";
  onClick?: (e: Event) => void;
}

export class Button extends Block<ButtonProps> {
  constructor(props: ButtonProps) {
    super("button", {
      ...props,
      styles,
      events: {
        click: (e: Event) => {
          props.onClick?.(e);
        },
      },
    });
  }

  override render() {
    return `
      <button class="{{styles.button}}" type="{{type}}">
        {{label}}
      </button>
    `;
  }
}
