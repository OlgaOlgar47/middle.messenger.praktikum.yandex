import Block from "@/framework/Block";
import type { BaseProps } from "@/types";
import { getLocale, onLocale, setLocale, text, type Locale } from "@/locale";

import styles from "./LanguageSwitch.module.sass";

interface LanguageSwitchProps extends BaseProps {
  locale?: Locale;
}

export class LanguageSwitch extends Block<LanguageSwitchProps> {
  constructor() {
    super("div", {
      styles,
      locale: getLocale(),
      events: {
        click: (event: Event) => {
          const { target } = event;
          if (!(target instanceof HTMLButtonElement)) {
            return;
          }
          const next = target.dataset.locale;
          if (next === "ru" || next === "es") {
            setLocale(next);
          }
        },
      },
    });
    onLocale(() => {
      this.setProps({ locale: getLocale() });
    });
  }

  private optionClass(locale: Locale): string {
    return getLocale() === locale ? `${styles.option} ${styles.active}` : styles.option;
  }

  override render(): string {
    return `
      <div class="${styles.group}" role="group" aria-label="${text().language}">
        <button type="button" data-locale="ru" class="${this.optionClass("ru")}">
          Русский
        </button>
        <button type="button" data-locale="es" class="${this.optionClass("es")}">
          Español
        </button>
      </div>
    `;
  }
}
