import Block from "@/framework/Block";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import styles from "../styles/authForm.module.sass";

export class ChangePassword extends Block {
  constructor(props: any = {}) {
    super("div", {
      ...props,
      styles,
      fields: [
        new Input({
          type: "password",
          name: "oldPassword",
          label: "Старый пароль",
          placeholder: "********",
          required: true,
          className: styles.input,
        }),
        new Input({
          type: "password",
          name: "newPassword",
          label: "Новый пароль",
          placeholder: "********",
          required: true,
          className: styles.input,
        }),
      ],
      button: new Button({
        type: "submit",
        label: "Сохранить изменения",
        className: styles.button,
      }),
    });
  }

  override render() {
    return `
      <div class="{{styles.formPage}}">
        <form class="{{styles.form}}">
          <header class="{{styles.header}}">
            <h1 class="{{styles.title}}">Изменить пароль</h1>
          </header>
          <ul class="{{styles.fields}}">
            {{#each fields}}
              <li>{{{this}}}</li>
            {{/each}}
          </ul>
          {{{button}}}
        </form>
      </div>
    `;
  }
}
