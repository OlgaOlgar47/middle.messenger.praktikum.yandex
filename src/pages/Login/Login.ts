import Block from "@/framework/Block";

import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Link } from "@/components/Link";
import { createFormSubmitHandler } from "@/utils/formUtils";
import { AuthController } from "@/controllers/AuthController";
import { Toast } from "@/utils/toast";
import { LanguageSwitch } from "@/components/LanguageSwitch/LanguageSwitch";
import { errorText, onLocale, text } from "@/locale";

import styles from "@/pages/styles/authForm.module.sass";

interface LoginProps {
  onSubmit?: (formData: Record<string, string>) => void;
  styles?: Record<string, string>;
  events?: Record<string, (e: Event) => void>;
  InputLogin?: Input;
  InputPassword?: Input;
  SubmitButton?: Button;
  RegisterLink?: Link;
  LanguageSwitch?: LanguageSwitch;
  title?: string;
}

export class Login extends Block<LoginProps> {
  constructor(props: LoginProps = {}) {
    const copy = text();
    super("div", {
      styles,
      ...props,
      title: copy.loginTitle,
      LanguageSwitch: new LanguageSwitch(),
      InputLogin: new Input({
        type: "text",
        name: "login",
        placeholder: copy.loginPlaceholder,
        label: copy.loginLabel,
        required: true,
        className: styles.input,
      }),
      InputPassword: new Input({
        type: "password",
        label: copy.passwordLabel,
        name: "password",
        placeholder: copy.passwordPlaceholder,
        required: true,
        className: styles.input,
      }),
      SubmitButton: new Button({
        type: "submit",
        label: copy.loginSubmit,
        className: styles.button,
      }),
      RegisterLink: new Link({
        href: "/sign-up",
        label: copy.noAccount,
        className: styles.link,
      }),
      events: {},
    });
    onLocale(() => this.applyLocale());
  }

  private applyLocale(): void {
    const copy = text();
    this.applyField(this.children.InputLogin as Input, {
      label: copy.loginLabel,
      placeholder: copy.loginPlaceholder,
    });
    this.applyField(this.children.InputPassword as Input, {
      label: copy.passwordLabel,
      placeholder: copy.passwordPlaceholder,
    });
    (this.children.SubmitButton as Button).setProps({ label: copy.loginSubmit });
    (this.children.RegisterLink as Link).setProps({ label: copy.noAccount });
    this.setProps({ title: copy.loginTitle });
  }

  private applyField(input: Input, props: { label: string; placeholder: string }): void {
    const hadError = input.hasError();
    input.setProps(props);
    if (hadError) {
      input.validate();
    }
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
      Toast.success(text().loginSuccess);
    } catch (error) {
      Toast.error(errorText(error, text().loginError));
    }
  }

  override render() {
    return `
      <div class="{{styles.formPage}}">
        <form novalidate class="{{styles.form}}">
          {{{LanguageSwitch}}}
          <header class="{{styles.header}}">
            <img
              src="/images/logoURUS.svg"
              alt="Логотип"
              class="{{styles.logo}}"
            />
            <h1 class="{{styles.title}}">{{title}}</h1>
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
