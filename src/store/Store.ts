import EventBus from "@/framework/EventBus";
import { set as setByPath } from "@/utils/set";
import type { Chat, Message } from "@/types";

export const StoreEvents = { Updated: "updated" };

type Indexed = Record<string, unknown>;
export type State = {
  user: null | Indexed;
  chats: Chat[];
  selectedChatId: number | undefined;
  messagesByChat: Record<number, Message[]>;
  isLoadingMessages: boolean;
};

class Store extends EventBus {
  private state: State = {
    user: null,
    chats: [],
    selectedChatId: undefined,
    messagesByChat: {},
    isLoadingMessages: false,
  };

  public getState(): State {
    return this.state;
  }

  public set(path: string, value: unknown) {
    this.state = setByPath(this.state as Indexed, path, value) as State;
    this.emit(StoreEvents.Updated);
  }
}

const store = new Store();

// глобальная функция для отладки
(window as any).getStoreState = () => {
  console.log("📊 Current store state:", store.getState());
  return store.getState();
};

export default store;
