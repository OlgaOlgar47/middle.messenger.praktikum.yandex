import { AuthAPI } from "@/api/auth";
import { router } from "@/App";
import { Store } from "@/store";

export const AuthController = {
  async fetchUser() {
    try {
      const user = await AuthAPI.me();
      Store.set("user", user);
      return user;
    } catch (error) {
      // Логируем ошибку для отладки
      console.error("❌ Ошибка fetchUser:", error);
      throw error;
    }
  },

  async login(data: { login: string; password: string }) {
    await AuthAPI.signin(data);
    // После успешного входа получаем данные пользователя
    await this.fetchUser();
    router.go("/messenger");
  },

  async register(data: any) {
    await AuthAPI.signup(data);
    // После регистрации пользователь автоматически авторизован
    // Не нужно вызывать fetchUser() - это вызовет ошибку "User already in system"
    router.go("/messenger");
  },

  async logout() {
    await AuthAPI.logout();
    Store.set("user", null);
    router.go("/");
  },
};
