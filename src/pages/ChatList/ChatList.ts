import Block from "@/framework/Block";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import type { BaseProps, Chat, ChatUser, Message } from "@/types";
import { router } from "@/App";
import { ChatController } from "@/controllers/ChatController";
import { messageController } from "@/controllers/MessageController";
import { connect } from "@/store/connect";
import { resourceUrl } from "@/config/api";
import store, { type State } from "@/store/Store";
import { getLocale, onLocale, text } from "@/locale";

import styles from "./ChatList.module.sass";

interface ChatListProps extends BaseProps {
  chats?: Chat[];
  messages?: Message[];
  searchInput?: Input;
  messageInput?: Input;
  sendButton?: Button;
  createChatButton?: Button;
  createChatModal?: Modal;
  addUserButton?: Button;
  addUserModal?: Modal;
  removeUserButton?: Button;
  removeUserModal?: Modal;
  renameChatModal?: Modal;
  deleteChatModal?: Modal;
  chatMenuButton?: Button;
  chatMenuDropdown?: HTMLElement;
  selectedChatId?: number;
  isLoadingMessages?: boolean;
  searchQuery?: string;
  notice?: string;
  localeTick?: string;
  membersTick?: string;
  revealTick?: number;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\{/g, "&#123;")
    .replace(/\}/g, "&#125;");
}

function localeTag(): string {
  return getLocale() === "es" ? "es-UY" : "ru-RU";
}

function memberLabel(user: ChatUser): string {
  const named = [user.first_name, user.second_name].filter(Boolean).join(" ").trim();
  return user.display_name || named || user.login;
}

function avatarLetter(title: string): string {
  return Array.from(title.trim())[0] || "?";
}

function scriptOf(value: string): "ru" | "es" | "" {
  const cyrillic = value.match(/[А-Яа-яЁё]/g)?.length ?? 0;
  const latin = value.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g)?.length ?? 0;
  if (cyrillic === 0 && latin === 0) {
    return "";
  }
  return cyrillic > latin ? "ru" : "es";
}

function messageView(content: string, translation?: string): { shown: string; original: string } {
  const original = content || "";
  const translated = (translation || "").trim();
  const locale = getLocale();
  const originalScript = scriptOf(original);
  const keepOriginal =
    !translated || translated === original || originalScript === locale || originalScript === "";
  if (keepOriginal) {
    return { shown: original, original };
  }
  return { shown: translated, original };
}

export class ChatList extends Block<ChatListProps> {
  private documentClickHandlers: Array<{ element: EventTarget; handler: (e: Event) => void }> = [];

  private query = "";

  private notice = "";

  private members: ChatUser[] = [];

  private membersLoadedFor: number | undefined;

  private revealedIds = new Set<number>();

