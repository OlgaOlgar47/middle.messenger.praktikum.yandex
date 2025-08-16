import Block from "@/framework/Block";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Link } from "@/components/Link";
import styles from "../styles/authForm.module.sass";
import regStyles from "./Register.module.sass";
import { createFormSubmitHandler } from "@/utils/formUtils";

interface RegisterProps {
  onSubmit?: (formData: Record<string, string>) => void;
  styles?: Record<string, string>;
  regStyles?: Record<string, string>;
  fields?: Input[]; // Массив inputs (теперь в lists)
  button?: Button;
  link?: Link;
  events?: Record<string, (e: Event) => void>;
}

export class Register extends Block<RegisterProps> {
  constructor(props: RegisterProps = {}) {
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
      events: {},
    });
  }

  protected init(): void {
    const inputs = this.lists.fields as Input[]; // Доступно после super
    this.props.events = {
      submit: createFormSubmitHandler(inputs, this.props.onSubmit),
    };
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
