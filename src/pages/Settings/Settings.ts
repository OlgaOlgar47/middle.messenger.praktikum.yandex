import Block from "@/framework/Block";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { BackButton } from "@/components/BackButton";
import { createFormSubmitHandler } from "@/utils/formUtils";
import type { BaseProps, User, UpdateProfileData } from "@/types";
import { UserController } from "@/controllers/UserController";
import { connect } from "@/store/connect";
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
  constructor(props: SettingsProps) {
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
    // Создаем поля
    const fields = this.createFields(this.props.user);
    this.setProps({ fields });

    // Создаем обработчики событий
    this.props.events = {
      submit: createFormSubmitHandler(fields, this.handleSubmit.bind(this)),
    };

    // Добавляем обработчики для отслеживания изменений
    this.addChangeListeners(fields);

    // Если user уже есть, обновляем поля
    if (this.props.user) {
      this.updateFields(this.props.user);
    }
  }

  // Создаем поля формы (убираем дублирование)
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

  // Обновляем поля при изменении user
  public updateFields(user: User) {
    console.log("🔄 Settings updateFields called with user:", user);

    // Сохраняем оригинальные данные для сравнения
    this.setProps({ originalUser: { ...user } });

    // Пересоздаем поля с новыми данными
    const newFields = this.createFields(user);

    // Обновляем поля в компоненте
    this.setProps({ fields: newFields });

    // Создаем обработчики событий
    this.props.events = {
      submit: createFormSubmitHandler(newFields, this.handleSubmit.bind(this)),
    };

    // Добавляем обработчики для отслеживания изменений
    this.addChangeListeners(newFields);

    // Проверяем изменения после создания полей
    setTimeout(() => this.checkForChanges(), 100);
  }

  // Добавляем обработчики изменений для отслеживания активности кнопки
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

  // Проверяем, есть ли изменения в форме
  private checkForChanges() {
    const inputs = this.lists.fields as Input[];
    const { originalUser, button } = this.props;

    // console.log("🔍 checkForChanges called");

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

    // Обновляем состояние кнопки
    if (button) {
      button.setProps({ disabled: !hasChanges });
    } else {
      // Попробуем найти кнопку через DOM
      const buttonElement = this.element?.querySelector(
        'button[type="submit"]'
      ) as HTMLButtonElement;
      if (buttonElement) {
        buttonElement.disabled = !hasChanges;
      }
    }
  }

  private async handleSubmit(formData: Record<string, string>) {
    // Предотвращаем двойной сабмит
    const submitButton = this.element?.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitButton?.disabled) {
      return;
    }

    // Проверяем, есть ли изменения
    const { originalUser } = this.props;
    if (!originalUser) {
      Toast.error("Ошибка: данные пользователя не загружены");
      return;
    }

    // Блокируем кнопку на время отправки
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

      // Разблокируем кнопку при ошибке
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
const mapStateToProps = (state: { user: any }) => ({
  user: state.user as User | null,
});

export const ConnectedSettings = connect(mapStateToProps)(Settings);
