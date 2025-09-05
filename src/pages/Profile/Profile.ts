import Block from "@/framework/Block";
import { Link } from "@/components/Link";
import { RoundButton } from "@/components/RoundButton";
import type { BaseProps } from "@/types";
import { AuthController } from "@/controllers/AuthController";
import { Toast } from "@/utils/toast";

import styles from "./Profile.module.sass";

export interface ProfileProps extends BaseProps {
  roundButton?: RoundButton;
  changeDataLink?: Link;
  changePasswordLink?: Link;
  logoutLink?: Link;
}

export class Profile extends Block<ProfileProps> {
  constructor(props: ProfileProps) {
    super("div", {
      ...props,
      styles,
      roundButton: new RoundButton({ icon: "arrow-left" }),
      changeDataLink: new Link({
        href: "#/settings",
        label: "Изменить данные",
        className: styles.link,
      }),
      changePasswordLink: new Link({
        href: "#/changePassword",
        label: "Изменить пароль",
        className: styles.link,
      }),
      logoutLink: new Link({
        href: "#",
        label: "Выйти",
        className: styles.logout,
        events: {
          click: (e: Event) => {
            e.preventDefault();
            this.handleLogout();
          },
        },
      }),
    });
  }

  private async handleLogout() {
    try {
      await AuthController.logout();
      Toast.success("Вы успешно вышли из системы");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ошибка при выходе";
      Toast.error(errorMessage);
    }
  }

  override render() {
    return `
      <div class="{{styles.container}}">
        <div class="{{styles.sidebar}}">
          {{{roundButton}}}
        </div>
        <div class="{{styles.profileWrapper}}">
          <div class="{{styles.profile}}">
            <label for="avatar-upload" class="{{styles.avatar}}">
              <input type="file" name="avatar" id="avatar-upload" class="{{styles.fileInput}}" />
            </label>
            <div class="{{styles.name}}">Иван</div>
            <ul class="{{styles.infoList}}">
              <li><span>Почта</span><span>pochta@yandex.ru</span></li>
              <li><span>Логин</span><span>ivanivanov</span></li>
              <li><span>Имя</span><span>Иван</span></li>
              <li><span>Фамилия</span><span>Иванов</span></li>
              <li><span>Имя в чате</span><span>Иван</span></li>
              <li><span>Телефон</span><span>+7 (909) 967 30 30</span></li>
            </ul>
            <div class="{{styles.actions}}">
              {{{changeDataLink}}}
              {{{changePasswordLink}}}
              {{{logoutLink}}}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
