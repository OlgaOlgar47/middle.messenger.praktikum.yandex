import { AuthService } from "@/services/AuthService";
import EventBus from "@/framework/EventBus";
import type { LoginData, RegisterData } from "@/types";

const authService = new AuthService();
export const eventBus = new EventBus();

class AuthController {
  constructor() {
    eventBus.on("auth:login", this.login.bind(this) as (args: unknown) => void);
    eventBus.on("auth:register", this.register.bind(this) as (args: unknown) => void);
    eventBus.on("auth:logout", this.logout.bind(this) as (args: unknown) => void);
  }

  async login(data: LoginData) {
    try {
      const response = await authService.login(data);
      eventBus.emit("auth:success", response);
    } catch (error) {
      eventBus.emit("auth:error", error);
    }
  }

  async register(data: RegisterData) {
    try {
      const response = await authService.register(data);
      eventBus.emit("auth:register:success", response);
    } catch (error) {
      eventBus.emit("auth:register:error", error);
    }
  }

  async logout() {
    try {
      await authService.logout();
      eventBus.emit("auth:logout:success");
    } catch (error) {
      eventBus.emit("auth:logout:error", error);
    }
  }
}

export const authController = new AuthController();
