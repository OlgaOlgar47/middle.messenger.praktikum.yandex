import Block from "@/framework/Block";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Link } from "@/components/Link";
import { LanguageSwitch } from "@/components/LanguageSwitch/LanguageSwitch";
import { createFormSubmitHandler } from "@/utils/formUtils";
import { AuthController } from "@/controllers/AuthController";
import { Toast } from "@/utils/toast";
import { errorText, onLocale, text } from "@/locale";

import styles from "../styles/authForm.module.sass";
import regStyles from "./Register.module.sass";

interface RegisterProps {
  onSubmit?: (formData: Record<string, string>) => void;
  styles?: Record<string, string>;
  regStyles?: Record<string, string>;
  fields?: Input[];
  button?: Button;
  link?: Link;
  languageSwitch?: LanguageSwitch;
  title?: string;
  events?: Record<string, (e: Event) => void>;
}

export class Register extends Block<RegisterProps> {
  constructor(props: RegisterProps = {}) {
    const copy = text();
    super("div", {
      ...props,
      styles,
      regStyles,
      title: copy.registerTitle,
      languageSwitch: new LanguageSwitch(),
      fields: Register.createFields(),
      button: new Button({
        type: "submit",
        label: copy.registerSubmit,
        className: styles.button,
      }),
      link: new Link({
        href: "/",
        label: copy.haveAccount,
        className: styles.link,
      }),
      events: {},
    });
    onLocale(() => this.applyLocale());
  }

  private static createFields(): Input[] {
    const copy = text();
    return [
      new Input({
        type: "text",
        name: "first_name",
        placeholder: copy.firstNamePlaceholder,
        label: copy.firstName,
        required: true,
      }),
      new Input({
        type: "text",
        name: "second_name",
        placeholder: copy.lastNamePlaceholder,
        label: copy.lastName,
        required: true,
      }),
      new Input({
        type: "text",
        name: "login",
        placeholder: copy.loginPlaceholder,
        label: copy.loginLabel,
        required: true,
      }),
      new Input({
        type: "tel",
        name: "phone",
        placeholder: copy.phonePlaceholder,
        label: copy.phone,
        required: true,
      }),
      new Input({
        type: "email",
        name: "email",
        placeholder: copy.emailPlaceholder,
        label: copy.email,
        required: true,
      }),
      new Input({
        type: "password",
        name: "password",
        placeholder: copy.passwordPlaceholder,
        label: copy.passwordLabel,
        required: true,
      }),
      new Input({
        type: "password",
        name: "confirmPassword",
        placeholder: copy.passwordPlaceholder,
        label: copy.repeatPassword,
        required: true,
      }),
    ];
  }

  private applyLocale(): void {
    const copy = text();
    const labels = [
      { label: copy.firstName, placeholder: copy.firstNamePlaceholder },
      { label: copy.lastName, placeholder: copy.lastNamePlaceholder },
      { label: copy.loginLabel, placeholder: copy.loginPlaceholder },
      { label: copy.phone, placeholder: copy.phonePlaceholder },
      { label: copy.email, placeholder: copy.emailPlaceholder },
      { label: copy.passwordLabel, placeholder: copy.passwordPlaceholder },
      { label: copy.repeatPassword, placeholder: copy.passwordPlaceholder },
    ];
    (this.lists.fields as Input[]).forEach((input, index) => {
      const field = input.element?.querySelector("input");
      const value = field instanceof HTMLInputElement ? field.value : "";
      const hadError = input.hasError();
      input.setProps({ ...labels[index], value });
      if (hadError) {
        input.validate();
      }
    });
    (this.children.button as Button).setProps({ label: copy.registerSubmit });
    (this.children.link as Link).setProps({ label: copy.haveAccount });
    this.setProps({ title: copy.registerTitle });
  }

  protected init(): void {
    const inputs = this.lists.fields as Input[];
    this.props.events = {
      submit: createFormSubmitHandler(inputs, this.handleSubmit.bind(this)),
    };
  }

  private async handleSubmit(formData: Record<string, string>) {
    if (formData.password !== formData.confirmPassword) {
      Toast.error(text().passwordMismatch);
      return;
    }

    try {
      await AuthController.register({
        first_name: formData.first_name,
        second_name: formData.second_name,
        login: formData.login,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });
      Toast.success(text().registerSuccess);
    } catch (error) {
      Toast.error(errorText(error, text().registerError));
    }
  }

  override render() {
    return `
      <div class="{{styles.formPage}} {{regStyles.registerForm}}">
        <form novalidate class="{{styles.form}}">
          {{{languageSwitch}}}
          <header class="{{styles.header}}">
            <img src="/images/logoURUS.svg" alt="Логотип" class="{{styles.logo}}" />
            <h1 class="{{styles.title}}">{{title}}</h1>
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
