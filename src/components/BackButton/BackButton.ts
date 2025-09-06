import Block from "@/framework/Block";
import type { BaseProps } from "@/types";

import styles from "./BackButton.module.sass";

export interface BackButtonProps extends BaseProps {
  label?: string;
  onClick?: () => void;
}

export class BackButton extends Block<BackButtonProps> {
  constructor(props: BackButtonProps) {
    super("button", {
      ...props,
      styles,
      events: {
        click: () => {
          if (props.onClick) {
            props.onClick();
          } else {
            // По умолчанию возвращаемся на предыдущую страницу
            window.history.back();
          }
        },
      },
    });
  }

  override render() {
    return `
      <button class="{{styles.backButton}}" type="button">
        {{label}}
      </button>
    `;
  }
}
