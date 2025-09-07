import Block from "@/framework/Block";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import type { BaseProps } from "@/types";

import styles from "./Modal.module.sass";

interface ModalProps extends BaseProps {
  title?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onSubmit?: (data: string) => void;
  inputLabel?: string;
  inputPlaceholder?: string;
  submitButtonLabel?: string;
  cancelButtonLabel?: string;
  input?: Input;
  submitButton?: Button;
  cancelButton?: Button;
}

export class Modal extends Block<ModalProps> {
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
      },
    });
  }

  private handleBackdropClick(e: Event) {
    const target = e.target as HTMLElement;
    if (target.classList.contains(styles.backdrop)) {
      this.handleClose();
    }
  }

  private handleSubmit(e: Event) {
    e.preventDefault();

    // Ищем поле ввода напрямую в DOM модального окна
    const inputElement = this.element?.querySelector("input") as HTMLInputElement;
    const value = inputElement?.value?.trim();

    if (value && this.props.onSubmit) {
      this.props.onSubmit(value);
      this.handleClose();
    }
  }

  private handleClose() {
    this.setProps({ isOpen: false });

    // Удаляем модальное окно из body
    const modalElement = this.element;
    if (modalElement && modalElement.parentNode) {
      modalElement.parentNode.removeChild(modalElement);
    }

    if (this.props.onClose) {
      this.props.onClose();
    }
  }

  public open() {
    this.setProps({ isOpen: true });

    // Добавляем модальное окно в body
    setTimeout(() => {
      const modalElement = this.element;
      if (modalElement && document.body) {
        document.body.appendChild(modalElement);

        // Привязываем события к кнопкам
        this.attachEvents();
      }
    }, 0);

    // Очищаем поле ввода при открытии
    const inputElement = this.props.input?.element?.querySelector("input") as HTMLInputElement;
    if (inputElement) {
      inputElement.value = "";
    }
  }

  public close() {
    this.handleClose();
  }

  private attachEvents() {
    // Привязываем событие к кнопке submit (универсально)
    const submitButton = this.element?.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.addEventListener("click", (e) => {
        this.handleSubmit(e);
      });
    }

    // Привязываем событие к кнопке закрытия
    const closeButton = this.element?.querySelector('[data-action="close"]');
    if (closeButton) {
      closeButton.addEventListener("click", (e) => {
        e.preventDefault();
        this.handleClose();
      });
    }
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
            <div class="{{styles.inputContainer}}">
              {{{input}}}
            </div>
            <div class="{{styles.buttons}}">
              {{{submitButton}}}
            </div>
          </form>
        </div>
      </div>
    `;
  }
}
