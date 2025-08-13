/* global document, HTMLElement, HTMLTemplateElement */

import * as Handlebars from "handlebars";
import EventBus from "./EventBus";

export default class Block<T extends Record<string, any> = {}> {
  static readonly EVENTS = {
    INIT: "init",
    FLOW_CDM: "flow:component-did-mount",
    FLOW_CDU: "flow:component-did-update",
    FLOW_RENDER: "flow:render",
  } as const;

  private _id: number;

  private _element: HTMLElement | null = null;

  // eslint-disable-next-line no-use-before-define
  protected children: Record<string, Block<any>>;

  // eslint-disable-next-line no-use-before-define
  protected lists: Record<string, Array<Block<any> | string>>;

  private _meta: { tagName: string; props: T };

  protected props: T;

  private _eventBus: EventBus;

  constructor(tagName: string = "div", props: T = {} as T) {
    this._eventBus = new EventBus();
    this._meta = {
      tagName,
      props,
    };
    this._id = Math.floor(100000 + Math.random() * 900000); // Уникальный ID для заглушек
    this.children = (props.children as Record<string, Block<any>>) || {};
    this.lists = (props.lists as Record<string, Array<Block<any> | string>>) || {};
    this.props = this._makePropsProxy(props);
    this._registerEvents(this._eventBus);
    this._eventBus.emit(Block.EVENTS.INIT);
  }

  private _registerEvents(eventBus: EventBus): void {
    eventBus.on(Block.EVENTS.INIT, this.init.bind(this));
    eventBus.on(Block.EVENTS.FLOW_CDM, this._componentDidMount.bind(this));
    eventBus.on(Block.EVENTS.FLOW_CDU, this._componentDidUpdate);
    eventBus.on(Block.EVENTS.FLOW_RENDER, this._render.bind(this));
  }

  private _createResources(): void {
    const { tagName } = this._meta;
    this._element = this._createDocumentElement(tagName);
  }

  protected init(): void {
    this._createResources();
    this._eventBus.emit(Block.EVENTS.FLOW_RENDER);
  }

  private _componentDidMount(): void {
    this.componentDidMount();
  }

  protected componentDidMount(): void {}

  public dispatchComponentDidMount(): void {
    this._eventBus.emit(Block.EVENTS.FLOW_CDM);
  }

  private _componentDidUpdate = (...args: unknown[]): void => {
    const [oldProps, newProps] = args as [T, T];
    const response = this.componentDidUpdate(oldProps, newProps);
    if (!response) {
      return;
    }
    this._render();
  };

  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  protected componentDidUpdate(_oldProps: T, _newProps: T): boolean {
    return true;
  }

  public setProps(nextProps: Partial<T>): void {
    if (!nextProps) {
      return;
    }

    Object.assign(this.props, nextProps);
  }

  public get element(): HTMLElement | null {
    return this._element;
  }

  private _render(): void {
    console.log("Render"); // Для отладки, можно удалить

    const propsAndStubs: Record<string, any> = { ...this.props };

    // Обработка children: добавляем заглушки в props для Handlebars
    Object.entries(this.children).forEach(([key, child]) => {
      propsAndStubs[key] = `<div data-id="${child._id}"></div>`;
    });

    const listIds: Record<string, number> = {};

    // Обработка lists: добавляем уникальные заглушки для списков
    Object.entries(this.lists).forEach(([key]) => {
      const tmpId = Math.floor(100000 + Math.random() * 900000);
      listIds[key] = tmpId;
      propsAndStubs[key] = `<div data-id="${tmpId}"></div>`;
    });

    // Создание фрагмента и компиляция шаблона Handlebars
    const fragment = this._createDocumentElement("template") as HTMLTemplateElement;
    fragment.innerHTML = Handlebars.compile(this.render())(propsAndStubs);

    // Замена заглушек для children на реальные элементы
    Object.values(this.children).forEach((child) => {
      const stub = fragment.content.querySelector(`[data-id="${child._id}"]`);
      if (stub) {
        const childContent = child.getContent();
        if (childContent) {
          stub.replaceWith(childContent);
        }
      }
    });

    // Обработка и замена заглушек для lists
    Object.entries(this.lists).forEach(([key, child]) => {
      const listCont = this._createDocumentElement("template") as HTMLTemplateElement;
      child.forEach((item) => {
        if (item instanceof Block) {
          const content = item.getContent();
          if (content) {
            listCont.content.append(content);
          }
        } else {
          listCont.content.append(`${item}`);
        }
      });
      const tmpId = listIds[key];
      const stub = fragment.content.querySelector(`[data-id="${tmpId}"]`);
      if (stub) {
        stub.replaceWith(listCont.content);
      }
    });

    // Замена старого элемента на новый
    const newElement = fragment.content.firstElementChild as HTMLElement | null;
    if (this._element && newElement) {
      this._element.replaceWith(newElement);
    }
    this._element = newElement;

    // Добавление событий и атрибутов (как в примере наставника)
    this._addEvents();
    this.addAttributes();
  }

  protected render(): string {
    // Возвращайте здесь строку шаблона Handlebars
    // Пример: return '<div>{{title}}</div><div data-id="child">{{childComponent}}</div>';
    return "";
  }

  public getContent(): HTMLElement | null {
    return this.element;
  }

  private _makePropsProxy(props: T): T {
    const self = this;

    return new Proxy(props, {
      get(target: T, prop: string): any {
        const value = target[prop as keyof T];
        return typeof value === "function" ? value.bind(self) : value;
      },
      set(target: T, prop: string, value: any): boolean {
        const oldTarget = { ...target };
        (target as any)[prop] = value;
        self._eventBus.emit(Block.EVENTS.FLOW_CDU, oldTarget, target);
        return true;
      },
      deleteProperty(): never {
        throw new Error("No access");
      },
    }) as T;
  }

  private _createDocumentElement(tagName: string): HTMLElement {
    // Could make a method that creates multiple blocks via fragments in a loop
    return document.createElement(tagName);
  }

  public show(): void {
    const content = this.getContent();
    if (content) {
      content.style.display = "block";
    }
  }

  public hide(): void {
    const content = this.getContent();
    if (content) {
      content.style.display = "none";
    }
  }

  protected _addEvents(): void {
    const events = this.props.events as Record<string, EventListener> | undefined;
    if (events && this._element) {
      Object.entries(events).forEach(([eventType, listener]) => {
        this._element!.addEventListener(eventType, listener);
      });
    }
  }

  protected addAttributes(): void {
    const attributes = this.props.attributes as Record<string, string> | undefined;
    if (attributes && this._element) {
      Object.entries(attributes).forEach(([key, value]) => {
        this._element!.setAttribute(key, value);
      });
    }
  }
}
