import { authAPI } from "@/api/auth";
import { router } from "@/App";
import { Store } from "@/store";
import type { RegisterData } from "@/types";

export const AuthController = {
  async fetchUser() {
    try {
      const user = await authAPI.me();
      Store.set("user", user);
      return user;
    } catch (error) {
      console.error("❌ Ошибка fetchUser:", error);
      throw error;
    }
  },

  async login(data: { login: string; password: string }) {
    await authAPI.signin(data);
    await this.fetchUser();
    router.go("/messenger");
  },

  async register(data: RegisterData) {
    await authAPI.signup(data);
    router.go("/messenger");
  },

  async logout() {
    await authAPI.logout();
    Store.set("user", null);
    router.go("/");
  },
};
