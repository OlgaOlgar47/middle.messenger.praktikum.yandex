import { messagesAPI } from "@/api/messages";
import { webSocketService } from "@/services/WebSocketService";
import { Toast } from "@/utils/toast";
import store from "@/store/Store";
import type { Message, SendMessageData } from "@/types";

export class MessageController {
  private currentChatId: number | null = null;

  private messages: Message[] = [];

  // Подключение к чату
  async connectToChat(chatId: number): Promise<void> {
    try {
      // Получаем токен для WebSocket
      const { token } = await messagesAPI.getChatToken(chatId);

      // Подключаемся к WebSocket
      await webSocketService.connect(chatId, token);

      this.currentChatId = chatId;
      this.messages = [];

      // Устанавливаем обработчики сообщений
      webSocketService.onMessages((messages: Message[]) => {
        // Загружаем историю сообщений
        store.set(`messagesByChat.${chatId}`, messages);
      });

      webSocketService.onNewMessage((message: Message) => {
        // Добавляем новое сообщение
        const prev = store.getState().messagesByChat[chatId] || [];
        store.set(`messagesByChat.${chatId}`, [...prev, message]);
      });

      console.log(`✅ Подключен к чату ${chatId}`);
    } catch (error) {
      console.error("Ошибка подключения к чату:", error);
      Toast.error("Ошибка подключения к чату");
    }
  }

  // Отключение от чата
  disconnectFromChat(): void {
    webSocketService.disconnect();
    this.currentChatId = null;
    this.messages = [];
  }

  // Отправка сообщения
  sendMessage(content: string): void {
    console.log("🔘 MessageController.sendMessage called with:", content);
    console.log("🔘 currentChatId:", this.currentChatId);
    console.log("🔘 webSocketService.isConnected():", webSocketService.isConnected());

    if (!this.currentChatId) {
      console.log("❌ No currentChatId");
      Toast.error("Выберите чат для отправки сообщения");
      return;
    }

    if (!content.trim()) {
      console.log("❌ Empty content");
      Toast.error("Сообщение не может быть пустым");
      return;
    }

    const messageData: SendMessageData = {
      content: content.trim(),
      type: "message",
    };

    try {
      console.log("🔘 Sending message via WebSocket:", messageData);
      webSocketService.sendMessage(messageData);
      console.log("🔘 Message sent via WebSocket");
    } catch (error) {
      console.error("Ошибка отправки сообщения:", error);
      Toast.error("Ошибка отправки сообщения");
    }
  }

  // Получение сообщений текущего чата
  getMessages(): Message[] {
    return this.messages;
  }

  // Загрузка старых сообщений
  loadOldMessages(): void {
    if (this.currentChatId) {
      webSocketService.getOldMessages(this.messages.length);
    }
  }

  // Проверка подключения
  isConnected(): boolean {
    return webSocketService.isConnected();
  }

  // Получение ID текущего чата
  getCurrentChatId(): number | null {
    return this.currentChatId;
  }
}

export const messageController = new MessageController();
