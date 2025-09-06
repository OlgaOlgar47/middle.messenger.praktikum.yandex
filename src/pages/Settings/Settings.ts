import Block from "@/framework/Block";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { createFormSubmitHandler } from "@/utils/formUtils";
import type { BaseProps, User, UpdateProfileData } from "@/types";
import { UserController } from "@/controllers/UserController";
import { connect } from "@/store/connect";
import { Toast } from "@/utils/toast";

import styles from "../styles/authForm.module.sass";

interface SettingsProps extends BaseProps {
  user?: User | null;
  onSubmit?: (formData: Record<string, string>) => void;
  fields?: Input[];
  button?: Button;
}

export class Settings extends Block<SettingsProps> {
  constructor(props: SettingsProps) {
    const { user } = props || {};

    super("div", {
      ...props,
      styles,
      fields: [
        new Input({
          type: "text",
          name: "first_name",
          label: "Имя",
          placeholder: "Иван",
          value: user?.first_name || "",
          required: true,
          className: styles.input,
        }),
        new Input({
          type: "text",
          name: "second_name",
          label: "Фамилия",
          placeholder: "Иванов",
          value: user?.second_name || "",
          required: true,
          className: styles.input,
        }),
        new Input({
          type: "text",
          name: "display_name",
          label: "Имя в чате",
          placeholder: "Иван",
          value: user?.display_name || "",
          className: styles.input,
        }),
        new Input({
          type: "text",
          name: "login",
          label: "Логин",
          placeholder: "ivanivanov",
          value: user?.login || "",
          required: true,
          className: styles.input,
        }),
        new Input({
          type: "email",
          name: "email",
          label: "Почта",
          placeholder: "pochta@yandex.ru",
          value: user?.email || "",
          required: true,
          className: styles.input,
        }),
        new Input({
          type: "tel",
          name: "phone",
          label: "Телефон",
          placeholder: "+7 (909) 967 30 30",
          value: user?.phone || "",
          required: true,
          className: styles.input,
        }),
      ],
      button: new Button({
        type: "submit",
        label: "Сохранить изменения",
        className: styles.button,
      }),
      events: {},
    });
  }

  protected init(): void {
    const inputs = this.lists.fields as Input[];
    this.props.events = {
      submit: createFormSubmitHandler(inputs, this.handleSubmit.bind(this)),
    };
  }

  // Обновляем поля при изменении user
  public updateFields(user: User) {
    console.log("🔄 Settings updateFields called with user:", user);

    // Пересоздаем поля с новыми данными
    const newFields = [
      new Input({
        type: "text",
        name: "first_name",
        label: "Имя",
        placeholder: "Иван",
        value: user.first_name || "",
        required: true,
        className: styles.input,
      }),
      new Input({
        type: "text",
        name: "second_name",
        label: "Фамилия",
        placeholder: "Иванов",
        value: user.second_name || "",
        required: true,
        className: styles.input,
      }),
      new Input({
        type: "text",
        name: "display_name",
        label: "Имя в чате",
        placeholder: "Иван",
        value: user.display_name || "",
        className: styles.input,
      }),
      new Input({
        type: "text",
        name: "login",
        label: "Логин",
        placeholder: "ivanivanov",
        value: user.login || "",
        required: true,
        className: styles.input,
      }),
      new Input({
        type: "email",
        name: "email",
        label: "Почта",
        placeholder: "pochta@yandex.ru",
        value: user.email || "",
        required: true,
        className: styles.input,
      }),
      new Input({
        type: "tel",
        name: "phone",
        label: "Телефон",
        placeholder: "+7 (909) 967 30 30",
        value: user.phone || "",
        required: true,
        className: styles.input,
      }),
    ];

    // Обновляем поля в компоненте
    this.setProps({ fields: newFields });

    // Пересоздаем обработчики событий
    this.props.events = {
      submit: createFormSubmitHandler(newFields, this.handleSubmit.bind(this)),
    };
  }

  private async handleSubmit(formData: Record<string, string>) {
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

      // Перенаправляем обратно в профиль
      window.location.hash = "#/profile";
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ошибка при обновлении профиля";
      Toast.error(errorMessage);
    }
  }

  override render() {
    return `
      <div class="{{styles.formPage}}">
        <form novalidate class="{{styles.form}}">
          <header class="{{styles.header}}">
            <h1 class="{{styles.title}}">Настройки профиля</h1>
          </header>
          <ul class="{{styles.fields}}">
            {{#each fields}}
              <li>{{{this}}}</li>
            {{/each}}
          </ul>
          {{{button}}}
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
