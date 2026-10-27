import Block from "@/framework/Block";
import { Link } from "@/components/Link";
import { BackButton } from "@/components/BackButton";
import type { BaseProps, User } from "@/types";
import { router } from "@/App";
import { AuthController } from "@/controllers/AuthController";
import { UserController } from "@/controllers/UserController";
import { Toast } from "@/utils/toast";
import { connect } from "@/store/connect";
import type { State } from "@/store/Store";
import { LanguageSwitch } from "@/components/LanguageSwitch/LanguageSwitch";
import { errorText, onLocale, text } from "@/locale";

import styles from "./Profile.module.sass";

export interface ProfileProps extends BaseProps {
  user?: User | null;
  backButton?: BackButton;
  changeDataLink?: Link;
  changePasswordLink?: Link;
  logoutLink?: Link;
  languageSwitch?: LanguageSwitch;
  localeTick?: string;
}

export class Profile extends Block<ProfileProps> {
  constructor(props: ProfileProps = {}) {
    const copy = text();
    super("div", {
      ...props,
      styles,
      languageSwitch: new LanguageSwitch(),
      backButton: new BackButton({
        label: copy.back,
        onClick: () => {
          router.go("/messenger");
        },
      }),
      changeDataLink: new Link({
        href: "/settings",
        label: copy.editData,
        className: styles.link,
      }),
      changePasswordLink: new Link({
        href: "/changePassword",
        label: copy.changePassword,
        className: styles.link,
      }),
      logoutLink: new Link({
        href: "#",
        label: copy.logout,
        className: styles.logout,
        onClick: (e: Event) => {
          e.preventDefault();
          this.handleLogout();
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
    onLocale(() => this.applyLocale());
  }

  private async handleLogout() {
    try {
      await AuthController.logout();
      Toast.success(text().logoutSuccess);
    } catch (error) {
      Toast.error(errorText(error, text().logoutError));
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
      Toast.error(text().avatarType);
      return;
    }

    // Проверяем размер файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Toast.error(text().avatarSize);
      return;
    }

    try {
      await UserController.updateAvatar(file);
    } catch (error) {
      Toast.error(errorText(error, text().avatarError));
    }
  }

  private applyLocale(): void {
    const copy = text();
    (this.children.backButton as BackButton).setProps({ label: copy.back });
    (this.children.changeDataLink as Link).setProps({ label: copy.editData });
    (this.children.changePasswordLink as Link).setProps({ label: copy.changePassword });
    (this.children.logoutLink as Link).setProps({ label: copy.logout });
    this.setProps({ localeTick: copy.language });
  }

  override render() {
    const { user } = this.props || {};
    const copy = text();

    if (!user) {
      return `
        <div class="{{styles.container}}">
          <div class="{{styles.profileWrapper}}">
            <div class="{{styles.profile}}">
              <div class="{{styles.loading}}">${copy.profileLoading}</div>
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
                  ? `<img src="https://ya-praktikum.tech/api/v2/resources${user.avatar}"
                       alt="${copy.avatarAlt}"
                       class="{{styles.avatarImage}}" />`
                  : ""
              }
            </label>
            <div class="{{styles.name}}">${user.display_name || user.first_name}</div>
            <ul class="{{styles.infoList}}">
              <li><span>${copy.email}</span><span>${user.email}</span></li>
              <li><span>${copy.loginLabel}</span><span>${user.login}</span></li>
              <li><span>${copy.firstName}</span><span>${user.first_name}</span></li>
              <li><span>${copy.lastName}</span><span>${user.second_name}</span></li>
              <li>
                <span>${copy.displayName}</span>
                <span>${user.display_name || user.first_name}</span>
              </li>
              <li><span>${copy.phone}</span><span>${user.phone}</span></li>
            </ul>
            {{{languageSwitch}}}
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
const mapStateToProps = (state: State): Partial<ProfileProps> => ({
  user: state.user as User | null,
});

export const ConnectedProfile = connect(mapStateToProps)(Profile);
