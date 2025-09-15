import type { BaseProps } from "../framework/Block";
import type Block from "../framework/Block";
import store, { StoreEvents } from "./Store";
import type { State } from "./Store";

interface SetProps<P> {
  setProps(props: Partial<P>): void;
}

interface UpdateFields<U = unknown> {
  updateFields?(user: U): void;
}

/**
 * mapStateToProps: (state) => часть пропсов для компонента
 *
 * TConstructor — тип конструктора компонента, который мы оборачиваем.
 * Он гарантированно создаёт экземпляр Block<P> и реализует setProps/updateFields.
 */
export function connect<P extends BaseProps, U = unknown>(
  mapStateToProps: (state: State) => Partial<P>
) {
  // eslint-disable-next-line func-names
  return function <
    TConstructor extends new (props?: Partial<P>) => Block<P> & SetProps<P> & UpdateFields<U>,
  >(Component: TConstructor): TConstructor {
    // приводим Component к явному конструкторному типу, чтобы TS понял super()
    const Base = Component as unknown as new (
      ...args: ConstructorParameters<TConstructor>
    ) => InstanceType<TConstructor>;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore — класс-выражение с dynamic extends: безопасно типизировано выше
    return class WithStore extends Base {
      constructor(...args: ConstructorParameters<TConstructor>) {
        super(...args);

        const initialState = mapStateToProps(store.getState());
        // this гарантированно имеет setProps благодаря ограничению TConstructor
        (this as unknown as SetProps<P>).setProps(initialState);

        const maybeUser = (initialState as Record<string, unknown>)?.user as U | undefined;
        if ((this as unknown as UpdateFields<U>).updateFields && maybeUser !== undefined) {
          (this as unknown as UpdateFields<U>).updateFields!(maybeUser);
        }

        store.on(StoreEvents.Updated, () => {
          const newProps = mapStateToProps(store.getState());
          (this as unknown as SetProps<P>).setProps(newProps);

          const newUser = (newProps as Record<string, unknown>)?.user as U | undefined;
          if ((this as unknown as UpdateFields<U>).updateFields && newUser !== undefined) {
            (this as unknown as UpdateFields<U>).updateFields!(newUser);
          }
        });
      }
    } as unknown as TConstructor;
  };
}
