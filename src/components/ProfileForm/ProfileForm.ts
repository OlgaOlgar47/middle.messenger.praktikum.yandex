import Block from "@/framework/Block";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { UserController } from "@/controllers/UserController";
import { createFormSubmitHandler } from "@/utils/formUtils";
import type { User } from "@/types";

import styles from "./ProfileForm.module.sass";

interface ProfileFormProps {
  user?: User;
  onSubmit?: (data: any) => void;
  styles?: Record<string, string>;
  events?: Record<string, (e: Event) => void>;
}

export class ProfileForm extends Block<ProfileFormProps> {
  constructor(props: ProfileFormProps) {
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
      this.children.firstName,
      this.children.secondName,
      this.children.displayName,
      this.children.login,
      this.children.email,
      this.children.phone,
    ] as Input[];

    this.props.events = {
      submit: createFormSubmitHandler(inputs, this.handleSubmit.bind(this)),
    };
  }

  private async handleSubmit(formData: Record<string, string>) {
    try {
      await UserController.updateProfile({
        first_name: formData.first_name,
        second_name: formData.second_name,
        display_name: formData.display_name,
        login: formData.login,
        email: formData.email,
        phone: formData.phone,
      });
    } catch {
      // Ошибка уже обработана в UserController
    }
  }

  override render() {
    const user = this.props.user || UserController.getCurrentUser();

    return `
      <form class="{{styles.form}}" novalidate>
        <div class="{{styles.fields}}">
          <div class="{{styles.field}}">
            <label class="{{styles.label}}">Имя</label>
            <input
              type="text"
              name="first_name"
              value="${user?.first_name || ""}"
              class="{{styles.input}}"
              required
            />
          </div>

          <div class="{{styles.field}}">
            <label class="{{styles.label}}">Фамилия</label>
            <input
              type="text"
              name="second_name"
              value="${user?.second_name || ""}"
              class="{{styles.input}}"
              required
            />
          </div>

          <div class="{{styles.field}}">
            <label class="{{styles.label}}">Имя в чате</label>
            <input
              type="text"
              name="display_name"
              value="${user?.display_name || ""}"
              class="{{styles.input}}"
              required
            />
          </div>

          <div class="{{styles.field}}">
            <label class="{{styles.label}}">Логин</label>
            <input
              type="text"
              name="login"
              value="${user?.login || ""}"
              class="{{styles.input}}"
              required
            />
          </div>

          <div class="{{styles.field}}">
            <label class="{{styles.label}}">Email</label>
            <input
              type="email"
              name="email"
              value="${user?.email || ""}"
              class="{{styles.input}}"
              required
            />
          </div>

          <div class="{{styles.field}}">
            <label class="{{styles.label}}">Телефон</label>
            <input
              type="tel"
              name="phone"
              value="${user?.phone || ""}"
              class="{{styles.input}}"
              required
            />
          </div>
        </div>

        <button type="submit" class="{{styles.submitButton}}">
          Сохранить изменения
        </button>
      </form>
    `;
  }
}
