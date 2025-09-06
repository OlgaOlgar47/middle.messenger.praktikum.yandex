import { UsersAPI } from "@/api/users";
import { Store } from "@/store";
import { Toast } from "@/utils/toast";
import type { UpdateProfileData, ChangePasswordData } from "@/types";

export const UserController = {
  // Обновить профиль пользователя
  async updateProfile(data: UpdateProfileData) {
    try {
      const updatedUser = await UsersAPI.updateProfile(data);
      Store.set("user", updatedUser);
      Toast.success("Профиль успешно обновлен");
      return updatedUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ошибка обновления профиля";
      Toast.error(errorMessage);
      throw error;
    }
  },

  // Обновить аватар пользователя
  async updateAvatar(file: File) {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await UsersAPI.updateAvatar(formData);

      // Обновляем данные пользователя в store
      const currentUser = Store.getState().user;
      if (currentUser) {
        Store.set("user", { ...currentUser, avatar: response.avatar });
      }

      Toast.success("Аватар успешно обновлен");
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ошибка обновления аватара";
      Toast.error(errorMessage);
      throw error;
    }
  },

  // Изменить пароль пользователя
  async changePassword(data: ChangePasswordData) {
    try {
      await UsersAPI.changePassword(data);
      Toast.success("Пароль успешно изменен");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ошибка изменения пароля";
      Toast.error(errorMessage);
      throw error;
    }
  },

  // Получить текущего пользователя
  getCurrentUser() {
    return Store.getState().user;
  },
};
