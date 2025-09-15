import { messagesAPI } from "@/api/messages";
import { webSocketService } from "@/services/WebSocketService";
import { Toast } from "@/utils/toast";
import store from "@/store/Store";
import type { Message, SendMessageData } from "@/types";

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
        }
      });

      webSocketService.onNewMessage((message: Message) => {
        if (this.currentChatId === chatId) {
          const prev = store.getState().messagesByChat[chatId] || [];
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
      Toast.error("Ошибка подключения к чату");
    }
  }

  disconnectFromChat(): void {
    webSocketService.disconnect();
    this.currentChatId = null;
    this.messages = [];
  }

  sendMessage(content: string): void {
    if (!this.currentChatId) {
      Toast.error("Выберите чат для отправки сообщения");
      return;
    }

    if (!content.trim()) {
      Toast.error("Сообщение не может быть пустым");
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
      Toast.error("Ошибка отправки сообщения");
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
