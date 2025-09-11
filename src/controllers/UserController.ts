import { usersAPI } from "@/api/users";
import { Store } from "@/store";
import { Toast } from "@/utils/toast";
import type { UpdateProfileData, ChangePasswordData } from "@/types";

export const UserController = {
  async updateProfile(data: UpdateProfileData) {
    try {
      const updatedUser = await usersAPI.updateProfile(data);
      Store.set("user", updatedUser);
      Toast.success("Профиль успешно обновлен");
      return updatedUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ошибка обновления профиля";
      Toast.error(errorMessage);
      throw error;
    }
  },

  async updateAvatar(file: File) {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await usersAPI.updateAvatar(formData);

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

  async changePassword(data: ChangePasswordData) {
    try {
      await usersAPI.changePassword(data);
      Toast.success("Пароль успешно изменен");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ошибка изменения пароля";
      Toast.error(errorMessage);
      throw error;
    }
  },

  getCurrentUser() {
    return Store.getState().user;
  },
};
