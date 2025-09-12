import Block from "@/framework/Block";
import { Input } from "@/components/Input";
import { RoundButton } from "@/components/RoundButton";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import type { BaseProps, Chat, Message } from "@/types";
import { ChatController } from "@/controllers/ChatController";
import { messageController } from "@/controllers/MessageController";
import { connect } from "@/store/connect";
import store, { type State } from "@/store/Store";

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
  isLoadingMessages?: boolean;
}

export class ChatList extends Block<ChatListProps> {
  constructor(props: ChatListProps = {}) {
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
        required: false,
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
        buttonType: "add",
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
        buttonType: "add",
        onSubmit: (login: string) => this.handleAddUser(login),
      }),
      removeUserModal: new Modal({
        title: "Удалить пользователя из чата",
        inputLabel: "Логин пользователя",
        inputPlaceholder: "Введите логин пользователя",
        submitButtonLabel: "Удалить",
        buttonType: "remove",
        onSubmit: (login: string) => this.handleRemoveUser(login),
      }),
      events: {
        click: (e: Event) => this.handleClick(e),
      },
    });
  }

  protected init(): void {
    this.loadChats();

    setTimeout(() => {
      const createButton = this.element?.querySelector("button");
      if (createButton) {
        createButton.addEventListener("click", (e) => {
          e.preventDefault();
          this.openCreateChatModal();
        });
      }
    }, 100);
  }

  public updateFields() {}

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

  private handleClick(event: Event) {
    const target = event.target as HTMLElement;

    // клик на профиль
    if (target.id === "profile-button" || target.closest("#profile-button")) {
      event.preventDefault();
      window.location.href = "/profile";
      return;
    }

    // клик на чат
    const chatItem = target.closest("[data-chat-id]");
    if (chatItem) {
      const chatId = parseInt(chatItem.getAttribute("data-chat-id") || "0", 10);
      this.selectChat(chatId);
    }
  }

  private async selectChat(chatId: number) {
    messageController.disconnectFromChat();

    store.set("isLoadingMessages", true);

    store.set("selectedChatId", chatId);
    store.set(`messagesByChat.${chatId}`, []);

    (this.props as any).messages = [];
    (this.props as any).selectedChatId = chatId;
    (this.props as any).isLoadingMessages = true;

    (this as any)._render();

    setTimeout(async () => {
      try {
        await messageController.connectToChat(chatId);

        this.updateMessages();

        setTimeout(() => {
          this.attachMessageEvents();
          this.attachChatMenuEvents();
          this.updateMessages();
        }, 50);
      } catch (error) {
        console.error("Ошибка подключения к чату:", error);
        store.set("isLoadingMessages", false);
        (this.props as any).isLoadingMessages = false;
      }
    }, 20);
  }

  private handleSendMessage() {
    const inputElement = this.element?.querySelector('input[name="message"]') as HTMLInputElement;
    const message = inputElement?.value?.trim();

    if (message && this.props.selectedChatId) {
      messageController.sendMessage(message);
      inputElement.value = "";
    }
  }

  private attachMessageEvents() {
    const buttons = this.element?.querySelectorAll("button");

    buttons?.forEach((button, index) => {
      if (
        button.textContent?.trim() === "→" ||
        button.getAttribute("type") === "submit" ||
        (index === 1 && button.closest("form"))
      ) {
        button.addEventListener("click", (e) => {
          e.preventDefault();
          this.handleSendMessage();
        });
      }
    });

    const messageForm = this.element?.querySelector("form");
    if (messageForm) {
      messageForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSendMessage();
      });
    }
  }

  private attachChatMenuEvents() {
    const chatMenuButton = this.element?.querySelector("#chat-menu-button");
    if (chatMenuButton) {
      chatMenuButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleChatMenu();
      });
    }

    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;

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

    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest(`.${styles.chatMenuDropdown}`) && !target.closest("#chat-menu-button")) {
        this.closeChatMenu();
      }
    });
  }

  private updateMessages() {
    setTimeout(() => {
      const messageList = this.element?.querySelector(`.${styles.messageList}`);
      if (messageList) {
        messageList.scrollTop = messageList.scrollHeight;
      }
    }, 100);
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

    return 0;
  }

  private formatTime(timeString: string): string {
    const date = new Date(timeString);
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  private renderMessages(messages: Message[]): string {
    if (messages.length === 0) {
      return '<li class="{{styles.noMessages}}">Сообщения будут отображаться здесь</li>';
    }

    return messages
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
      .join("");
  }

  override render() {
    const { chats = [], selectedChatId, isLoadingMessages = false } = this.props;

    const messages =
      selectedChatId !== undefined ? store.getState().messagesByChat[selectedChatId] || [] : [];

    const selectedChat = chats.find((chat) => chat.id === selectedChatId);

    return `
      <div class="{{styles.wrapper}}">
        <div class="{{styles.chatContainer}}">
        <div class="{{styles.chatList}}">
          <div class="{{styles.header}}">
            <img src="/images/logoURUS.svg" alt="Логотип" class="{{styles.logo}}" />
            <span class="{{styles.title}}" id="profile-button">
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
                isLoadingMessages
                  ? '<li class="{{styles.loader}}"> Загрузка...</li>'
                  : this.renderMessages(messages)
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

const mapStateToProps = (state: State): Partial<ChatListProps> => {
  const id = state.selectedChatId;

  if (id === undefined) {
    return {
      chats: state.chats,
      selectedChatId: undefined,
      messages: [],
      isLoadingMessages: false,
    };
  }

  const messages = state.messagesByChat[id] || [];

  return {
    chats: state.chats,
    selectedChatId: id,
    messages,
    isLoadingMessages: state.isLoadingMessages,
  };
};

export const ConnectedChatList = connect(mapStateToProps)(ChatList);
