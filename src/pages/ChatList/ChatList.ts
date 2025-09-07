import Block from "@/framework/Block";
import { Input } from "@/components/Input";
import { RoundButton } from "@/components/RoundButton";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import type { BaseProps, Chat, Message } from "@/types";
import { ChatController } from "@/controllers/ChatController";
import { messageController } from "@/controllers/MessageController";
import { connect } from "@/store/connect";
import store from "@/store/Store";

import styles from "./ChatList.module.sass";

interface ChatListProps extends BaseProps {
  chats?: Chat[];
  messages?: Message[];
  searchInput?: Input;
  messageInput?: Input;
  roundButton?: RoundButton;
  createChatButton?: Button;
  createChatModal?: Modal;
  selectedChatId?: number;
}

export class ChatList extends Block<ChatListProps> {
  constructor(props: ChatListProps) {
    super("div", {
      ...props,
      styles,
      chats: [],
      messages: [],
      selectedChatId: undefined,
      searchInput: new Input({
        type: "text",
        name: "query",
        placeholder: "Поиск",
        className: styles.searchInputWithIcon,
      }),
      messageInput: new Input({
        type: "text",
        name: "message",
        placeholder: "Введите сообщение",
        className: styles.messageInput,
      }),
      roundButton: new RoundButton({
        icon: "arrow-right",
        events: {
          click: () => this.handleSendMessage(),
        },
      }),
      createChatButton: new Button({
        label: "Создать чат",
        className: styles.createChatButton,
        events: {
          click: (e: Event) => {
            e.preventDefault();
            console.log("🔘 Кнопка 'Создать чат' нажата");
            this.openCreateChatModal();
          },
        },
      }),
      createChatModal: new Modal({
        title: "Создать новый чат",
        inputLabel: "Название чата",
        inputPlaceholder: "Введите название чата",
        submitButtonLabel: "Создать",
        onSubmit: (title: string) => this.handleCreateChat(title),
      }),
      events: {
        click: (e: Event) => this.handleChatClick(e),
      },
    });
  }

  protected init(): void {
    // Загружаем чаты при инициализации
    this.loadChats();

    // Привязываем события к кнопкам после рендера
    setTimeout(() => {
      // Кнопка создания чата
      const createButton = this.element?.querySelector("button");
      if (createButton) {
        console.log("🔍 Create button found, adding event listener");
        createButton.addEventListener("click", (e) => {
          console.log("🔘 Create button click event fired!");
          e.preventDefault();
          this.openCreateChatModal();
        });
      } else {
        console.log("❌ Create button not found in DOM");
      }
    }, 100);
  }

  // Метод для HOC - пересоздаем кнопку при обновлении store
  public updateFields() {
    console.log("🔄 updateFields called");
    // Кнопка уже создана в конструкторе, ничего не делаем
  }

  private async loadChats() {
    try {
      await ChatController.getChats();
    } catch (error) {
      console.error("Ошибка загрузки чатов:", error);
    }
  }

  private openCreateChatModal() {
    console.log("🔘 openCreateChatModal called");
    console.log("🔘 createChatModal:", this.children.createChatModal);
    console.log("🔘 createChatModal type:", typeof this.children.createChatModal);
    (this.children.createChatModal as Modal)?.open();
  }

  private async handleCreateChat(title: string) {
    console.log("🔘 handleCreateChat called with title:", title);
    try {
      await ChatController.createChat(title);
      console.log("✅ Чат создан успешно");
    } catch (error) {
      console.error("❌ Ошибка создания чата:", error);
    }
  }

  private handleChatClick(event: Event) {
    const target = event.target as HTMLElement;
    const chatItem = target.closest("[data-chat-id]");

    if (chatItem) {
      const chatId = parseInt(chatItem.getAttribute("data-chat-id") || "0", 10);
      this.selectChat(chatId);
    }
  }

  private async selectChat(chatId: number) {
    this.setProps({ selectedChatId: chatId });

    // Подключаемся к чату через WebSocket
    try {
      await messageController.connectToChat(chatId);
      // Обновляем сообщения
      this.updateMessages();

      // Привязываем события к кнопке отправки после рендера чата
      setTimeout(() => {
        this.attachMessageEvents();
      }, 100);
    } catch (error) {
      console.error("Ошибка подключения к чату:", error);
    }
  }

  private handleSendMessage() {
    console.log("🔘 handleSendMessage called");
    console.log("🔘 this.props.selectedChatId:", this.props.selectedChatId);

    // Ищем поле ввода напрямую в DOM
    const inputElement = this.element?.querySelector('input[name="message"]') as HTMLInputElement;
    console.log("🔘 inputElement from DOM:", inputElement);

    const message = inputElement?.value?.trim();
    console.log("🔘 message:", message);

    if (message && this.props.selectedChatId) {
      console.log("🔘 Sending message:", message, "to chat:", this.props.selectedChatId);
      // Отправляем сообщение через WebSocket
      messageController.sendMessage(message);
      inputElement.value = "";
      console.log("🔘 Message sent successfully");
    } else {
      console.log("❌ No message or selectedChatId");
      console.log("❌ message:", message);
      console.log("❌ selectedChatId:", this.props.selectedChatId);
    }
  }

