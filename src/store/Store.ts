import EventBus from "@/framework/EventBus";
import { set as setByPath } from "@/utils/set";

export const StoreEvents = { Updated: "updated" };

type Indexed = Record<string, any>;
export type State = {
  user: null | Indexed;
  // добавляй нужное: chats, messages, isLoading, error и т.д.
};

class Store extends EventBus {
  private state: State = { user: null };

  public getState(): State {
    return this.state;
  }

  public set(path: string, value: unknown) {
    console.log("🔧 Store.set called:", { path, value, currentState: this.state });
    this.state = setByPath(this.state as Indexed, path, value) as State;
    console.log("🔧 Store.set result:", this.state);
    this.emit(StoreEvents.Updated);
  }
}

const store = new Store();

// Добавляем глобальную функцию для отладки
(window as any).getStoreState = () => {
  console.log("📊 Current store state:", store.getState());
  return store.getState();
};

export default store;