  constructor(props: ChatListProps = {}) {
    const copy = text();
    super("div", {
      ...props,
      styles,
      chats: [],
      messages: [],
      selectedChatId: undefined,
      searchInput: new Input({
        type: "text",
        name: "query",
        placeholder: copy.search,
        className: styles.searchInputWithIcon,
        required: false,
      }),
      messageInput: new Input({
        type: "text",
        name: "message",
        placeholder: copy.messagePlaceholder,
        className: styles.messageInput,
      }),
      sendButton: new Button({
        label: copy.send,
        type: "submit",
        className: styles.sendButton,
        onClick: (event: Event) => {
          event.preventDefault();
          this.handleSendMessage();
        },
      }),
      createChatButton: new Button({
        label: copy.createChat,
        className: styles.createChatButton,
        onClick: (event: Event) => {
          event.preventDefault();
          this.openCreateChatModal();
        },
      }),
      createChatModal: new Modal({
        title: copy.createChatTitle,
        inputLabel: copy.chatName,
        inputPlaceholder: copy.chatNamePlaceholder,
        submitButtonLabel: copy.create,
        buttonType: "add",
        onSubmit: (title: string) => this.handleCreateChat(title),
      }),
      chatMenuButton: new Button({
        label: "⋮",
        className: styles.chatMenuButton,
        id: "chat-menu-button",
        ariaLabel: copy.chatMenu,
        onClick: (event: Event) => {
          event.preventDefault();
          event.stopPropagation();
          this.toggleChatMenu();
        },
      }),
      addUserModal: new Modal({
        title: copy.addUserTitle,
        inputLabel: copy.userLogin,
        inputPlaceholder: copy.userLoginPlaceholder,
        submitButtonLabel: copy.add,
        buttonType: "add",
        onSubmit: (login: string) => this.handleAddUser(login),
      }),
      removeUserModal: new Modal({
        title: copy.removeUserTitle,
        inputLabel: copy.userLogin,
        inputPlaceholder: copy.userLoginPlaceholder,
        submitButtonLabel: copy.remove,
        buttonType: "remove",
        onSubmit: (login: string) => this.handleRemoveUser(login),
      }),
      renameChatModal: new Modal({
        title: copy.renameChatTitle,
        inputLabel: copy.chatName,
        inputPlaceholder: copy.chatNamePlaceholder,
        submitButtonLabel: copy.save,
        buttonType: "add",
        onSubmit: (title: string) => this.handleRenameChat(title),
      }),
      deleteChatModal: new Modal({
        title: copy.deleteChatTitle,
        message: copy.deleteChatMessage,
        confirm: true,
        submitButtonLabel: copy.deleteChat,
        buttonType: "remove",
        onSubmit: () => this.handleDeleteChat(),
      }),
      events: {
        click: (event: Event) => this.handleClick(event),
        input: (event: Event) => this.handleSearch(event),
      },
    });
    onLocale(() => this.applyLocale());
    this.bindMenuListeners();
  }

  protected init(): void {
    this.loadChats();
  }

  public updateFields() {}

  public destroy() {
    this.detachDocumentEvents();
  }

  private applyLocale(): void {
    const copy = text();
    const search = this.children.searchInput as Input;
    const message = this.children.messageInput as Input;
    search.setProps({ placeholder: copy.search, value: this.fieldValue(search) });
    message.setProps({
      placeholder: copy.messagePlaceholder,
      value: this.fieldValue(message),
    });
    (this.children.createChatButton as Button).setProps({ label: copy.createChat });
    (this.children.sendButton as Button).setProps({ label: copy.send });
    (this.children.chatMenuButton as Button).setProps({ ariaLabel: copy.chatMenu });
    this.applyModal(this.children.createChatModal as Modal, {
      title: copy.createChatTitle,
      inputLabel: copy.chatName,
      inputPlaceholder: copy.chatNamePlaceholder,
      submitButtonLabel: copy.create,
    });
    this.applyModal(this.children.addUserModal as Modal, {
      title: copy.addUserTitle,
      inputLabel: copy.userLogin,
      inputPlaceholder: copy.userLoginPlaceholder,
      submitButtonLabel: copy.add,
    });
    this.applyModal(this.children.removeUserModal as Modal, {
      title: copy.removeUserTitle,
      inputLabel: copy.userLogin,
      inputPlaceholder: copy.userLoginPlaceholder,
      submitButtonLabel: copy.remove,
    });
    this.applyModal(this.children.renameChatModal as Modal, {
      title: copy.renameChatTitle,
      inputLabel: copy.chatName,
      inputPlaceholder: copy.chatNamePlaceholder,
      submitButtonLabel: copy.save,
    });
    const deleteModal = this.children.deleteChatModal as Modal;
    this.applyModal(deleteModal, {
      title: copy.deleteChatTitle,
      inputLabel: copy.chatName,
      inputPlaceholder: copy.chatNamePlaceholder,
      submitButtonLabel: copy.deleteChat,
    });
    deleteModal.setProps({ message: copy.deleteChatMessage });
    this.setProps({ localeTick: copy.language });
  }

