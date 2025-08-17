import Block from "@/framework/Block";
import styles from "./Button.module.sass";

export type ButtonProps = {
  label: string;
  type?: "button" | "submit" | "reset";
  className?: string;
  onClick?: (e: Event) => void;
  events?: Record<string, (e: Event) => void>;
  styles?: Record<string, string>;
};

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
