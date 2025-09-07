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
  addUserButton?: Button;
  addUserModal?: Modal;
  removeUserButton?: Button;
  removeUserModal?: Modal;
  chatMenuButton?: Button;
  chatMenuDropdown?: HTMLElement;
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
        type: "submit",
        onClick: (e: Event) => {
          e.preventDefault();
          this.handleSendMessage();
        },
      }),
      createChatButton: new Button({
        label: "Создать чат",
        className: styles.createChatButton,
        events: {
          click: (e: Event) => {
            e.preventDefault();
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
      chatMenuButton: new Button({
        label: "⋮",
        className: styles.chatMenuButton,
        id: "chat-menu-button",
        events: {
          click: (e: Event) => {
            e.preventDefault();
            this.toggleChatMenu();
          },
        },
      }),
      addUserModal: new Modal({
        title: "Добавить пользователя в чат",
        inputLabel: "Логин пользователя",
        inputPlaceholder: "Введите логин пользователя",
        submitButtonLabel: "Добавить",
        onSubmit: (login: string) => this.handleAddUser(login),
      }),
      removeUserModal: new Modal({
        title: "Удалить пользователя из чата",
        inputLabel: "Логин пользователя",
        inputPlaceholder: "Введите логин пользователя",
        submitButtonLabel: "Удалить",
        onSubmit: (login: string) => this.handleRemoveUser(login),
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
        createButton.addEventListener("click", (e) => {
          e.preventDefault();
          this.openCreateChatModal();
        });
      }
    }, 100);
  }

  // Метод для HOC - пересоздаем кнопку при обновлении store
  public updateFields() {
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
    (this.children.createChatModal as Modal)?.open();
  }

  private openAddUserModal() {
    if (!this.props.selectedChatId) {
      return;
    }
    (this.children.addUserModal as Modal)?.open();
  }

  private openRemoveUserModal() {
    if (!this.props.selectedChatId) {
      return;
    }
    (this.children.removeUserModal as Modal)?.open();
  }

  private toggleChatMenu() {
    const dropdown = this.element?.querySelector(`.${styles.chatMenuDropdown}`) as HTMLElement;
    if (dropdown) {
      const isVisible = dropdown.style.display === "block";
      dropdown.style.display = isVisible ? "none" : "block";
      dropdown.style.visibility = isVisible ? "hidden" : "visible";
    }
  }

  private closeChatMenu() {
    const dropdown = this.element?.querySelector(`.${styles.chatMenuDropdown}`) as HTMLElement;
    if (dropdown) {
      dropdown.style.display = "none";
    }
  }

  private async handleCreateChat(title: string) {
    try {
      await ChatController.createChat(title);
    } catch (error) {
      console.error("Ошибка создания чата:", error);
    }
  }

  private async handleAddUser(login: string) {
    if (!this.props.selectedChatId) {
      return;
    }
    try {
      await ChatController.addUsersToChat(this.props.selectedChatId, [login]);
    } catch (error) {
      console.error("Ошибка добавления пользователя:", error);
    }
  }

  private async handleRemoveUser(login: string) {
    if (!this.props.selectedChatId) {
      return;
    }
    try {
      await ChatController.removeUserFromChatByLogin(this.props.selectedChatId, login);
    } catch (error) {
      console.error("Ошибка удаления пользователя:", error);
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
    // Обновляем store
    store.set("selectedChatId", chatId);
    store.set(`messagesByChat.${chatId}`, []);

    // Даем время на обновление UI
    setTimeout(async () => {
      // Отключаемся от предыдущего чата
      messageController.disconnectFromChat();

      // Подключаемся к чату через WebSocket
      try {
        await messageController.connectToChat(chatId);
        // Обновляем сообщения
        this.updateMessages();

        // Привязываем события к кнопке отправки после рендера чата
        setTimeout(() => {
          this.attachMessageEvents();
          this.attachChatMenuEvents();
        }, 100);
      } catch (error) {
        console.error("Ошибка подключения к чату:", error);
      }
    }, 50);
  }

  private handleSendMessage() {
    // Ищем поле ввода
    const inputElement = this.element?.querySelector('input[name="message"]') as HTMLInputElement;
    const message = inputElement?.value?.trim();

    if (message && this.props.selectedChatId) {
      // Отправляем сообщение через WebSocket
      messageController.sendMessage(message);
      inputElement.value = "";
    }
  }

  private attachMessageEvents() {
    // Ищем все кнопки в форме
    const buttons = this.element?.querySelectorAll("button");

    buttons?.forEach((button, index) => {
      // Ищем кнопку отправки по тексту, типу или позиции в форме
      if (
        button.textContent?.trim() === "→" ||
        button.getAttribute("type") === "submit" ||
        (index === 1 && button.closest("form")) // Вторая кнопка в форме
      ) {
        button.addEventListener("click", (e) => {
          e.preventDefault();
          this.handleSendMessage();
        });
      }
    });

    // Форма отправки сообщений
    const messageForm = this.element?.querySelector("form");
    if (messageForm) {
      messageForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSendMessage();
      });
    }
  }

  private attachChatMenuEvents() {
    // Ищем кнопку меню чата по ID
    const chatMenuButton = this.element?.querySelector("#chat-menu-button");
    if (chatMenuButton) {
      chatMenuButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleChatMenu();
      });
    }

    // Делегирование событий на уровне документа для динамически созданных элементов
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;

      // Проверяем, что клик произошел внутри нашего компонента
      if (!this.element?.contains(target)) {
        return;
      }

      if (target.id === "add-user-button" || target.closest("#add-user-button")) {
        e.preventDefault();
        e.stopPropagation();
        this.closeChatMenu();
        this.openAddUserModal();
      } else if (target.id === "remove-user-button" || target.closest("#remove-user-button")) {
        e.preventDefault();
        e.stopPropagation();
        this.closeChatMenu();
        this.openRemoveUserModal();
      }
    });

    // Закрываем меню при клике вне его
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest(`.${styles.chatMenuDropdown}`) && !target.closest("#chat-menu-button")) {
        this.closeChatMenu();
      }
    });
  }

  private updateMessages() {
    // Сообщения обновляются через store и HOC, нам не нужно вызывать setProps
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
        <div class="{{styles.chatContainer}}">
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
              <div class="{{styles.chatTitle}}">${
                selectedChat?.title || `Чат ${selectedChatId}`
              }</div>
              <div class="{{styles.chatMenu}}">
                {{{chatMenuButton}}}
                <div class="{{styles.chatMenuDropdown}}" style="display: none;">
                  <div class="{{styles.addUserMenuItem}}" id="add-user-button">
                    <div class="{{styles.addUserIcon}}">+</div>
                    <span>Добавить пользователя</span>
                  </div>
                  <div class="{{styles.removeUserMenuItem}}" id="remove-user-button">
                    <div class="{{styles.removeUserIcon}}">×</div>
                    <span>Удалить пользователя</span>
                  </div>
                </div>
              </div>
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
      </div>
      {{{createChatModal}}}
      {{{addUserModal}}}
      {{{removeUserModal}}}
    `;
  }
}

// HOC для подключения к store
const mapStateToProps = (state: {
  selectedChatId?: number;
  chats: Chat[];
  messagesByChat: Record<number, Message[]>;
}) => {
  const id = state.selectedChatId;

  return {
    chats: state.chats,
    selectedChatId: id,
    messages: id !== undefined ? (state.messagesByChat[id] ?? []) : [],
  };
};

export const ConnectedChatList = connect(mapStateToProps)(ChatList);