  private applyModal(
    modal: Modal,
    copy: {
      title: string;
      inputLabel: string;
      inputPlaceholder: string;
      submitButtonLabel: string;
    }
  ): void {
    modal.setCopy(copy);
  }

  private fieldValue(input: Input): string {
    const field = input.element?.querySelector("input");
    return field?.value ?? "";
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

  private openRenameModal() {
    if (!this.props.selectedChatId) {
      return;
    }
    const selected = (this.props.chats || []).find((chat) => chat.id === this.props.selectedChatId);
    (this.children.renameChatModal as Modal)?.open(selected?.title || "");
  }

  private openDeleteModal() {
    if (!this.props.selectedChatId) {
      return;
    }
    (this.children.deleteChatModal as Modal)?.open();
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

  private hasMember(login: string): boolean {
    return this.members.some((user) => user.login === login);
  }

  private showNotice(message: string): void {
    this.notice = message;
    this.setProps({ notice: message });
  }

  private async loadMembers(chatId: number): Promise<void> {
    try {
      const users = await ChatController.getChatUsers(chatId);
      if (this.props.selectedChatId !== chatId) {
        return;
      }
      this.members = users;
      this.membersLoadedFor = chatId;
      this.setProps({
        membersTick: `${chatId}:${users.map((user) => user.id).join(",")}`,
      });
    } catch (error) {
      if (this.props.selectedChatId === chatId) {
        this.members = [];
        this.membersLoadedFor = undefined;
      }
      console.error("Ошибка загрузки участников:", error);
    }
  }

  private async handleAddUser(login: string) {
    const { selectedChatId } = this.props;
    if (!selectedChatId) {
      return;
    }
    if (this.membersLoadedFor === selectedChatId && this.hasMember(login)) {
      this.showNotice(text().alreadyInChat);
      return;
    }
    try {
      await ChatController.addUsersToChat(selectedChatId, [login]);
      this.showNotice(text().userAdded);
      await this.loadMembers(selectedChatId);
    } catch (error) {
      console.error("Ошибка добавления пользователя:", error);
    }
  }

  private async handleRenameChat(title: string) {
    const { selectedChatId } = this.props;
    if (!selectedChatId) {
      return;
    }
    try {
      await ChatController.renameChat(selectedChatId, title);
    } catch (error) {
      console.error("Ошибка изменения названия:", error);
    }
  }

  private async handleDeleteChat() {
    const { selectedChatId } = this.props;
    if (!selectedChatId) {
      return;
    }
    try {
      await ChatController.deleteChat(selectedChatId);
      this.closeChat();
    } catch (error) {
      console.error("Ошибка удаления чата:", error);
    }
  }

  private async handleRemoveUser(login: string) {
    const { selectedChatId } = this.props;
    if (!selectedChatId) {
      return;
    }
    if (this.membersLoadedFor === selectedChatId && !this.hasMember(login)) {
      this.showNotice(text().notInChat);
      return;
    }
    try {
      await ChatController.removeUserFromChatByLogin(selectedChatId, login);
      this.showNotice(text().userRemoved);
      await this.loadMembers(selectedChatId);
    } catch (error) {
      console.error("Ошибка удаления пользователя:", error);
    }
  }

  private handleSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target?.name !== "query") {
      return;
    }
    this.query = target.value;
    this.setProps({ searchQuery: this.query });
  }

  private handleClick(event: Event) {
    const target = event.target as HTMLElement;

    const bubble = target.closest("[data-message-id]");
    if (bubble) {
      const id = Number(bubble.getAttribute("data-message-id"));
      if (this.revealedIds.has(id)) {
        this.revealedIds.delete(id);
      } else {
        this.revealedIds.add(id);
      }
      this.setProps({ revealTick: Date.now() });
      return;
    }

    if (target.id === "profile-button" || target.closest("#profile-button")) {
      event.preventDefault();
      router.go("/profile");
      return;
    }

    if (target.id === "back-to-chats" || target.closest("#back-to-chats")) {
      event.preventDefault();
      this.closeChat();
      return;
    }

    const chatItem = target.closest("[data-chat-id]");
    if (chatItem) {
      const chatId = parseInt(chatItem.getAttribute("data-chat-id") || "0", 10);
      this.selectChat(chatId);
    }
  }

