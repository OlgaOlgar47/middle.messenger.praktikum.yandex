import Block from "@/framework/Block";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { BackButton } from "@/components/BackButton";
import { createFormSubmitHandler } from "@/utils/formUtils";
import type { BaseProps, User, UpdateProfileData } from "@/types";
import { UserController } from "@/controllers/UserController";
import { connect } from "@/store/connect";
import type { State } from "@/store/Store";
import { Toast } from "@/utils/toast";

import styles from "../styles/authForm.module.sass";
import settingsStyles from "./Settings.module.sass";

interface SettingsProps extends BaseProps {
  user?: User | null;
  onSubmit?: (formData: Record<string, string>) => void;
  fields?: Input[];
  button?: Button;
  backButton?: BackButton;
  settingsStyles?: unknown;
  originalUser?: User | null;
}

export class Settings extends Block<SettingsProps> {
  constructor(props: SettingsProps = {}) {
    const { user } = props || {};

    super("div", {
      ...props,
      styles,
      settingsStyles,
      originalUser: user ? { ...user } : null,
      fields: [],
      button: new Button({
        type: "submit",
        label: "Сохранить изменения",
        className: styles.button,
        disabled: true,
      }),
      backButton: new BackButton({
        label: "Назад",
        onClick: () => {
          window.location.href = "/profile";
        },
      }),
      events: {},
    });
  }

  protected init(): void {
    const fields = this.createFields(this.props.user);
    this.setProps({ fields });

    this.props.events = {
      submit: createFormSubmitHandler(fields, this.handleSubmit.bind(this)),
    };

    this.addChangeListeners(fields);

    if (this.props.user) {
      this.updateFields(this.props.user);
    }
  }

  private createFields(user?: User | null): Input[] {
    return [
      new Input({
        type: "text",
        name: "first_name",
        label: "Имя",
        placeholder: "Введите имя",
        value: user?.first_name || "",
        required: true,
        className: styles.input,
      }),
      new Input({
        type: "text",
        name: "second_name",
        label: "Фамилия",
        placeholder: "Введите фамилию",
        value: user?.second_name || "",
        required: true,
        className: styles.input,
      }),
      new Input({
        type: "text",
        name: "display_name",
        label: "Имя в чате",
        placeholder: "Введите имя в чате",
        value: user?.display_name || "",
        className: styles.input,
      }),
      new Input({
        type: "text",
        name: "login",
        label: "Логин",
        placeholder: "Введите логин",
        value: user?.login || "",
        required: true,
        className: styles.input,
      }),
      new Input({
        type: "email",
        name: "email",
        label: "Почта",
        placeholder: "Введите почту",
        value: user?.email || "",
        required: true,
        className: styles.input,
      }),
      new Input({
        type: "tel",
        name: "phone",
        label: "Телефон",
        placeholder: "Введите телефон",
        value: user?.phone || "",
        required: true,
        className: styles.input,
      }),
    ];
  }

  public updateFields(user: User) {
    console.log("🔄 Settings updateFields called with user:", user);

    this.setProps({ originalUser: { ...user } });

    const newFields = this.createFields(user);

    this.setProps({ fields: newFields });

    this.props.events = {
      submit: createFormSubmitHandler(newFields, this.handleSubmit.bind(this)),
    };

    this.addChangeListeners(newFields);

    setTimeout(() => this.checkForChanges(), 100);
  }

  private addChangeListeners(inputs: Input[]) {
    inputs.forEach((input) => {
      const inputElement = input.element?.querySelector("input") as HTMLInputElement;
      if (inputElement) {
        inputElement.addEventListener("input", () => {
          console.log("🔄 Input changed:", inputElement.name, inputElement.value);
          this.checkForChanges();
        });
      }
    });
  }

  private checkForChanges() {
    const inputs = this.lists.fields as Input[];
    const { originalUser, button } = this.props;

    if (!originalUser || !inputs) {
      console.log("❌ Missing originalUser or inputs");
      return;
    }

    let hasChanges = false;
    inputs.forEach((input) => {
      const inputElement = input.element?.querySelector("input") as HTMLInputElement;
      if (inputElement) {
        const name = inputElement.name as keyof User;
        const currentValue = inputElement.value;
        const originalValue = String(originalUser[name] || "");

        if (currentValue !== originalValue) {
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

    const { originalUser } = this.props;
    if (!originalUser) {
      Toast.error("Ошибка: данные пользователя не загружены");
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
    }

    try {
      const updateData: UpdateProfileData = {
        first_name: formData.first_name,
        second_name: formData.second_name,
        display_name: formData.display_name,
        login: formData.login,
        email: formData.email,
        phone: formData.phone,
      };

      await UserController.updateProfile(updateData);
      Toast.success("Профиль успешно обновлен");
      setTimeout(() => {
        window.location.href = "/profile";
      }, 1000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ошибка при обновлении профиля";
      Toast.error(errorMessage);

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
            <h1 class="{{styles.title}} {{settingsStyles.headerSeetings}}">Настройки профиля</h1>
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

// HOC для подключения к store
const mapStateToProps = (state: State): Partial<SettingsProps> => ({
  user: state.user as User | null,
});

export const ConnectedSettings = connect(mapStateToProps)(Settings);
