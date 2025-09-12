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
      console.log(`🚀 Начинаем подключение к чату ${chatId}`);
      const startTime = Date.now();

      const { token } = await messagesAPI.getChatToken(chatId);
      console.log(`🔑 Получен токен за ${Date.now() - startTime}ms`);

      await webSocketService.connect(chatId, token);
      console.log(`🔌 WebSocket подключен за ${Date.now() - startTime}ms`);

      this.currentChatId = chatId;
      this.messages = [];

      // Очищаем сообщения для текущего чата перед установкой колбэков
      store.set(`messagesByChat.${chatId}`, []);

      // Таймаут для лоадера (на случай проблем с WebSocket)
      const loaderTimeout = setTimeout(() => {
        console.log(`⏰ Таймаут лоадера для чата ${chatId}`);
        store.set("isLoadingMessages", false);
      }, 5000); // 5 секунд

      webSocketService.onMessages((messages: Message[]) => {
        // Проверяем, что мы все еще подключены к тому же чату
        if (this.currentChatId === chatId) {
          console.log(
            `📨 Получены сообщения для чата ${chatId}: ${messages.length} шт. ` +
              `за ${Date.now() - startTime}ms`
          );
          store.set(`messagesByChat.${chatId}`, messages);

          // Скрываем лоадер после получения сообщений (даже если их 0)
          clearTimeout(loaderTimeout);
          store.set("isLoadingMessages", false);
          console.log(`✅ Лоадер скрыт после получения сообщений (${messages.length} шт.)`);
        } else {
          console.log(
            `⚠️ Игнорируем сообщения для чата ${chatId}, текущий чат: ${this.currentChatId}`
          );
        }
      });

      webSocketService.onNewMessage((message: Message) => {
        // Проверяем, что мы все еще подключены к тому же чату
        if (this.currentChatId === chatId) {
          const prev = store.getState().messagesByChat[chatId] || [];
          store.set(`messagesByChat.${chatId}`, [...prev, message]);
        }
      });

      console.log(`✅ Полностью подключен к чату ${chatId} за ${Date.now() - startTime}ms`);
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
