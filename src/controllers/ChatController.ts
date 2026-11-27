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
import { dismissAlert } from "@/utils/notify";

function chatStamp(chat: Chat): string {
  const last = chat.last_message;
  return [
    chat.id,
    chat.title,
    chat.avatar,
    chat.unread_count,
    last?.user.login ?? "",
    last?.time ?? "",
    last?.content ?? "",
    last?.translation ?? "",
  ].join("\u0001");
}

function sameChats(left: Chat[], right: Chat[]): boolean {
  if (left.length !== right.length) return false;
  return left.every((chat, index) => chatStamp(chat) === chatStamp(right[index]));
}

export const ChatController = {
  async getChats(options?: { silent?: boolean }): Promise<Chat[]> {
    try {
      const loaded = await chatsAPI.getChats();
      const selected = Store.getState().selectedChatId;
      const reading = typeof document === "undefined" || !document.hidden;
      const chats = loaded.map((chat) =>
        reading && chat.id === selected ? { ...chat, unread_count: 0 } : chat
      );
      const prev = Store.getState().chats;
      if (!sameChats(prev, chats)) Store.set("chats", chats);
      return chats;
    } catch (error) {
      if (!options?.silent) Toast.error(errorText(error, text().chatsLoadError));
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

  async findUserByLogin(login: string) {
    const foundUsers = await usersAPI.searchUsers(login);
    const name = login.trim().toLowerCase();
    const user = foundUsers.find((item) => item.login.toLowerCase() === name);
    if (!user) throw new Error(userNotFound(login));
    return user;
  },

  async addUsersToChat(chatId: number, logins: string[]): Promise<void> {
    try {
      const users = await Promise.all(logins.map((login) => this.findUserByLogin(login)));

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
      const userId = (await this.findUserByLogin(login)).id;
      const data: DeleteUserFromChatData = { users: [userId], chatId };
      await chatsAPI.deleteUsersFromChat(data);
    } catch (error) {
      Toast.error(errorText(error, text().removeUserError));
      throw error;
    }
  },

  async renameChat(chatId: number, title: string): Promise<void> {
    try {
      await chatsAPI.updateChat({ chatId, title });
      Toast.success(text().chatRenamed);
      await this.getChats();
    } catch (error) {
      Toast.error(errorText(error, text().chatRenameError));
      throw error;
    }
  },

  async deleteChat(chatId: number): Promise<void> {
    try {
      await chatsAPI.deleteChat(chatId);
      Toast.success(text().chatDeleted);
      await this.getChats();
    } catch (error) {
      Toast.error(errorText(error, text().chatDeleteError));
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

  clearUnread(chatId: number): void {
    dismissAlert(chatId);
    const chats = Store.getState().chats;
    if (!chats.some((chat) => chat.id === chatId && chat.unread_count > 0)) return;
    Store.set(
      "chats",
      chats.map((chat) => (chat.id === chatId ? { ...chat, unread_count: 0 } : chat))
    );
  },

  async markRead(chatId: number): Promise<void> {
    this.clearUnread(chatId);
    try {
      await chatsAPI.markRead(chatId);
    } catch {
      // The open chat stays clear; the next refresh confirms the read cursor.
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
