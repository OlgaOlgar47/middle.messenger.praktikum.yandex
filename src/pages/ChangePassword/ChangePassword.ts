import Block from "@/framework/Block";

import { createFormSubmitHandler } from "@/utils/formUtils";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import type { BaseProps } from "@/types";

import styles from "../styles/authForm.module.sass";

export interface ChangePasswordProps extends BaseProps {
  onSubmit?: (formData: Record<string, string>) => void;
  fields?: Input[];
  button?: Button;
  onClick?: (e: Event) => void;
}

export class ChangePassword extends Block<ChangePasswordProps> {
  constructor(props: ChangePasswordProps) {
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
      events: {},
    });
  }

  protected init(): void {
    const inputs = this.lists.fields as Input[];
    this.props.events = {
      submit: createFormSubmitHandler(inputs, this.props.onSubmit),
    };
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
