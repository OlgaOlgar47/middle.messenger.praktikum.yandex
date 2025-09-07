import Block from "@/framework/Block";
import { Input } from "@/components/Input";
import { RoundButton } from "@/components/RoundButton";
import { Button } from "@/components/Button";
import type { BaseProps, Chat } from "@/types";
import { ChatController } from "@/controllers/ChatController";
import { connect } from "@/store/connect";

import styles from "./ChatList.module.sass";

interface Message {
  text: string;
  time: string;
  isOwn: boolean;
}

interface ChatListProps extends BaseProps {
  chats?: Chat[];
  messages?: Message[];
  searchInput?: Input;
  messageInput?: Input;
  roundButton?: RoundButton;
  createChatButton?: Button;
  selectedChatId?: number;
}

export class ChatList extends Block<ChatListProps> {
  constructor(props: ChatListProps) {
    console.log("🏗️ ChatList constructor called");
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
            this.handleCreateChat();
          },
        },
      }),
      events: {
        click: (e: Event) => this.handleChatClick(e),
      },
    });
  }

  protected init(): void {
    // Загружаем чаты при инициализации
    this.loadChats();
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

  private async handleCreateChat() {
    console.log("🔄 handleCreateChat вызван");
    // eslint-disable-next-line no-alert
    const title = window.prompt("Введите название чата:");
    console.log("📝 Введенное название:", title);
    if (title && title.trim()) {
      try {
        console.log("🚀 Создаем чат с названием:", title.trim());
        await ChatController.createChat(title.trim());
        console.log("✅ Чат создан успешно");
      } catch (error) {
        console.error("❌ Ошибка создания чата:", error);
      }
    } else {
      console.log("❌ Название чата не введено или пустое");
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

  private selectChat(chatId: number) {
    this.setProps({ selectedChatId: chatId });
    // Здесь можно добавить логику для загрузки сообщений чата
  }

  private handleSendMessage() {
    const { messageInput } = this.props;
    if (messageInput) {
      const inputElement = messageInput.element?.querySelector("input") as HTMLInputElement;
      const message = inputElement?.value?.trim();

      if (message && this.props.selectedChatId) {
        // Здесь будет логика отправки сообщения
        console.log("Отправка сообщения:", message, "в чат:", this.props.selectedChatId);
        inputElement.value = "";
      }
    }
  }

  private formatTime(timeString: string): string {
    const date = new Date(timeString);
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  override render() {
    const { chats = [], selectedChatId } = this.props;
    console.log("🎨 ChatList render - createChatButton:", !!this.props.createChatButton);

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
              <h3>Чат ${selectedChatId}</h3>
            </div>
            <ul class="{{styles.messageList}}">
              <li class="{{styles.noMessages}}">Сообщения будут отображаться здесь</li>
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
    `;
  }
}

// HOC для подключения к store
const mapStateToProps = (state: any) => ({
  chats: (state.chats || []) as Chat[],
});

export const ConnectedChatList = connect(mapStateToProps)(ChatList);
