import { HTTPTransport } from "@/framework/HTTPTransport";

const http = new HTTPTransport();

export interface Chat {
  id: number;
  title: string;
  avatar: string | null;
  unread_count: number;
  last_message: {
    user: {
      first_name: string;
      second_name: string;
      avatar: string | null;
      email: string;
      login: string;
      phone: string;
    };
    time: string;
    content: string;
  } | null;
}

export interface CreateChatData {
  title: string;
}

export interface AddUserToChatData {
  users: number[];
  chatId: number;
}

export interface DeleteUserFromChatData {
  users: number[];
  chatId: number;
}

export interface ChatUser {
  id: number;
  first_name: string;
  second_name: string;
  display_name: string | null;
  login: string;
  email: string;
  phone: string;
  avatar: string | null;
  role: string;
}

export const ChatsAPI = {
  // Получить список чатов
  getChats: (): Promise<Chat[]> => http.get("/chats"),

  // Создать новый чат
  createChat: (data: CreateChatData): Promise<{ id: number }> => http.post("/chats", { data }),

  // Добавить пользователя в чат
  addUsersToChat: (data: AddUserToChatData): Promise<void> => http.put("/chats/users", { data }),

  // Удалить пользователя из чата
  deleteUsersFromChat: (data: DeleteUserFromChatData): Promise<void> =>
    http.delete("/chats/users", { data }),

  // Получить пользователей чата
  getChatUsers: (chatId: number): Promise<ChatUser[]> => http.get(`/chats/${chatId}/users`),

  // Получить токен для подключения к WebSocket
  getChatToken: (chatId: number): Promise<{ token: string }> => http.post(`/chats/token/${chatId}`),
};
