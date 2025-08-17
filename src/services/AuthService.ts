import { HTTPTransport } from "@/framework/HTTPTransport";
import type { RegisterData, LoginData, User, UpdateProfileData } from "@/types";

const http = new HTTPTransport("/api");

export class AuthService {
  async login(data: LoginData): Promise<User> {
    return http.post("/auth/signin", { data });
  }

  async logout(): Promise<void> {
    return http.post("/auth/logout");
  }

  async register(data: RegisterData): Promise<User> {
    return http.post("/auth/signup", { data });
  }

  async getUser(): Promise<User> {
    return http.get("/auth/user");
  }

  async updateProfile(data: UpdateProfileData): Promise<User> {
    return http.put("/user/profile", { data });
  }
}
