import store, { StoreEvents } from "./Store";
import type { State } from "./Store";

export function connect<T extends any>(mapStateToProps: (state: State) => Record<string, unknown>) {
  return function WithStore(Component: T) {
    // @ts-expect-error mixin class для учебного проекта
    return class extends Component {
      constructor(...args: any[]) {
        // передаем все аргументы конструктора
        super(...args);

        // Инициализируем компонент данными из store
        const initialState = mapStateToProps(store.getState());
        // @ts-expect-error setProps может не существовать в типе
        this.setProps({ ...initialState });

        // Если есть метод updateFields и user уже есть в store, обновляем поля
        // @ts-expect-error updateFields может не существовать в типе
        if (this.updateFields && initialState.user) {
          // @ts-expect-error updateFields может не существовать в типе
          this.updateFields(initialState.user);
        }

        // подписываемся на событие обновления store
        store.on(StoreEvents.Updated, () => {
          // вызываем обновление компонента, передав данные из хранилища
          const newProps = mapStateToProps(store.getState());
          // @ts-expect-error setProps может не существовать в типе
          this.setProps({ ...newProps });

          // Если есть метод updateFields и user изменился, обновляем поля
          // @ts-expect-error updateFields может не существовать в типе
          if (this.updateFields && newProps.user) {
            // @ts-expect-error updateFields может не существовать в типе
            this.updateFields(newProps.user);
          }
        });
      }
    };
  };
}
