import { HTTPTransport } from "@/framework/HTTPTransport";
import type { UpdateProfileData, ChangePasswordData, AvatarResponse, User } from "@/types";

const http = new HTTPTransport();

export const UsersAPI = {
  getUser: (): Promise<User> => http.get("/auth/user"),

  updateProfile: (data: UpdateProfileData): Promise<User> => http.put("/user/profile", { data }),

  updateAvatar: (form: FormData): Promise<AvatarResponse> =>
    http.put("/user/profile/avatar", { data: form }),

  changePassword: (data: ChangePasswordData): Promise<void> => http.put("/user/password", { data }),

  searchUsers: (login: string): Promise<User[]> => http.post("/user/search", { data: { login } }),
};
