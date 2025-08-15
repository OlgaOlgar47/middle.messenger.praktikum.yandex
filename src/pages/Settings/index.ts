import Block from "@/framework/Block";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import styles from "../styles/authForm.module.sass";

export class Settings extends Block {
  constructor(props: any = {}) {
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
    });
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
