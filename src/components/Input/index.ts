import Block from "@/framework/Block";
import styles from "./Input.module.sass";

interface InputProps {
  label?: string;
  type?: string;
  name: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
  ariaLabel?: string;
  onChange?: (e: Event) => void;
  onInput?: (e: Event) => void;
  styles?: Record<string, string>;
  events?: Record<string, (e: Event) => void>;
}

export class Input extends Block<InputProps> {
  constructor(props: InputProps) {
    super("label", {
      // tagName 'label' для <label>
      ...props,
      styles: props.styles || styles, // Используем переданные стили или импортированные по умолчанию
      events: {
        change: (e: Event) => {
          props.onChange?.(e);
        }, // Обработчик изменения
        input: (e: Event) => {
          props.onInput?.(e);
        }, // Обработчик ввода
      },
    });
  }

  override render() {
    return `
      <label class="{{styles.label}}">
        {{#if label}}
          <span class="{{styles.labelText}}">{{label}}</span>
        {{/if}}
        <input
          type="{{type}}"
          name="{{name}}"
          placeholder="{{placeholder}}"
          class="{{styles.input}} {{className}}"
          {{#if required}}required{{/if}}
          {{#if ariaLabel}}aria-label="{{ariaLabel}}"{{/if}}
        />
      </label>
    `;
  }
}
