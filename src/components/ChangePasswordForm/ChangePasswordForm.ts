import Block from "@/framework/Block";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { UserController } from "@/controllers/UserController";
import { createFormSubmitHandler } from "@/utils/formUtils";

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
      events: {
        submit: (e: Event) => {
          e.preventDefault();
          this.handleSubmit();
        },
      },
    });
  }

  protected init(): void {
    const inputs = [
      this.children.oldPassword,
      this.children.newPassword,
      this.children.confirmPassword,
    ] as Input[];

    this.props.events = {
      submit: createFormSubmitHandler(inputs, this.handleSubmit.bind(this)),
    };
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
