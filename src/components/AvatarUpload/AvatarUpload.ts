import Block from "@/framework/Block";
import { UserController } from "@/controllers/UserController";
import type { User } from "@/types";

import styles from "./AvatarUpload.module.sass";

interface AvatarUploadProps {
  user?: User;
  styles?: Record<string, string>;
  events?: Record<string, (e: Event) => void>;
}

export class AvatarUpload extends Block<AvatarUploadProps> {
  constructor(props: AvatarUploadProps) {
    super("div", {
      ...props,
      styles,
      events: {
        change: (e: Event) => {
          this.handleFileChange(e);
        },
      },
    });
  }

  private async handleFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Проверяем тип файла
    if (!file.type.startsWith("image/")) {
      // Toast.error("Выберите изображение");
      return;
    }

    // Проверяем размер файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      // Toast.error("Размер файла не должен превышать 5MB");
      return;
    }

    try {
      await UserController.updateAvatar(file);
    } catch {
      // Ошибка уже обработана в UserController
    }
  }

  override render() {
    const user = this.props.user || UserController.getCurrentUser();
    const avatarUrl = user?.avatar
      ? `https://ya-praktikum.tech/api/v2/resources${user.avatar}`
      : "/images/avatar-placeholder.svg";

    return `
      <div class="{{styles.avatarUpload}}">
        <label for="avatar-input" class="{{styles.label}}">
          <img
            src="${avatarUrl}"
            alt="Аватар"
            class="{{styles.avatar}}"
          />
          <div class="{{styles.overlay}}">
            <span class="{{styles.text}}">Изменить аватар</span>
          </div>
        </label>
        <input
          type="file"
          id="avatar-input"
          accept="image/*"
          class="{{styles.input}}"
        />
      </div>
    `;
  }
}
