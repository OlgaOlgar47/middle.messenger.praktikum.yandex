import type { Message, SendMessageData } from "@/types";
import store from "@/store/Store";
import { errorHandler } from "@/utils/errorHandler";

export class WebSocketService {
  private socket: WebSocket | null = null;

  private _chatId: number | null = null;

  private _token: string | null = null;

  private onMessageCallback: ((messages: Message[]) => void) | null = null;

  private onNewMessageCallback: ((message: Message) => void) | null = null;

  constructor() {
    this.handleOpen = this.handleOpen.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  // Подключение к WebSocket
  async connect(chatId: number, token: string): Promise<void> {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.disconnect();
    }

    this._chatId = chatId;
    this._token = token;

    const userId = this.getCurrentUserId();
    const wsUrl = `wss://ya-praktikum.tech/ws/chats/${userId}/${chatId}/${token}`;

    try {
      this.socket = new WebSocket(wsUrl);
      this.socket.addEventListener("open", this.handleOpen);
      this.socket.addEventListener("message", this.handleMessage);
      this.socket.addEventListener("close", this.handleClose);
      this.socket.addEventListener("error", this.handleError);
    } catch (error) {
      console.error("Ошибка подключения к WebSocket:", error);
      throw error;
    }
  }

  // Отключение от WebSocket
  disconnect(): void {
    if (this.socket) {
      this.socket.removeEventListener("open", this.handleOpen);
      this.socket.removeEventListener("message", this.handleMessage);
      this.socket.removeEventListener("close", this.handleClose);
      this.socket.removeEventListener("error", this.handleError);
      this.socket.close();
      this.socket = null;
    }
    this._chatId = null;
    this._token = null;
  }

  // Отправка сообщения
  sendMessage(message: SendMessageData): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          content: message.content,
          type: message.type || "message",
        })
      );
    } else {
      console.error("WebSocket не подключен");
    }
  }

  // Запрос старых сообщений
  getOldMessages(offset: number = 0): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          content: offset.toString(),
          type: "get old",
        })
      );
    }
  }

  // Установка колбэка для получения сообщений
  onMessages(callback: (messages: Message[]) => void): void {
    this.onMessageCallback = callback;
  }

  // Установка колбэка для получения новых сообщений
  onNewMessage(callback: (message: Message) => void): void {
    this.onNewMessageCallback = callback;
  }

  private handleOpen(): void {
    console.log("WebSocket подключен");
    // Загружаем последние 20 сообщений сразу после подключения
    setTimeout(() => {
      this.getOldMessages(0);
    }, 10); // Небольшая задержка для стабильности
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);

      if (Array.isArray(data)) {
        // Массив сообщений (старые сообщения)
        if (this.onMessageCallback) {
          this.onMessageCallback(data);
        }
      } else if (data.type === "message") {
        // Новое сообщение
        if (this.onNewMessageCallback) {
          this.onNewMessageCallback(data);
        }
      }
    } catch (error) {
      console.error("Ошибка парсинга сообщения WebSocket:", error);
    }
  }

  private handleClose(): void {
    console.log("WebSocket отключен");
  }

  private handleError(error: Event): void {
    console.error("Ошибка WebSocket:", error);
    errorHandler.handleError(new Error("WebSocket connection error"));
  }

  private getCurrentUserId(): number {
    const state = store.getState();

    if (state.user && (state.user as { id: number }).id) {
      return (state.user as { id: number }).id;
    }

    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      return user.id;
    }

    throw new Error("Пользователь не авторизован");
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  getCurrentChatId(): number | null {
    return this._chatId;
  }

  getCurrentToken(): string | null {
    return this._token;
  }
}

export const webSocketService = new WebSocketService();
