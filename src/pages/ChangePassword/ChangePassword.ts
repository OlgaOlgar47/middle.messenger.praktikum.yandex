import Block from "@/framework/Block";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { BackButton } from "@/components/BackButton";
import { createFormSubmitHandler } from "@/utils/formUtils";
import type { BaseProps } from "@/types";
import { UserController } from "@/controllers/UserController";
import { Toast } from "@/utils/toast";

import styles from "../styles/authForm.module.sass";
import changePasswordStyles from "./ChangePassword.module.sass";

export interface ChangePasswordProps extends BaseProps {
  fields?: Input[];
  button?: Button;
  backButton?: BackButton;
  changePasswordStyles?: unknown;
}

export class ChangePassword extends Block<ChangePasswordProps> {
  constructor(props: ChangePasswordProps) {
    const button = new Button({
      type: "submit",
      label: "Сохранить",
      className: styles.button,
      disabled: true,
    });

    const backButton = new BackButton({
      label: "Назад",
      onClick: () => {
        window.location.href = "/profile";
      },
    });

    super("div", {
      ...props,
      styles,
      changePasswordStyles,
      fields: [],
      button,
      backButton,
      events: {},
    });
  }

  protected init(): void {
    const fields = this.createFields();
    this.setProps({ fields });
    this.props.events = {
      submit: createFormSubmitHandler(fields, this.handleSubmit.bind(this)),
    };
    this.addChangeListeners(fields);
  }

  private createFields(): Input[] {
    console.log("📝 createFields called");
    const fields = [
      new Input({
        type: "password",
        name: "oldPassword",
        label: "Старый пароль",
        placeholder: "Введите старый пароль",
        required: true,
        className: styles.input,
      }),
      new Input({
        type: "password",
        name: "newPassword",
        label: "Новый пароль",
        placeholder: "Введите новый пароль",
        required: true,
        className: styles.input,
      }),
    ];
    return fields;
  }

  private addChangeListeners(inputs: Input[]) {
    inputs.forEach((input) => {
      const inputElement = input.element?.querySelector("input") as HTMLInputElement;
      if (inputElement) {
        inputElement.addEventListener("input", () => {
          this.checkForChanges();
        });
      }
    });
  }

  private checkForChanges() {
    const inputs = this.lists.fields as Input[];
    const { button } = this.props;

    if (!inputs) {
      return;
    }

    let hasChanges = false;
    inputs.forEach((input) => {
      const inputElement = input.element?.querySelector("input") as HTMLInputElement;
      if (inputElement) {
        const currentValue = inputElement.value;
        if (currentValue.trim() !== "") {
          hasChanges = true;
        }
      }
    });

    if (button) {
      button.setProps({ disabled: !hasChanges });
    } else {
      const buttonElement = this.element?.querySelector(
        'button[type="submit"]'
      ) as HTMLButtonElement;
      if (buttonElement) {
        buttonElement.disabled = !hasChanges;
      }
    }
  }

  private async handleSubmit(formData: Record<string, string>) {
    const submitButton = this.element?.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitButton?.disabled) {
      return;
    }

    if (!formData.oldPassword || !formData.newPassword) {
      Toast.error("Заполните все поля");
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
    }

    try {
      await UserController.changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });

      setTimeout(() => {
        window.location.href = "/profile";
      }, 1000);
    } catch {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  }

  override render() {
    return `
      <div class="{{styles.formPage}}">
        <form novalidate class="{{styles.form}}">
          <header class="{{styles.header}}">
            <h1 class="{{styles.title}} {{changePasswordStyles.headerChangePassword}}">
              Изменить пароль
            </h1>
          </header>
          <ul class="{{styles.fields}}">
            {{#each fields}}
              <li>{{{this}}}</li>
            {{/each}}
          </ul>
          {{{button}}}
          {{{backButton}}}
        </form>
      </div>
    `;
  }
}
