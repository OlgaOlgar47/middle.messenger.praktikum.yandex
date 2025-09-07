import { ServerError } from "@/pages/ServerError/ServerError";

class ErrorHandler {
  private currentErrorPage: ServerError | null = null;

  isServerError(error: unknown): boolean {
    if (error instanceof Error) {
      return /5\d{2}/.test(error.message) || error.message.includes("Internal Server Error");
    }
    return false;
  }

  showServerError(): void {
    if (this.currentErrorPage) {
      return;
    }

    this.currentErrorPage = new ServerError({});

    document.body.innerHTML = "";
    document.body.appendChild(this.currentErrorPage.element!);
  }

  hideServerError(): void {
    if (this.currentErrorPage) {
      this.currentErrorPage.element?.remove();
      this.currentErrorPage = null;
    }
  }

  handleError(error: unknown): void {
    console.error("Ошибка:", error);

    if (this.isServerError(error)) {
      this.showServerError();
    }
  }
}

export const errorHandler = new ErrorHandler();
