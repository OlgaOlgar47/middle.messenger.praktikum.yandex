import Block from "@/framework/Block";
import { Link } from "@/components/Link";
import { BackButton } from "@/components/BackButton";
import type { BaseProps, User } from "@/types";
import { AuthController } from "@/controllers/AuthController";
import { UserController } from "@/controllers/UserController";
import { Toast } from "@/utils/toast";
import { connect } from "@/store/connect";
import { getApiUrl } from "@/config/api";

import styles from "./Profile.module.sass";

export interface ProfileProps extends BaseProps {
  user?: User | null;
  backButton?: BackButton;
  changeDataLink?: Link;
  changePasswordLink?: Link;
  logoutLink?: Link;
}

export class Profile extends Block<ProfileProps> {
  constructor(props: ProfileProps) {
    super("div", {
      ...props,
      styles,
      backButton: new BackButton({
        label: "Назад",
        onClick: () => {
          window.location.href = "/#/chats";
        },
      }),
      changeDataLink: new Link({
        href: "/settings",
        label: "Изменить данные",
        className: styles.link,
      }),
      changePasswordLink: new Link({
        href: "/changePassword",
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
      events: {
        change: (e: Event) => {
          const target = e.target as HTMLInputElement;
          if (target.name === "avatar") {
            this.handleAvatarChange(e);
          }
        },
      },
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

  private async handleAvatarChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) {
      return;
    }

    // Проверяем тип файла
    if (!file.type.startsWith("image/")) {
      Toast.error("Пожалуйста, выберите изображение");
      return;
    }

    // Проверяем размер файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Toast.error("Размер файла не должен превышать 5MB");
      return;
    }

    try {
      await UserController.updateAvatar(file);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ошибка при обновлении аватара";
      Toast.error(errorMessage);
    }
  }

  override render() {
    const { user } = this.props || {};
    console.log("🖼️ Profile render - user:", user);
    if (user?.avatar) {
      const avatarUrl = `https://ya-praktikum.tech/api/v2/resources${user.avatar}`;
      console.log("🖼️ Avatar URL:", avatarUrl);
    }

    if (!user) {
      return `
        <div class="{{styles.container}}">
          <div class="{{styles.profileWrapper}}">
            <div class="{{styles.profile}}">
              <div class="{{styles.loading}}">Загрузка...</div>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="{{styles.container}}">
        <div class="{{styles.profileWrapper}}">
          <div class="{{styles.profile}}">
            <label for="avatar-upload" class="{{styles.avatar}}">
              <input
                type="file"
                name="avatar"
                id="avatar-upload"
                class="{{styles.fileInput}}"
                accept="image/*"
              />
              ${
                user.avatar
                  ? `<img src="https://ya-praktikum.tech/api/v2/resources${user.avatar}" alt="Аватар" class="{{styles.avatarImage}}" />`
                  : ""
              }
            </label>
            <div class="{{styles.name}}">${user.display_name || user.first_name}</div>
            <ul class="{{styles.infoList}}">
              <li><span>Почта</span><span>${user.email}</span></li>
              <li><span>Логин</span><span>${user.login}</span></li>
              <li><span>Имя</span><span>${user.first_name}</span></li>
              <li><span>Фамилия</span><span>${user.second_name}</span></li>
              <li><span>Имя в чате</span><span>${user.display_name || user.first_name}</span></li>
              <li><span>Телефон</span><span>${user.phone}</span></li>
            </ul>
            <div class="{{styles.actions}}">
              {{{changeDataLink}}}
              {{{changePasswordLink}}}
              {{{logoutLink}}}
              {{{backButton}}}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

// HOC для подключения к store
const mapStateToProps = (state: { user: any }) => ({
  user: state.user as User | null,
});

export const ConnectedProfile = connect(mapStateToProps)(Profile);
