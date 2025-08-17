import Block from "@/framework/Block";

import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { createFormSubmitHandler } from "@/utils/formUtils";
import type { BaseProps } from "@/types";

import styles from "../styles/authForm.module.sass";

interface SettingsProps extends BaseProps {
  onSubmit?: (formData: Record<string, string>) => void;
  fields?: Input[];
  button?: Button;
}

export class Settings extends Block<SettingsProps> {
  constructor(props: SettingsProps) {
    super("div", {
      ...props,
      styles,
      fields: [
        new Input({
          type: "text",
          name: "first_name",
          label: "Имя",
          placeholder: "Иван",
          required: true,
          className: styles.input,
        }),
        new Input({
          type: "text",
          name: "second_name",
          label: "Фамилия",
          placeholder: "Иванов",
          required: true,
          className: styles.input,
        }),
        new Input({
          type: "text",
          name: "display_name",
          label: "Имя в чате",
          placeholder: "Иван",
          className: styles.input,
        }),
        new Input({
          type: "text",
          name: "login",
          label: "Логин",
          placeholder: "ivanivanov",
          required: true,
          className: styles.input,
        }),
        new Input({
          type: "email",
          name: "email",
          label: "Почта",
          placeholder: "pochta@yandex.ru",
          required: true,
          className: styles.input,
        }),
        new Input({
          type: "tel",
          name: "phone",
          label: "Телефон",
          placeholder: "+7 (909) 967 30 30",
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
            <h1 class="{{styles.title}}">Настройки профиля</h1>
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
