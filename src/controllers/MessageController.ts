import { messagesAPI } from "@/api/messages";
import { webSocketService } from "@/services/WebSocketService";
import { Toast } from "@/utils/toast";
import { text } from "@/locale";
import { alertNewMessage } from "@/utils/notify";
import { ChatController } from "@/controllers/ChatController";
import store from "@/store/Store";
import type { Chat, Message, SendMessageData } from "@/types";

export class MessageController {
  private currentChatId: number | null = null;

  private messages: Message[] = [];

  async connectToChat(chatId: number): Promise<void> {
    try {
      const { token } = await messagesAPI.getChatToken(chatId);

      await webSocketService.connect(chatId, token);

      this.currentChatId = chatId;
      this.messages = [];

      store.set(`messagesByChat.${chatId}`, []);

      const loaderTimeout = setTimeout(() => {
        store.set("isLoadingMessages", false);
      }, 5000);

      webSocketService.onMessages((messages: Message[]) => {
        if (this.currentChatId === chatId) {
          const sortedMessages = messages.sort((a, b) => {
            const timeA = new Date(a.time).getTime();
            const timeB = new Date(b.time).getTime();
            return timeA - timeB;
          });

          store.set(`messagesByChat.${chatId}`, sortedMessages);

          clearTimeout(loaderTimeout);
          store.set("isLoadingMessages", false);
          if (!document.hidden) ChatController.markRead(chatId).catch(() => undefined);
        }
      });

      webSocketService.onControl((event) => {
        if (event.chatId !== chatId) {
          return;
        }
        if (event.type === "chat-updated" && event.title) {
          const chats = store
            .getState()
            .chats.map((chat: Chat) =>
              chat.id === chatId ? { ...chat, title: event.title as string } : chat
            );
          store.set("chats", chats);
          return;
        }
        if (event.type === "chat-deleted") {
          store.set(
            "chats",
            store.getState().chats.filter((chat: Chat) => chat.id !== chatId)
          );
          if (this.currentChatId === chatId) {
            this.disconnectFromChat();
            store.set("selectedChatId", undefined);
            store.set("isLoadingMessages", false);
          }
        }
      });

      webSocketService.onTranslated((update) => {
        if (this.currentChatId !== chatId) return;
        const prev = store.getState().messagesByChat[chatId] || [];
        const updated = prev.map((item: Message) =>
          item.id === update.id ? { ...item, translation: update.translation } : item
        );
        store.set(`messagesByChat.${chatId}`, updated);
        const last = updated[updated.length - 1];
        if (last?.id !== update.id) return;
        store.set(
          "chats",
          store.getState().chats.map((chat: Chat) =>
            chat.id === chatId && chat.last_message
              ? {
                  ...chat,
                  last_message: { ...chat.last_message, translation: update.translation },
                }
              : chat
          )
        );
      });

      webSocketService.onNewMessage((message: Message) => {
        if (this.currentChatId === chatId) {
          const me = Number((store.getState().user as { id?: number } | null)?.id || 0);
          if (message.user_id !== me) {
            if (document.hidden) {
              const chat = store.getState().chats.find((item) => item.id === chatId);
              alertNewMessage(
                chatId,
                chat?.title || "URUS",
                "",
                message.content,
                message.translation
              );
            } else {
              ChatController.markRead(chatId).catch(() => undefined);
            }
          }
          const prev = store.getState().messagesByChat[chatId] || [];
          store.set(
            "chats",
            store.getState().chats.map((chat: Chat) =>
              chat.id === chatId
                ? {
                    ...chat,
                    unread_count:
                      message.user_id === me
                        ? chat.unread_count
                        : document.hidden
                          ? chat.unread_count + 1
                          : 0,
                    last_message: {
                      user: chat.last_message?.user || {
                        first_name: "",
                        second_name: "",
                        avatar: null,
                        email: "",
                        login: "",
                        phone: "",
                      },
                      time: message.time,
                      content: message.content,
                      translation: message.translation || "",
                      user_id: message.user_id,
                    },
                  }
                : chat
            )
          );
          const updatedMessages = [...prev, message];

          const sortedMessages = updatedMessages.sort((a, b) => {
            const timeA = new Date(a.time).getTime();
            const timeB = new Date(b.time).getTime();
            return timeA - timeB;
          });

          store.set(`messagesByChat.${chatId}`, sortedMessages);
        }
      });
    } catch (error) {
      console.error("Ошибка подключения к чату:", error);
      store.set("isLoadingMessages", false);
      Toast.error(text().chatConnectError);
    }
  }

  disconnectFromChat(): void {
    webSocketService.disconnect();
    this.currentChatId = null;
    this.messages = [];
  }

  sendMessage(content: string): void {
    if (!this.currentChatId) {
      Toast.error(text().pickChatToSend);
      return;
    }

    if (!content.trim()) {
      Toast.error(text().messageEmpty);
      return;
    }

    const messageData: SendMessageData = {
      content: content.trim(),
      type: "message",
    };

    try {
      webSocketService.sendMessage(messageData);
    } catch (error) {
      console.error("Ошибка отправки сообщения:", error);
      Toast.error(text().messageSendError);
    }
  }

  getMessages(): Message[] {
    return this.messages;
  }

  loadOldMessages(): void {
    if (this.currentChatId) {
      webSocketService.getOldMessages(this.messages.length);
    }
  }

  isConnected(): boolean {
    return webSocketService.isConnected();
  }

  getCurrentChatId(): number | null {
    return this.currentChatId;
  }
}

export const messageController = new MessageController();
