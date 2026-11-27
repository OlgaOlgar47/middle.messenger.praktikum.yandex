import Block from "@/framework/Block";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import type { BaseProps } from "@/types";

import styles from "./Modal.module.sass";

export type UserSuggestion = {
  login: string;
  name: string;
  disabled?: boolean;
  hint?: string;
};

interface ModalProps extends BaseProps {
  title?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onSubmit?: (data: string) => void;
  onQuery?: (value: string) => void;
  inputLabel?: string;
  inputPlaceholder?: string;
  submitButtonLabel?: string;
  cancelButtonLabel?: string;
  buttonType?: "add" | "remove" | "default";
  confirm?: boolean;
  message?: string;
  suggestions?: UserSuggestion[];
  suggestEmpty?: string;
  pickHint?: string;
  input?: Input;
  submitButton?: Button;
  cancelButton?: Button;
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

export class Modal extends Block<ModalProps> {
  private chosenLogin = "";

  constructor(props: ModalProps) {
    super("div", {
      ...props,
      styles,
      isOpen: false,
      input: new Input({
        type: "text",
        name: "modalInput",
        label: props.inputLabel || "Введите значение",
        placeholder: props.inputPlaceholder || "Введите значение",
        className: styles.input,
        required: true,
      }),
      submitButton: new Button({
        type: "submit",
        label: props.submitButtonLabel || "Подтвердить",
        className: styles.submitButton,
      }),
      events: {
        click: (e: Event) => this.handleBackdropClick(e),
        submit: (e: Event) => this.handleSubmit(e),
        input: (e: Event) => this.handleQuery(e),
      },
    });
  }

  protected init(): void {
    super.init();
    const button = this.children.submitButton as Button;
    if (button) {
      const newClassName = this.getButtonClassName(this.props.buttonType);
      button.setProps({ className: newClassName });
    }
  }

  private getButtonClassName(buttonType?: string): string {
    switch (buttonType) {
      case "add":
        return styles.addButton;
      case "remove":
        return styles.removeButton;
      default:
        return styles.submitButton;
    }
  }

  private handleBackdropClick(e: Event) {
    const target = e.target as HTMLElement;
    const pick = target.closest("[data-login]") as HTMLButtonElement | null;
    if (pick) {
      if (!pick.disabled) this.pickLogin(pick.getAttribute("data-login") || "");
      return;
    }
    if (target.classList.contains(styles.backdrop)) {
      this.handleClose();
    }
  }

  private handleQuery(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target?.name !== "modalInput" || !this.props.onQuery) return;
    const value = target.value.trim();
    if (value !== this.chosenLogin) this.chosenLogin = "";
    this.props.onQuery(target.value);
  }

  private pickLogin(login: string) {
    const item = (this.props.suggestions || []).find(
      (suggestion) => suggestion.login === login && !suggestion.disabled
    );
    if (!item) return;
    this.chosenLogin = login;
    const input = this.element?.querySelector(
      'input[name="modalInput"]'
    ) as HTMLInputElement | null;
    if (input) input.value = login;
    this.setProps({ suggestions: [...(this.props.suggestions || [])], suggestEmpty: "" });
  }

  private chosenMatch(): UserSuggestion | undefined {
    const enabled = (this.props.suggestions || []).filter((item) => !item.disabled);
    const typed = (
      this.element?.querySelector('input[name="modalInput"]') as HTMLInputElement | null
    )?.value
      ?.trim()
      ?.toLowerCase();
    if (this.chosenLogin) {
      return enabled.find((item) => item.login === this.chosenLogin);
    }
    return enabled.find((item) => item.login.toLowerCase() === typed);
  }

  private handleSubmit(e: Event) {
    e.preventDefault();

    if (this.props.confirm) {
      this.props.onSubmit?.("");
      this.handleClose();
      return;
    }

    const inputElement = this.element?.querySelector("input") as HTMLInputElement;
    const value = inputElement?.value?.trim();
    if (!value || !this.props.onSubmit) return;

    if (this.props.onQuery) {
      const match = this.chosenMatch();
      if (!match) {
        this.setProps({ suggestEmpty: this.props.pickHint || "" });
        return;
      }
      this.props.onSubmit(match.login);
      this.handleClose();
      return;
    }

    this.props.onSubmit(value);
    this.handleClose();
  }

