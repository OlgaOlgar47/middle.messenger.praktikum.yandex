import type Block from "@/framework/Block";
import store, { StoreEvents } from "./Store";
import type { State } from "./Store";

export function connect<T extends typeof Block>(
  mapStateToProps: (state: State) => Record<string, unknown>
) {
  return function WithStore(Component: T) {
    // @ts-expect-error mixin class для учебного проекта
    return class extends Component {
      constructor(...args: any[]) {
        // передаем все аргументы конструктора
        super(...args);

        // подписываемся на событие обновления store
        store.on(StoreEvents.Updated, () => {
          // вызываем обновление компонента, передав данные из хранилища
          this.setProps({ ...mapStateToProps(store.getState()) });
        });
      }
    };
  };
}
