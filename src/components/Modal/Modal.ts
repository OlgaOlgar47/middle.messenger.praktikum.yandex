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
    console.log("🔘 handleSubmit called");

    // Ищем поле ввода напрямую в DOM модального окна
    const inputElement = this.element?.querySelector("input") as HTMLInputElement;
    console.log("🔘 inputElement from DOM:", inputElement);

    const value = inputElement?.value?.trim();
    console.log("🔘 Input value:", value);

    if (value && this.props.onSubmit) {
      console.log("🔘 Calling onSubmit with value:", value);
      this.props.onSubmit(value);
      this.handleClose();
    } else {
      console.log("❌ No value or onSubmit callback");
      console.log("❌ value:", value);
      console.log("❌ onSubmit:", this.props.onSubmit);
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
    console.log("🔘 Modal.open() called");
    console.log("🔘 Current isOpen:", this.props.isOpen);
    this.setProps({ isOpen: true });
    console.log("🔘 After setProps isOpen:", this.props.isOpen);

    // Добавляем модальное окно в body
    setTimeout(() => {
      const modalElement = this.element;
      if (modalElement && document.body) {
        console.log("🔘 Adding modal to body");
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
      console.log("🔘 Attaching close button event");
      closeButton.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("🔘 Close button clicked");
        this.handleClose();
      });
    }
  }

  override render() {
    if (!this.props.isOpen) {
      return "";
    }

    console.log("🔘 Modal is open, rendering modal");
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
