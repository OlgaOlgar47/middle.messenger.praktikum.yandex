import Handlebars from 'handlebars';
import rawTemplate from './ChatList.hbs?raw';
import styles from './ChatList.module.sass';

export function renderChatsListPage() {
  console.log('styles: ', styles);
  const template = Handlebars.compile(rawTemplate);
  return template({
    styles,
    chats: [
      {
        name: 'Андрей',
        lastMessage: 'Привет, как дела?',
        time: '10:40',
        unread: '2',
        isActive: true,
      },
      {
        name: 'Василий',
        lastMessage: 'Позвони мне позже',
        time: '12:00',
        unread: '',
        isActive: false,
      },
      {
        name: 'Клим',
        lastMessage: 'Добавил тебя в список...',
        time: '15:32',
        unread: '1',
        isActive: false,
      },
      {
        name: 'Вадим',
        lastMessage: 'Выберите чат для отображения сообщения',
        time: '09:15',
        unread: '',
        isActive: false,
      },
      {
        name: 'Тет-а-тет',
        lastMessage: 'Human Interface Guidelines и...',
        time: '14:30',
        unread: '',
        isActive: false,
      },
      {
        name: 'L.3',
        lastMessage: 'Поздравляю с новым проектом...',
        time: '13:45',
        unread: '',
        isActive: false,
      },
      {
        name: 'Design Destroyer',
        lastMessage: 'Привет, давай обсудим...',
        time: '11:20',
        unread: '',
        isActive: false,
      },
      {
        name: 'Day',
        lastMessage: 'Спасибо за помощь...',
        time: '08:50',
        unread: '',
        isActive: false,
      },
    ],
  });
}

