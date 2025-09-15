import {
  chatsAPI,
  type Chat,
  type CreateChatData,
  type AddUserToChatData,
  type DeleteUserFromChatData,
} from "@/api/chats";
import { usersAPI } from "@/api/users";
import { Store } from "@/store";
import { Toast } from "@/utils/toast";

export const ChatController = {
  async getChats(): Promise<Chat[]> {
    try {
      const chats = await chatsAPI.getChats();
      Store.set("chats", chats);
      return chats;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ошибка загрузки чатов";
      Toast.error(errorMessage);
      throw error;
    }
  },

  async createChat(title: string): Promise<void> {
    try {
      const data: CreateChatData = { title };
      await chatsAPI.createChat(data);
      Toast.success("Чат успешно создан");
      await this.getChats();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ошибка создания чата";
      Toast.error(errorMessage);
      throw error;
    }
  },

  async addUserToChat(chatId: number, userId: number): Promise<void> {
    try {
      const data: AddUserToChatData = { users: [userId], chatId };
      await chatsAPI.addUsersToChat(data);
      Toast.success("Пользователь добавлен в чат");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Ошибка добавления пользователя";
      Toast.error(errorMessage);
      throw error;
    }
  },

  async addUsersToChat(chatId: number, logins: string[]): Promise<void> {
    try {
      const users = await Promise.all(
        logins.map(async (login) => {
          const foundUsers = await usersAPI.searchUsers(login);
          if (foundUsers.length === 0) {
            throw new Error(`Пользователь с логином "${login}" не найден`);
          }
          return foundUsers[0];
        })
      );

      const userIds = users.map((user) => user.id);
      const data: AddUserToChatData = { users: userIds, chatId };
      await chatsAPI.addUsersToChat(data);
      Toast.success("Пользователи добавлены в чат");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Ошибка добавления пользователей";
      Toast.error(errorMessage);
      throw error;
    }
  },

  async removeUserFromChat(chatId: number, userId: number): Promise<void> {
    try {
      const data: DeleteUserFromChatData = { users: [userId], chatId };
      await chatsAPI.deleteUsersFromChat(data);
      Toast.success("Пользователь удален из чата");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ошибка удаления пользователя";
      Toast.error(errorMessage);
      throw error;
    }
  },

  async removeUserFromChatByLogin(chatId: number, login: string): Promise<void> {
    try {
      const foundUsers = await usersAPI.searchUsers(login);
      if (foundUsers.length === 0) {
        throw new Error(`Пользователь с логином "${login}" не найден`);
      }

      const userId = foundUsers[0].id;
      const data: DeleteUserFromChatData = { users: [userId], chatId };
      await chatsAPI.deleteUsersFromChat(data);
      Toast.success("Пользователь удален из чата");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ошибка удаления пользователя";
      Toast.error(errorMessage);
      throw error;
    }
  },

  async getChatUsers(chatId: number) {
    try {
      return await chatsAPI.getChatUsers(chatId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Ошибка загрузки пользователей чата";
      Toast.error(errorMessage);
      throw error;
    }
  },

  async getChatToken(chatId: number) {
    try {
      return await chatsAPI.getChatToken(chatId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ошибка получения токена";
      Toast.error(errorMessage);
      throw error;
    }
  },
};
