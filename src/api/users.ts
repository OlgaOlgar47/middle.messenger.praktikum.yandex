import { HTTPTransport } from "@/framework/HTTPTransport";
import type { UpdateProfileData, ChangePasswordData, AvatarResponse, User } from "@/types";

export class UsersAPI {
  private http: HTTPTransport;

  constructor(http?: HTTPTransport) {
    this.http = http || new HTTPTransport();
  }

  getUser(): Promise<User> {
    return this.http.get("/auth/user");
  }

  updateProfile(data: UpdateProfileData): Promise<User> {
    return this.http.put("/user/profile", { data });
  }

  updateAvatar(form: FormData): Promise<AvatarResponse> {
    return this.http.put("/user/profile/avatar", { data: form });
  }

  changePassword(data: ChangePasswordData): Promise<void> {
    return this.http.put("/user/password", { data });
  }

  searchUsers(login: string): Promise<User[]> {
    return this.http.post("/user/search", { data: { login } });
  }
}

export const usersAPI = new UsersAPI();
