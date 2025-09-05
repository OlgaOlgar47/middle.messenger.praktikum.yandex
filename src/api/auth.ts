import { HTTPTransport } from "@/framework/HTTPTransport";
import type { UpdateProfileData, ChangePasswordData, AvatarResponse, User } from "@/types";

const http = new HTTPTransport();

export type SignInDTO = { login: string; password: string };
export type SignUpDTO = {
  first_name: string;
  second_name: string;
  login: string;
  email: string;
  password: string;
  phone: string;
};

export const AuthAPI = {
  signin: (data: SignInDTO) => http.post("/auth/signin", { data }),
  signup: (data: SignUpDTO) => http.post("/auth/signup", { data }),
  logout: () => http.post("/auth/logout"),
  me: () => http.get("/auth/user"),
};

export const UsersAPI = {
  // Получить данные пользователя
  getUser: (): Promise<User> => http.get("/auth/user"),

  // Обновить профиль
  updateProfile: (data: UpdateProfileData): Promise<User> => http.put("/user/profile", { data }),

  // Обновить аватар
  updateAvatar: (form: FormData): Promise<AvatarResponse> =>
    http.put("/user/profile/avatar", { data: form }),

  // Изменить пароль
  changePassword: (data: ChangePasswordData): Promise<void> => http.put("/user/password", { data }),
};
