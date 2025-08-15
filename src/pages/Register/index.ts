import Block from "@/framework/Block";

import styles from "../styles/authForm.module.sass";
import regStyles from "./Register.module.sass";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Link } from "@/components/Link";

export class Register extends Block {
  constructor(props: any = {}) {
    super("div", {
      ...props,
      styles,
      regStyles,
      fields: [
        new Input({
          type: "text",
          name: "first_name",
          placeholder: "Иван",
          label: "Имя",
          required: true,
        }),
        new Input({
          type: "text",
          name: "second_name",
          placeholder: "Иванов",
          label: "Фамилия",
          required: true,
        }),
        new Input({
          type: "text",
          name: "login",
          placeholder: "ivanivanov",
          label: "Логин",
          required: true,
        }),
        new Input({
          type: "tel",
          name: "phone",
          placeholder: "+7 (999) 999-99-99",
          label: "Телефон",
          required: true,
        }),
        new Input({
          type: "email",
          name: "email",
          placeholder: "example@mail.com",
          label: "Почта",
          required: true,
        }),
        new Input({
          type: "password",
          name: "password",
          placeholder: "********",
          label: "Пароль",
          required: true,
        }),
        new Input({
          type: "password",
          name: "confirmPassword",
          placeholder: "********",
          label: "Повторите пароль",
          required: true,
        }),
      ],
      button: new Button({
        type: "submit",
        label: "Зарегистрироваться",
        className: styles.button,
      }),
      link: new Link({
        href: "#/login",
        label: "Войдите",
        className: styles.link,
      }),
    });
  }

  override render() {
    return `
      <div class="{{styles.formPage}} {{regStyles.registerForm}}">
        <form>
          <header>
            <img src="/images/logoURUS.svg" alt="Логотип" class="{{styles.logo}}" />
            <h1 class="{{styles.title}}">Регистрация</h1>
          </header>
          <ul class="{{styles.fields}}">
            {{#each fields}}
              <li>{{{this}}}</li>
            {{/each}}
          </ul>
          {{{button}}}
          {{{link}}}
        </form>
      </div>
    `;
  }
}
