import { ServerError } from "@/pages/ServerError/ServerError";
import { HttpStatus } from "@/utils/httpStatus";

class ErrorHandler {
  private currentErrorPage: ServerError | null = null;

  isServerError(error: unknown): boolean {
    if (error instanceof Error) {
      const { message } = error;
      return (
        message.includes(`Error ${HttpStatus.InternalServerError}:`) ||
        message.includes(`Error ${HttpStatus.BadGateway}:`) ||
        message.includes(`Error ${HttpStatus.ServiceUnavailable}:`) ||
        message.includes(`Error ${HttpStatus.GatewayTimeout}:`) ||
        message.includes("Internal Server Error")
      );
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
