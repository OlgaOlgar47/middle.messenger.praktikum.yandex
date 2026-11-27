import Block from "@/framework/Block";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { BackButton } from "@/components/BackButton";
import { createFormSubmitHandler } from "@/utils/formUtils";
import type { BaseProps } from "@/types";
import { router } from "@/App";
import { UserController } from "@/controllers/UserController";
import { Toast } from "@/utils/toast";
import { onLocale, text } from "@/locale";

import styles from "../styles/authForm.module.sass";
import changePasswordStyles from "./ChangePassword.module.sass";

export interface ChangePasswordProps extends BaseProps {
  fields?: Input[];
  button?: Button;
  backButton?: BackButton;
  changePasswordStyles?: unknown;
  title?: string;
}

export class ChangePassword extends Block<ChangePasswordProps> {
  constructor(props: ChangePasswordProps = {}) {
    const copy = text();
    const button = new Button({
      type: "submit",
      label: copy.save,
      className: styles.button,
      disabled: true,
    });

    const backButton = new BackButton({
      label: copy.back,
      onClick: () => {
        router.go("/profile");
      },
    });

    super("div", {
      ...props,
      styles,
      changePasswordStyles,
      title: copy.changePassword,
      fields: [],
      button,
      backButton,
      events: {},
    });
    onLocale(() => this.applyLocale());
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
    const copy = text();
    return [
      new Input({
        type: "password",
        name: "oldPassword",
        label: copy.oldPassword,
        placeholder: copy.oldPasswordPlaceholder,
        required: true,
        className: styles.input,
      }),
      new Input({
        type: "password",
        name: "newPassword",
        label: copy.newPassword,
        placeholder: copy.newPasswordPlaceholder,
        required: true,
        className: styles.input,
      }),
    ];
  }

  private applyLocale(): void {
    const copy = text();
    const labels = [
      { label: copy.oldPassword, placeholder: copy.oldPasswordPlaceholder },
      { label: copy.newPassword, placeholder: copy.newPasswordPlaceholder },
    ];
    (this.lists.fields as Input[] | undefined)?.forEach((input, index) => {
      const field = input.element?.querySelector("input");
      const value = field instanceof HTMLInputElement ? field.value : "";
      const next = labels[index];
      if (!next) return;
      input.setProps({ ...next, value });
    });
    (this.children.button as Button | undefined)?.setProps({ label: copy.save });
    (this.children.backButton as BackButton | undefined)?.setProps({ label: copy.back });
    this.setProps({ title: copy.changePassword });
    this.addChangeListeners((this.lists.fields as Input[]) || []);
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
      Toast.error(text().fillAll);
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
        router.go("/profile");
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
              {{title}}
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
