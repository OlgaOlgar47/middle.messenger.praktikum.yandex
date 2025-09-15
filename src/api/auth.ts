import { HTTPTransport } from "@/framework/HTTPTransport";

export type SignInDTO = { login: string; password: string };
export type SignUpDTO = {
  first_name: string;
  second_name: string;
  login: string;
  email: string;
  password: string;
  phone: string;
};

export class AuthAPI {
  private http: HTTPTransport;

  constructor(http?: HTTPTransport) {
    this.http = http || new HTTPTransport();
  }

  signin(data: SignInDTO) {
    return this.http.post("/auth/signin", { data });
  }

  signup(data: SignUpDTO) {
    return this.http.post("/auth/signup", { data });
  }

  logout() {
    return this.http.post("/auth/logout");
  }

  me() {
    return this.http.get("/auth/user");
  }
}

export const authAPI = new AuthAPI();
