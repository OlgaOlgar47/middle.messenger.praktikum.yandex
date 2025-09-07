import { HTTPTransport } from "@/framework/HTTPTransport";
import type { Message, SendMessageData } from "@/types";

const API_BASE_URL = "https://ya-praktikum.tech/api/v2";

class MessagesAPI {
  private http: HTTPTransport;

  constructor() {
    this.http = new HTTPTransport(`${API_BASE_URL}/chats/token`);
  }

  // Получить токен для WebSocket соединения
  async getChatToken(chatId: number): Promise<{ token: string }> {
    return this.http.post(`/${chatId}`, {});
  }

  // Получить сообщения чата (через WebSocket)
  async getMessages(_chatId: number, _offset: number = 0): Promise<Message[]> {
    // Этот метод будет использоваться с WebSocket
    // Пока возвращаем пустой массив
    return [];
  }

  // Отправить сообщение (через WebSocket)
  async sendMessage(_chatId: number, _message: SendMessageData): Promise<void> {
    // Этот метод будет использоваться с WebSocket
    // Пока ничего не делаем
  }
}

export const messagesAPI = new MessagesAPI();