  private handleClose() {
    this.detachEvents(); // Удаляем все обработчики событий
    this.setProps({ isOpen: false });

    const modalElement = this.element;
    if (modalElement && modalElement.parentNode) {
      modalElement.parentNode.removeChild(modalElement);
    }

    if (this.props.onClose) {
      this.props.onClose();
    }
  }

  public setCopy(copy: {
    title: string;
    inputLabel: string;
    inputPlaceholder: string;
    submitButtonLabel: string;
  }): void {
    this.setProps({
      title: copy.title,
      inputLabel: copy.inputLabel,
      inputPlaceholder: copy.inputPlaceholder,
      submitButtonLabel: copy.submitButtonLabel,
    });
    (this.children.input as Input).setProps({
      label: copy.inputLabel,
      placeholder: copy.inputPlaceholder,
    });
    (this.children.submitButton as Button).setProps({
      label: copy.submitButtonLabel,
    });
  }

  public setSuggestions(suggestions: UserSuggestion[], empty = ""): void {
    if (!suggestions.some((item) => item.login === this.chosenLogin)) {
      this.chosenLogin = "";
    }
    this.setProps({ suggestions, suggestEmpty: empty });
  }

  public open(initial = "") {
    this.chosenLogin = "";
    (this.children.input as Input).setProps({ value: initial });
    this.setProps({ isOpen: true, suggestions: [], suggestEmpty: "" });

    setTimeout(() => {
      const modalElement = this.element;
      if (modalElement && document.body) {
        document.body.appendChild(modalElement);
        this.attachEvents();
      }
      const inputElement = this.element?.querySelector("input") as HTMLInputElement | null;
      if (inputElement) {
        inputElement.value = initial;
      }
    }, 0);
  }

  public close() {
    this.handleClose();
  }

  private submitButtonHandler = (e: Event) => {
    this.handleSubmit(e);
  };

  private closeButtonHandler = (e: Event) => {
    e.preventDefault();
    this.handleClose();
  };

  private attachEvents() {
    const submitButton = this.element?.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.addEventListener("click", this.submitButtonHandler);
    }

    const closeButton = this.element?.querySelector('[data-action="close"]');
    if (closeButton) {
      closeButton.addEventListener("click", this.closeButtonHandler);
    }
  }

  private detachEvents() {
    const submitButton = this.element?.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.removeEventListener("click", this.submitButtonHandler);
    }

    const closeButton = this.element?.querySelector('[data-action="close"]');
    if (closeButton) {
      closeButton.removeEventListener("click", this.closeButtonHandler);
    }
  }

  private suggestionMarkup(): string {
    const items = this.props.suggestions || [];
    const empty = this.props.suggestEmpty || "";
    const note = empty ? `<p class="{{styles.suggestEmpty}}">${escapeHtml(empty)}</p>` : "";
    if (!items.length) return note;
    const rows = items
      .map((item) => {
        const selected = item.login === this.chosenLogin ? "{{styles.isSelected}}" : "";
        const disabled = item.disabled ? "disabled" : "";
        const name = item.name
          ? `<span class="{{styles.suggestName}}">(${escapeHtml(item.name)})</span>`
          : "";
        const hint = item.hint
          ? `<span class="{{styles.suggestHint}}">${escapeHtml(item.hint)}</span>`
          : "";
        return `
          <li>
            <button
              type="button"
              class="{{styles.suggestButton}} ${selected}"
              data-login="${escapeHtml(item.login)}"
              ${disabled}
            >
              <span class="{{styles.suggestLogin}}">${escapeHtml(item.login)}</span>
              ${name}
              ${hint}
            </button>
          </li>
        `;
      })
      .join("");
    return `<ul class="{{styles.suggestions}}">${rows}</ul>${note}`;
  }

  override render() {
    if (!this.props.isOpen) {
      return "";
    }

    return `
      <div class="{{styles.backdrop}}">
        <div class="{{styles.modal}}">
          <div class="{{styles.header}}">
            <h3 class="{{styles.title}}">{{title}}</h3>
            <button type="button" class="{{styles.closeButton}}" data-action="close">
              <span>&times;</span>
            </button>
          </div>
          <form class="{{styles.form}}">
            {{#if confirm}}
              <p class="{{styles.message}}">{{message}}</p>
            {{else}}
              <div class="{{styles.inputContainer}}">
                {{{input}}}
                ${this.suggestionMarkup()}
              </div>
            {{/if}}
            <div class="{{styles.buttons}}">
              {{{submitButton}}}
            </div>
          </form>
        </div>
      </div>
    `;
  }
}