  private closeChat() {
    messageController.disconnectFromChat();
    this.notice = "";
    this.members = [];
    this.membersLoadedFor = undefined;
    this.revealedIds.clear();
    this.closeChatMenu();
    store.set("selectedChatId", undefined);
    this.setProps({
      messages: [],
      selectedChatId: undefined,
      isLoadingMessages: false,
      notice: "",
    });
  }

  private async selectChat(chatId: number) {
    messageController.disconnectFromChat();
    this.notice = "";
    this.members = [];
    this.membersLoadedFor = undefined;
    this.revealedIds.clear();
    this.closeChatMenu();

    store.set("isLoadingMessages", true);
    store.set("selectedChatId", chatId);
    store.set(`messagesByChat.${chatId}`, []);

    this.setProps({
      messages: [],
      selectedChatId: chatId,
      isLoadingMessages: true,
      notice: "",
    });

    this.loadMembers(chatId);

    const messageList = this.element?.querySelector(`.${styles.messageList}`);
    if (messageList) {
      messageList.innerHTML = `<li class="${styles.loader}">${escapeHtml(text().loading)}</li>`;
    }

    setTimeout(async () => {
      try {
        await messageController.connectToChat(chatId);
        this.updateMessages();
      } catch (error) {
        console.error("Ошибка подключения к чату:", error);
        store.set("isLoadingMessages", false);
        this.setProps({ isLoadingMessages: false });
      }
    }, 20);
  }

  private handleSendMessage() {
    const inputElement = this.element?.querySelector('input[name="message"]') as HTMLInputElement;
    const message = inputElement?.value?.trim();

    if (message && this.props.selectedChatId) {
      messageController.sendMessage(message);
      inputElement.value = "";
      this.scrollToBottom();
    }
  }

