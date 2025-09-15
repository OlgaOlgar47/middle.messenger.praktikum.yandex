export class Toast {
  private static container: HTMLElement | null = null;

  private static createContainer(): HTMLElement {
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        pointer-events: none;
      `;
      document.body.appendChild(this.container);
    }
    return this.container;
  }

  private static show(message: string, type: "success" | "error" | "info" = "info") {
    const container = this.createContainer();
    const toast = document.createElement("div");

    const bgColor = {
      error: "#ff4444",
      success: "#44ff44",
      info: "#4488ff",
    }[type];

    toast.style.cssText = `
      background: ${bgColor};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      margin-bottom: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      pointer-events: auto;
      animation: slideIn 0.3s ease-out;
      max-width: 300px;
      word-wrap: break-word;
    `;

    toast.textContent = message;
    container.appendChild(toast);

    // Автоматическое удаление через 3 секунды
    setTimeout(() => {
      toast.style.animation = "slideOut 0.3s ease-in";
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  static success(message: string) {
    this.show(message, "success");
  }

  static error(message: string) {
    this.show(message, "error");
  }

  static info(message: string) {
    this.show(message, "info");
  }
}

// Добавляем CSS анимации
const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
