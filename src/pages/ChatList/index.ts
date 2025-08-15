import Block from "@/framework/Block";
import { Input } from "@/components/Input";
import { RoundButton } from "@/components/RoundButton";
import styles from "./ChatList.module.sass";

export class ChatList extends Block {
  constructor(props: any = {}) {
    super("div", {
      ...props,
      styles,
      chats: [
        // Массив чатов как в твоём примере
        {
          name: "Андрей",
          lastMessage: "Привет, как дела?",
          time: "10:40",
          unread: "2",
          isActive: true,
        },
        {
          name: "Василий",
          lastMessage: "Позвони мне позже",
          time: "12:00",
          unread: "",
          isActive: false,
        },
        {
          name: "Клим",
          lastMessage: "Добавил тебя в список...",
          time: "15:32",
          unread: "1",
          isActive: false,
        },
        {
          name: "Вадим",
          lastMessage: "Выберите чат для отображения сообщения",
          time: "09:15",
          unread: "",
          isActive: false,
        },
        {
          name: "Тет-а-тет",
          lastMessage: "Human Interface Guidelines и...",
          time: "14:30",
          unread: "",
          isActive: false,
        },
        {
          name: "L.3",
          lastMessage: "Поздравляю с новым проектом...",
          time: "13:45",
          unread: "",
          isActive: false,
        },
        {
          name: "Design Destroyer",
          lastMessage: "Привет, давай обсудим...",
          time: "11:20",
          unread: "",
          isActive: false,
        },
        {
          name: "Day",
          lastMessage: "Спасибо за помощь...",
          time: "08:50",
          unread: "",
          isActive: false,
        },
      ],
      searchInput: new Input({
        type: "text",
        name: "query",
        placeholder: "Поиск",
        required: true,
        className: styles.searchInputWithIcon,
      }),
      messageInput: new Input({
        type: "text",
        name: "message",
        placeholder: "Введите сообщение",
        required: true,
        className: styles.messageInput,
      }),
      roundButton: new RoundButton({ icon: "arrow-right" }),
    });
  }

  override render() {
    return `
      <div class="{{styles.wrapper}}">
        <div class="{{styles.chatList}}">
          <div class="{{styles.header}}">
            <img src="/images/logoURUS.svg" alt="Логотип" class="{{styles.logo}}" />
            <span class="{{styles.title}}">Профиль <img src="/images/chevron-right.svg" alt="Chevron" class="{{styles.chevronIcon}}"></span>
          </div> 
          <div class="{{styles.searchContainer}}">
            {{{searchInput}}}
          </div>
          <ul class="{{styles.chatItems}}">
            {{#each chats}}
              <li class="{{../styles.chatItem}} {{#if isActive}}{{../styles.isActive}}{{/if}}">
                <div class="{{../styles.avatar}}"></div>
                <div class="{{../styles.chatInfo}}">
                  <div class="{{../styles.name}}">{{name}}</div>
                  <div class="{{../styles.message}}">{{lastMessage}}</div>
                </div>
                <div class="{{../styles.timeBlock}}">
                  <div class="{{../styles.time}}">{{time}}</div>
                  {{#if unread}}
                    <div class="{{../styles.unread}}">{{unread}}</div>
                  {{/if}}
                </div>
              </li>
            {{/each}}
          </ul>
        </div>
        <div class="{{styles.chat}}">
          <div class="{{styles.placeholder}}"></div>
          <div class="{{styles.messageInputContainer}}">
            <img src="/images/attach.svg" alt="Attachment-icon" class="{{styles.logo}}" />
            {{{messageInput}}}
            {{{roundButton}}}
          </div>
        </div>
      </div>
    `;
  }
}
