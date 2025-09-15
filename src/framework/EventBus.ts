type Listener = (...args: unknown[]) => void;

export default class EventBus {
  private readonly listeners: Record<string, Listener[]> = {};

  on(event: string, callback: Listener): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: Listener): void {
    const list = this.listeners[event];
    if (!list) throw new Error(`No such event: ${event}`);

    this.listeners[event] = list.filter((listener) => listener !== callback);
  }

  emit(event: string, ...args: unknown[]): void {
    const list = this.listeners[event];
    if (!list) return;

    list.forEach((listener) => listener(...args));
  }
}
