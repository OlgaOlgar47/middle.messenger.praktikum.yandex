// api/users.ts (минимум)
import { HTTPTransport } from "@/framework/HTTPTransport";

const http = new HTTPTransport("/api"); // или полный baseURL
export const UsersAPI = {
  updateProfile: (data: any) => http.put("/user/profile", { data }),
  updateAvatar: (form: FormData) => http.put("/user/profile/avatar", { data: form }),
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    http.put("/user/password", { data }),
};
