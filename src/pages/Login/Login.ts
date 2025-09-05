import Block from "@/framework/Block";

import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Link } from "@/components/Link";
import { createFormSubmitHandler } from "@/utils/formUtils";
import { AuthController } from "@/controllers/AuthController";
import { Toast } from "@/utils/toast";

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
        href: "/sign-up",
        label: "Нет аккаунта?",
        className: styles.link,
      }),
      events: {},
    });
  }

  protected init(): void {
    const inputs = [this.children.InputLogin, this.children.InputPassword] as Input[];
    this.props.events = {
      submit: createFormSubmitHandler(inputs, this.handleSubmit.bind(this)),
    };
  }

  private async handleSubmit(formData: Record<string, string>) {
    try {
      await AuthController.login({
        login: formData.login,
        password: formData.password,
      });
      Toast.success("Успешный вход!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Ошибка входа. Проверьте данные.";
      Toast.error(errorMessage);
    }
  }

  override render() {
    return `
      <div class="{{styles.formPage}}">
        <form novalidate class="{{styles.form}}">
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
