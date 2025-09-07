import {
  ChatsAPI,
  type Chat,
  type CreateChatData,
  type AddUserToChatData,
  type DeleteUserFromChatData,
} from "@/api/chats";
import { Store } from "@/store";
import { Toast } from "@/utils/toast";

export const ChatController = {
  // Получить список чатов
  async getChats(): Promise<Chat[]> {
    try {
      const chats = await ChatsAPI.getChats();
      Store.set("chats", chats);
      return chats;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ошибка загрузки чатов";
      Toast.error(errorMessage);
      throw error;
    }
  },

  // Создать новый чат
  async createChat(title: string): Promise<void> {
    try {
      const data: CreateChatData = { title };
      await ChatsAPI.createChat(data);
      Toast.success("Чат успешно создан");
      // Обновляем список чатов
      await this.getChats();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ошибка создания чата";
      Toast.error(errorMessage);
      throw error;
    }
  },

  // Добавить пользователя в чат
  async addUserToChat(chatId: number, userId: number): Promise<void> {
    try {
      const data: AddUserToChatData = { users: [userId], chatId };
      await ChatsAPI.addUsersToChat(data);
      Toast.success("Пользователь добавлен в чат");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Ошибка добавления пользователя";
      Toast.error(errorMessage);
      throw error;
    }
  },

  // Удалить пользователя из чата
  async removeUserFromChat(chatId: number, userId: number): Promise<void> {
    try {
      const data: DeleteUserFromChatData = { users: [userId], chatId };
      await ChatsAPI.deleteUsersFromChat(data);
      Toast.success("Пользователь удален из чата");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ошибка удаления пользователя";
      Toast.error(errorMessage);
      throw error;
    }
  },

  // Получить пользователей чата
  async getChatUsers(chatId: number) {
    try {
      return await ChatsAPI.getChatUsers(chatId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Ошибка загрузки пользователей чата";
      Toast.error(errorMessage);
      throw error;
    }
  },

  // Получить токен для WebSocket
  async getChatToken(chatId: number) {
    try {
      return await ChatsAPI.getChatToken(chatId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ошибка получения токена";
      Toast.error(errorMessage);
      throw error;
    }
  },
};
