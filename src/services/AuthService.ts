import { HTTPTransport } from "@/framework/HTTPTransport";

const http = new HTTPTransport("/api/auth");

export class AuthService {
  async login(data: { login: string; password: string }) {
    return http.post("/login", { data });
  }

  async logout() {
    return http.post("/login");
  }

  async register(data: Record<string, string>) {
    return http.post("/register", { data });
  }

  async getUser(id: number) {
    return http.get(`/user/${id}`);
  }

  async updateUser(id: number, data: { name: string }) {
    return http.put(`/user/${id}`, { data });
  }

  async deleteUser(id: number) {
    return http.delete(`/user/${id}`);
  }

  async searchUsers(query: { name: string }) {
    return http.get("/users", { data: query });
  }
}
