import Block from "@/framework/Block";
import styles from "./RoundButton.module.sass";

export class RoundButton extends Block {
  constructor(props: any = {}) {
    super("button", {
      ...props,
      styles,
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
