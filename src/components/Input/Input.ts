import Block from "@/framework/Block";
import { validateField } from "@/utils/validation";
import styles from "./Input.module.sass";

interface InputProps {
  label?: string;
  type?: string;
  name: string;
  placeholder?: string;
  value?: string;
  className?: string;
  required?: boolean;
  ariaLabel?: string;
  onChange?: (e: Event) => void;
  onInput?: (e: Event) => void;
  styles?: Record<string, string>;
  events?: Record<string, (e: Event) => void>;
}

export class Input extends Block<InputProps> {
  private errorElement: HTMLElement | null = null;

  constructor(props: InputProps) {
    super("label", {
      ...props,
      styles: props.styles || styles,
      events: {
        ...props.events,
        change: (e: Event) => {
          props.onChange?.(e);
        },
        input: (e: Event) => {
          props.onInput?.(e);
        },
        focusout: (e: Event) => {
          this.handleBlur(e);
          props.events?.blur?.(e);
        },
      },
    });
  }

  protected init(): void {
    super.init();
    this.errorElement = this.element?.querySelector(`.${styles.error}`) as HTMLElement | null;
  }

  private handleBlur(e: Event): void {
    const input = e.target as HTMLInputElement;

    // Для полей поиска не показываем ошибку при потере фокуса, если поле пустое
    if ((input.name === "query" || input.name === "search") && !input.value.trim()) {
      this.showError();
      return;
    }

    const { error } = validateField(input.name, input.value);
    this.showError(error);
  }

  public validate(): { isValid: boolean; error?: string } {
    const input = this.element?.querySelector("input") as HTMLInputElement;
    if (!input) return { isValid: false, error: "Input not found" };
    const { isValid, error } = validateField(input.name, input.value);
    this.showError(error);
    return { isValid, error };
  }

  private showError(error?: string): void {
    const input = this.element?.querySelector("input") as HTMLInputElement;
    if (input?.name === "message") return;

    if (!this.errorElement) {
      this.errorElement = this.element?.querySelector(
        `.${(this.props.styles || styles).error}`
      ) as HTMLElement | null;
    }
    if (this.errorElement) {
      this.errorElement.textContent = error || "";
      this.errorElement.style.display = error ? "block" : "none";
    }
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
          value="{{value}}"
          class="{{styles.input}} {{className}}"
          {{#if required}}required{{/if}}
          {{#if ariaLabel}}aria-label="{{ariaLabel}}"{{/if}}
        />
        <span class="{{styles.error}}" style="display: none; color: red; font-size: 12px;"></span>
      </label>
    `;
  }
}