  private bindMenuListeners(): void {
    const onMenu = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.id === "add-user-button" || target.closest("#add-user-button")) {
        event.preventDefault();
        this.closeChatMenu();
        this.openAddUserModal();
      } else if (target.id === "remove-user-button" || target.closest("#remove-user-button")) {
        event.preventDefault();
        this.closeChatMenu();
        this.openRemoveUserModal();
      } else if (target.id === "rename-chat-button" || target.closest("#rename-chat-button")) {
        event.preventDefault();
        this.closeChatMenu();
        this.openRenameModal();
      } else if (target.id === "delete-chat-button" || target.closest("#delete-chat-button")) {
        event.preventDefault();
        this.closeChatMenu();
        this.openDeleteModal();
      }
    };

    const onOutside = (event: Event) => {
      const target = event.target as HTMLElement;
      const inMenu = target.closest(`.${styles.chatMenuDropdown}`);
      const onButton = target.closest("#chat-menu-button");
      if (!inMenu && !onButton) {
        this.closeChatMenu();
      }
    };

    document.addEventListener("click", onMenu);
    document.addEventListener("click", onOutside);
    this.documentClickHandlers.push(
      { element: document, handler: onMenu },
      { element: document, handler: onOutside }
    );
  }

  private detachDocumentEvents() {
    this.documentClickHandlers.forEach(({ element, handler }) => {
      element.removeEventListener("click", handler);
    });
    this.documentClickHandlers = [];
  }

  private updateMessages() {
    setTimeout(() => {
      const messageList = this.element?.querySelector(`.${styles.messageList}`);
      if (messageList) {
        messageList.scrollTop = messageList.scrollHeight;
      }
    }, 100);
  }

  private scrollToBottom() {
    setTimeout(() => {
      const messageList = this.element?.querySelector(`.${styles.messageList}`);
      if (messageList) {
        messageList.scrollTop = messageList.scrollHeight;
      }
    }, 50);
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

  private formatClock(timeString: string): string {
    const date = new Date(timeString);
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    return date.toLocaleTimeString(localeTag(), {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  private formatListTime(timeString: string): string {
    const date = new Date(timeString);
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    if (date >= startOfToday) {
      return this.formatClock(timeString);
    }
    if (date >= startOfYesterday) {
      return text().yesterday;
    }
    return date.toLocaleDateString(localeTag(), {
      day: "2-digit",
      month: "2-digit",
    });
  }

  private visibleChats(chats: Chat[]): Chat[] {
    const query = this.query.trim().toLowerCase();
    if (!query) {
      return chats;
    }
    return chats.filter((chat) => chat.title.toLowerCase().includes(query));
  }

  private renderChatItems(chats: Chat[], selectedChatId?: number): string {
    const visible = this.visibleChats(chats);
    if (visible.length === 0) {
      const label = chats.length === 0 ? text().noChats : text().nothingFound;
      return `<li class="${styles.noChats}">${escapeHtml(label)}</li>`;
    }

    return visible
      .map((chat) => {
        const active = selectedChatId === chat.id ? styles.isActive : "";
        const preview = this.previewText(chat.last_message);
        const time = chat.last_message ? this.formatListTime(chat.last_message.time) : "";
        const badge = `<div class="${styles.unread}">${chat.unread_count}</div>`;
        const unread = chat.unread_count > 0 ? badge : "";
        const avatar = chat.avatar
          ? `<img src="${escapeHtml(resourceUrl(chat.avatar))}" alt="" />`
          : `<span>${escapeHtml(avatarLetter(chat.title))}</span>`;

        return `
          <li class="${styles.chatItem} ${active}" data-chat-id="${chat.id}">
            <div class="${styles.avatar}">${avatar}</div>
            <div class="${styles.chatInfo}">
              <div class="${styles.name}">${escapeHtml(chat.title)}</div>
              <div class="${styles.message}">${escapeHtml(preview)}</div>
            </div>
            <div class="${styles.timeBlock}">
              <div class="${styles.time}">${escapeHtml(time)}</div>
              ${unread}
            </div>
          </li>
        `;
      })
      .join("");
  }

  private renderMembers(): string {
    if (this.membersLoadedFor !== this.props.selectedChatId || this.members.length === 0) {
      return "";
    }
    const names = this.members.map((user) => escapeHtml(memberLabel(user))).join(", ");
    return `<p class="${styles.members}">${escapeHtml(text().members)}: ${names}</p>`;
  }

  private renderNotice(): string {
    if (!this.notice) {
      return "";
    }
    return `<p class="${styles.notice}">${escapeHtml(this.notice)}</p>`;
  }

  private renderMessages(messages: Message[]): string {
    if (messages.length === 0) {
      return `<li class="${styles.noMessages}">${escapeHtml(text().emptyThread)}</li>`;
    }

    const hintIndex = messages.findIndex((message) => {
      const view = messageView(message.content, message.translation);
      return view.shown !== view.original;
    });

    return messages
      .map((message, index) => {
        const own = message.user_id === this.getCurrentUserId() ? styles.isOwn : "";
        const view = messageView(message.content, message.translation);
        const canOpen = view.shown !== view.original;
        const open = canOpen && this.revealedIds.has(message.id);
        const openable = canOpen ? styles.isOpenable : "";
        const marker = canOpen ? ` data-message-id="${message.id}"` : "";
        const hint =
          index === hintIndex && !open
            ? `<div class="${styles.messageHint}">${escapeHtml(text().originalHint)}</div>`
            : "";
        const source = open
          ? `<div class="${styles.messageOriginal}">${escapeHtml(view.original)}</div>`
          : "";
        return `
          <li class="${styles.messageItem} ${own}"${marker}>
            <div class="${styles.bubble} ${openable}">
              <div class="${styles.messageText}">${escapeHtml(view.shown)}</div>
              ${source}
              ${hint}
              <div class="${styles.messageTime}">${escapeHtml(this.formatClock(message.time))}</div>
            </div>
          </li>
        `;
      })
      .join("");
  }

  private previewText(last: Chat["last_message"]): string {
    if (!last) return text().noMessages;
    return messageView(last.content, last.translation).shown;
  }

  private renderConversation(messages: Message[], isLoadingMessages: boolean): string {
    const copy = text();
    const selected = (this.props.chats || []).find((chat) => chat.id === this.props.selectedChatId);
    const title = selected?.title || "";
    const body =
      isLoadingMessages && messages.length === 0
        ? `<li class="${styles.loader}">${escapeHtml(copy.loading)}</li>`
        : this.renderMessages(messages);

    return `
      <div class="{{styles.chatHeader}}">
        <button
          type="button"
          class="{{styles.backChat}}"
          id="back-to-chats"
          aria-label="${escapeHtml(copy.back)}"
        >‹</button>
        <div class="{{styles.chatHeading}}">
          <div class="{{styles.chatTitle}}">${escapeHtml(title)}</div>
          ${this.renderMembers()}
        </div>
        <div class="{{styles.chatMenu}}">
          {{{chatMenuButton}}}
          <div class="{{styles.chatMenuDropdown}}" style="display: none;">
            <button type="button" class="{{styles.menuItem}}" id="add-user-button">
              ${escapeHtml(copy.addUser)}
            </button>
            <button type="button" class="{{styles.menuItem}}" id="remove-user-button">
              ${escapeHtml(copy.removeUser)}
            </button>
            <button type="button" class="{{styles.menuItem}}" id="rename-chat-button">
              ${escapeHtml(copy.renameChat)}
            </button>
            <button
              type="button"
              class="{{styles.menuItem}} {{styles.menuItemDanger}}"
              id="delete-chat-button"
            >
              ${escapeHtml(copy.deleteChat)}
            </button>
          </div>
        </div>
      </div>
      ${this.renderNotice()}
      <ul class="{{styles.messageList}}">
        ${body}
      </ul>
      <form novalidate class="{{styles.messageForm}}">
        <div class="{{styles.messageInputContainer}}">
          {{{messageInput}}}
          {{{sendButton}}}
        </div>
      </form>
    `;
  }

  override render() {
    const { chats = [], selectedChatId, isLoadingMessages = false } = this.props;
    const copy = text();
    const messages =
      selectedChatId !== undefined ? store.getState().messagesByChat[selectedChatId] || [] : [];

    if (messages.length > 0 && !isLoadingMessages) {
      setTimeout(() => this.scrollToBottom(), 0);
    }

    const conversation = selectedChatId
      ? this.renderConversation(messages, isLoadingMessages)
      : `
        <div class="{{styles.noChatSelected}}">
          <p>${escapeHtml(copy.pickChat)}</p>
        </div>
      `;

    return `
      <div class="{{styles.wrapper}}${selectedChatId ? " {{styles.chatOpen}}" : ""}">
        <div class="{{styles.chatContainer}}">
        <div class="{{styles.chatList}}">
          <div class="{{styles.header}}">
            <img src="/images/logoURUS.svg" alt="Логотип" class="{{styles.logo}}" />
            <span class="{{styles.title}}" id="profile-button">
              ${escapeHtml(copy.profile)}
              <img
                src="/images/chevron-right.svg"
                alt=""
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
            ${this.renderChatItems(chats, selectedChatId)}
          </ul>
        </div>
        <div class="{{styles.chat}}">
          ${conversation}
        </div>
        </div>
      </div>
      {{{createChatModal}}}
      {{{addUserModal}}}
      {{{removeUserModal}}}
      {{{renameChatModal}}}
      {{{deleteChatModal}}}
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
