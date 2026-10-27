import { usersAPI } from "@/api/users";
import { Store } from "@/store";
import { Toast } from "@/utils/toast";
import { errorText, text } from "@/locale";
import type { UpdateProfileData, ChangePasswordData } from "@/types";

export const UserController = {
  async updateProfile(data: UpdateProfileData) {
    try {
      const updatedUser = await usersAPI.updateProfile(data);
      Store.set("user", updatedUser);
      Toast.success("Профиль успешно обновлен");
      return updatedUser;
    } catch (error) {
      Toast.error(errorText(error, text().profileUpdateError));
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
      Toast.error(errorText(error, text().avatarError));
      throw error;
    }
  },

  async changePassword(data: ChangePasswordData) {
    try {
      await usersAPI.changePassword(data);
      Toast.success("Пароль успешно изменен");
    } catch (error) {
      Toast.error(errorText(error, text().passwordChangeError));
      throw error;
    }
  },

  getCurrentUser() {
    return Store.getState().user;
  },
};