  private attachMessageEvents() {
    // Ищем все кнопки в форме
    const buttons = this.element?.querySelectorAll("button");
    console.log("🔍 Found buttons:", buttons?.length);

    buttons?.forEach((button, index) => {
      console.log(
        `🔍 Button ${index}:`,
        button.textContent?.trim(),
        "type:",
        button.getAttribute("type")
      );

      // Ищем кнопку отправки по тексту, типу или позиции в форме
      if (
        button.textContent?.trim() === "→" ||
        button.getAttribute("type") === "submit" ||
        (index === 1 && button.closest("form")) // Вторая кнопка в форме
      ) {
        console.log("🔍 Send button found, adding event listener");
        button.addEventListener("click", (e) => {
          console.log("🔘 Send button click event fired!");
          e.preventDefault();
          this.handleSendMessage();
        });
      }
    });

    // Форма отправки сообщений
    const messageForm = this.element?.querySelector("form");
    if (messageForm) {
      console.log("🔍 Message form found, adding event listener");
      messageForm.addEventListener("submit", (e) => {
        console.log("🔘 Message form submit event fired!");
        e.preventDefault();
        this.handleSendMessage();
      });
    } else {
      console.log("❌ Message form not found in DOM");
    }
  }

  private updateMessages() {
    const messages = messageController.getMessages();
    this.setProps({ messages });

    // Прокручиваем к последнему сообщению
    setTimeout(() => {
      const messageList = this.element?.querySelector(`.${styles.messageList}`);
      if (messageList) {
        messageList.scrollTop = messageList.scrollHeight;
      }
    }, 100);
  }

  private getCurrentUserId(): number {
    // Получаем ID текущего пользователя из store
    const state = store.getState();

    if (state.user && state.user.id) {
      return state.user.id;
    }

    // Fallback на localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      return user.id;
    }

    return 0; // Fallback значение
  }

  private formatTime(timeString: string): string {
    const date = new Date(timeString);
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  override render() {
    const { chats = [], selectedChatId, messages = [] } = this.props;

    // Находим выбранный чат
    const selectedChat = chats.find((chat) => chat.id === selectedChatId);

    return `
      <div class="{{styles.wrapper}}">
        <div class="{{styles.chatList}}">
          <div class="{{styles.header}}">
            <img src="/images/logoURUS.svg" alt="Логотип" class="{{styles.logo}}" />
            <span class="{{styles.title}}">
              Профиль
              <img
                src="/images/chevron-right.svg"
                alt="Chevron"
                class="{{styles.chevronIcon}}"
              >
            </span>
          </div>
          <div class="{{styles.searchContainer}}">
            {{{searchInput}}}
          </div>
          <div class="{{styles.createChatContainer}}">
            {{{createChatButton}}}
          </div>
          <ul class="{{styles.chatItems}}">
            ${
              chats.length > 0
                ? chats
                    .map(
                      (chat) => `
              <li class="{{styles.chatItem}} ${
                selectedChatId === chat.id ? "{{styles.isActive}}" : ""
              }" data-chat-id="${chat.id}">
                <div class="{{styles.avatar}}">
                  ${
                    chat.avatar
                      ? `<img src="https://ya-praktikum.tech/api/v2/resources${chat.avatar}"
                         alt="Аватар чата" />`
                      : ""
                  }
                </div>
                <div class="{{styles.chatInfo}}">
                  <div class="{{styles.name}}">${chat.title}</div>
                  <div class="{{styles.message}}">
                    ${chat.last_message ? chat.last_message.content : "Нет сообщений"}
                  </div>
                </div>
                <div class="{{styles.timeBlock}}">
                  <div class="{{styles.time}}">
                    ${chat.last_message ? this.formatTime(chat.last_message.time) : ""}
                  </div>
                  ${
                    chat.unread_count > 0
                      ? `<div class="{{styles.unread}}">${chat.unread_count}</div>`
                      : ""
                  }
                </div>
              </li>
            `
                    )
                    .join("")
                : '<li class="{{styles.noChats}}">Нет чатов. Создайте новый чат!</li>'
            }
          </ul>
        </div>
        <div class="{{styles.chat}}">
          ${
            selectedChatId
              ? `
            <div class="{{styles.chatHeader}}">
              <h3>${selectedChat?.title || `Чат ${selectedChatId}`}</h3>
            </div>
            <ul class="{{styles.messageList}}">
              ${
                messages.length > 0
                  ? messages
                      .map(
                        (message) => `
                <li class="{{styles.messageItem}} ${
                  message.user_id === this.getCurrentUserId() ? "{{styles.isOwn}}" : ""
                }">
                  <div class="{{styles.messageText}}">${message.content}</div>
                  <div class="{{styles.messageTime}}">${this.formatTime(message.time)}</div>
                </li>
              `
                      )
                      .join("")
                  : '<li class="{{styles.noMessages}}">Сообщения будут отображаться здесь</li>'
              }
            </ul>
            <form novalidate class="{{styles.messageForm}}">
              <div class="{{styles.messageInputContainer}}">
                <img src="/images/attach.svg" alt="Attachment-icon" class="{{styles.logo}}" />
                {{{messageInput}}}
                {{{roundButton}}}
              </div>
            </form>
          `
              : `
            <div class="{{styles.noChatSelected}}">
              <p>Выберите чат для начала общения</p>
            </div>
          `
          }
        </div>
      </div>
      {{{createChatModal}}}
    `;
  }
}

// HOC для подключения к store
const mapStateToProps = (state: any) => ({
  chats: (state.chats || []) as Chat[],
  messages: (state.messages || []) as Message[],
});

export const ConnectedChatList = connect(mapStateToProps)(ChatList);
