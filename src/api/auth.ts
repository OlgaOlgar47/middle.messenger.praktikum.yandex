import { HTTPTransport } from "@/framework/HTTPTransport";

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
