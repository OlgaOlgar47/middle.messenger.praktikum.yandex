import Handlebars from "handlebars";
import rawTemplate from "./FooterNav.hbs?raw";
import styles from "./FooterNav.module.sass";

const template = Handlebars.compile(rawTemplate);

export function renderFooterNav() {
  return template({
    styles,
    links: [
      { href: "#/login", label: "Вход" },
      { href: "#/register", label: "Регистрация" },
      { href: "#/chats", label: "Список чатов" },
      { href: "#/profile", label: "Профиль" },
      { href: "#/404", label: "404" },
      { href: "#/500", label: "Ошибка 5**" },
    ],
  });
}
