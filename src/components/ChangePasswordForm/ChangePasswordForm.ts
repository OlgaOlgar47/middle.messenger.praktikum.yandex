import Block from "@/framework/Block";
import { UserController } from "@/controllers/UserController";

import styles from "./ChangePasswordForm.module.sass";

interface ChangePasswordFormProps {
  onSubmit?: (data: any) => void;
  styles?: Record<string, string>;
  events?: Record<string, (e: Event) => void>;
}

export class ChangePasswordForm extends Block<ChangePasswordFormProps> {
  constructor(props: ChangePasswordFormProps) {
    super("form", {
      ...props,
      styles,
    });
  }

  protected init(): void {
    // Обработчик submit настраивается через createFormSubmitHandler
    const form = this.element as HTMLFormElement;
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleFormSubmit();
      });
    }
  }

  private async handleFormSubmit() {
    const form = this.element as HTMLFormElement;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;

    await this.handleSubmit(data);
  }

  private async handleSubmit(formData: Record<string, string>) {
    // Проверяем совпадение паролей
    if (formData.newPassword !== formData.confirmPassword) {
      // Toast.error("Пароли не совпадают");
      return;
    }

    try {
      await UserController.changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });
    } catch {
      // Ошибка уже обработана в UserController
    }
  }

  override render() {
    return `
      <form class="{{styles.form}}" novalidate>
        <div class="{{styles.fields}}">
          <div class="{{styles.field}}">
            <label class="{{styles.label}}">Текущий пароль</label>
            <input
              type="password"
              name="oldPassword"
              class="{{styles.input}}"
              required
            />
          </div>

          <div class="{{styles.field}}">
            <label class="{{styles.label}}">Новый пароль</label>
            <input
              type="password"
              name="newPassword"
              class="{{styles.input}}"
              required
            />
          </div>

          <div class="{{styles.field}}">
            <label class="{{styles.label}}">Повторите новый пароль</label>
            <input
              type="password"
              name="confirmPassword"
              class="{{styles.input}}"
              required
            />
          </div>
        </div>

        <button type="submit" class="{{styles.submitButton}}">
          Изменить пароль
        </button>
      </form>
    `;
  }
}
