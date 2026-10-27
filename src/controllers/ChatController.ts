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
import { errorText, text, userNotFound } from "@/locale";

export const ChatController = {
  async getChats(): Promise<Chat[]> {
    try {
      const chats = await chatsAPI.getChats();
      Store.set("chats", chats);
      return chats;
    } catch (error) {
      Toast.error(errorText(error, text().chatsLoadError));
      throw error;
    }
  },

  async createChat(title: string): Promise<void> {
    try {
      const data: CreateChatData = { title };
      await chatsAPI.createChat(data);
      Toast.success(text().chatCreated);
      await this.getChats();
    } catch (error) {
      Toast.error(errorText(error, text().chatCreateError));
      throw error;
    }
  },

  async addUserToChat(chatId: number, userId: number): Promise<void> {
    try {
      const data: AddUserToChatData = { users: [userId], chatId };
      await chatsAPI.addUsersToChat(data);
      Toast.success("Пользователь добавлен в чат");
    } catch (error) {
      Toast.error(errorText(error, text().addUserError));
      throw error;
    }
  },

  async addUsersToChat(chatId: number, logins: string[]): Promise<void> {
    try {
      const users = await Promise.all(
        logins.map(async (login) => {
          const foundUsers = await usersAPI.searchUsers(login);
          if (foundUsers.length === 0) {
            throw new Error(userNotFound(login));
          }
          return foundUsers[0];
        })
      );

      const userIds = users.map((user) => user.id);
      const data: AddUserToChatData = { users: userIds, chatId };
      await chatsAPI.addUsersToChat(data);
    } catch (error) {
      Toast.error(errorText(error, text().addUsersError));
      throw error;
    }
  },

  async removeUserFromChat(chatId: number, userId: number): Promise<void> {
    try {
      const data: DeleteUserFromChatData = { users: [userId], chatId };
      await chatsAPI.deleteUsersFromChat(data);
      Toast.success("Пользователь удален из чата");
    } catch (error) {
      Toast.error(errorText(error, text().removeUserError));
      throw error;
    }
  },

  async removeUserFromChatByLogin(chatId: number, login: string): Promise<void> {
    try {
      const foundUsers = await usersAPI.searchUsers(login);
      if (foundUsers.length === 0) {
        throw new Error(userNotFound(login));
      }

      const userId = foundUsers[0].id;
      const data: DeleteUserFromChatData = { users: [userId], chatId };
      await chatsAPI.deleteUsersFromChat(data);
    } catch (error) {
      Toast.error(errorText(error, text().removeUserError));
      throw error;
    }
  },

  async getChatUsers(chatId: number) {
    try {
      return await chatsAPI.getChatUsers(chatId);
    } catch (error) {
      Toast.error(errorText(error, text().chatUsersError));
      throw error;
    }
  },

  async getChatToken(chatId: number) {
    try {
      return await chatsAPI.getChatToken(chatId);
    } catch (error) {
      Toast.error(errorText(error, text().tokenError));
      throw error;
    }
  },
};
