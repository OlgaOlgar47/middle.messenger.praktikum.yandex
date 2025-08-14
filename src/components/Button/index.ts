import Block from "@/framework/Block";
import styles from "./Button.module.sass";

export class Button extends Block {
  constructor(props: any) {
    super("button", {
      ...props,
      styles,
      events: {
        click: (e: Event) => {
          if (props.onClick) {
            props.onClick(e);
          }
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
