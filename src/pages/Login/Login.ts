import Block from "@/framework/Block";

import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Link } from "@/components/Link";
import { createFormSubmitHandler } from "@/utils/formUtils";

import styles from "@/pages/styles/authForm.module.sass";

interface LoginProps {
  onSubmit?: (formData: Record<string, string>) => void;
  styles?: Record<string, string>;
  events?: Record<string, (e: Event) => void>;
  InputLogin?: Input;
  InputPassword?: Input;
  SubmitButton?: Button;
  RegisterLink?: Link;
}

export class Login extends Block<LoginProps> {
  constructor(props: LoginProps) {
    super("div", {
      styles,
      ...props,
      InputLogin: new Input({
        type: "text",
        name: "login",
        placeholder: "Введите почту",
        label: "Логин",
        required: true,
        className: styles.input,
      }),
      InputPassword: new Input({
        type: "password",
        label: "Пароль",
        name: "password",
        placeholder: "********",
        required: true,
        className: styles.input,
      }),
      SubmitButton: new Button({
        type: "submit",
        label: "Войти",
        className: styles.button,
      }),
      RegisterLink: new Link({
        href: "#/register",
        label: "Нет аккаунта?",
        className: styles.link,
      }),
      events: {},
    });
  }

  protected init(): void {
    const inputs = [this.children.InputLogin, this.children.InputPassword] as Input[]; // Собираем массив
    this.props.events = {
      submit: createFormSubmitHandler(inputs, this.props.onSubmit),
    };
  }

  protected componentDidMount(): void {
    const form = this.element?.querySelector("form");
    if (form) {
      form.addEventListener("submit", (e: Event) => {
        e.preventDefault();
        const formData = new FormData(form as HTMLFormElement);
        const data = Object.fromEntries(formData.entries());
        console.log(data);
      });
    }
  }

  override render() {
    return `
      <div class="{{styles.formPage}}">
        <form class="{{styles.form}}">
          <header class="{{styles.header}}">
            <img
              src="/images/logoURUS.svg"
              alt="Логотип"
              class="{{styles.logo}}"
            />
            <h1 class="{{styles.title}}">Вход</h1>
          </header>
          <ul class="{{styles.fields}}">
            <li>
              {{{ InputLogin }}}
            </li>
            <li>
              {{{ InputPassword }}}
            </li>
          </ul>
          {{{ SubmitButton }}}
          {{{ RegisterLink }}}
        </form>
      </div>
    `;
  }
}
