import { HTTPTransport } from "@/framework/HTTPTransport";

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
    translation?: string;
    user_id?: number;
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

export class ChatsAPI {
  private http: HTTPTransport;

  constructor(http?: HTTPTransport) {
    this.http = http || new HTTPTransport();
  }

  getChats(): Promise<Chat[]> {
    return this.http.get("/chats", { data: { _: Date.now() } });
  }

  createChat(data: CreateChatData): Promise<{ id: number }> {
    return this.http.post("/chats", { data });
  }

  addUsersToChat(data: AddUserToChatData): Promise<void> {
    return this.http.put("/chats/users", { data });
  }

  updateChat(data: { chatId: number; title: string }): Promise<void> {
    return this.http.put("/chats", { data });
  }

  deleteChat(chatId: number): Promise<void> {
    return this.http.delete("/chats", { data: { chatId } });
  }

  deleteUsersFromChat(data: DeleteUserFromChatData): Promise<void> {
    return this.http.delete("/chats/users", { data });
  }

  getChatUsers(chatId: number): Promise<ChatUser[]> {
    return this.http.get(`/chats/${chatId}/users`);
  }

  getChatToken(chatId: number): Promise<{ token: string }> {
    return this.http.post(`/chats/token/${chatId}`);
  }

  markRead(chatId: number): Promise<void> {
    return this.http.post(`/chats/${chatId}/read`);
  }
}

export const chatsAPI = new ChatsAPI();
