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

  private _setUpdate = false;

  private _eventBus: EventBus;

  constructor(tagName: string = "div", propsAndChilds: T = {} as T) {
    const { children, props } = this.getChildren(propsAndChilds);
    this._eventBus = new EventBus();
    this._meta = {
      tagName,
      props,
    };
    this._id = Math.floor(100000 + Math.random() * 900000);
    this.lists = (props.lists as Record<string, Array<Block<any> | string>>) || {};
    this.props = this._makePropsProxy({ ...props, _id: this._id });
    this.children = this._makePropsProxy(children);
    this._registerEvents(this._eventBus);
    this._eventBus.emit(Block.EVENTS.INIT);
  }

  public addAttribute(): void {
    const attr = (this.props.attr as Record<string, string> | undefined) ?? {};
    if (this._element) {
      Object.entries(attr).forEach(([key, value]) => {
        this._element!.setAttribute(key, value);
      });
    }
  }

  public getChildren(propsAndChildren: T): { children: Record<string, Block<any>>; props: T } {
    const children: Record<string, Block<any>> = {};
    const props: Partial<T> = {};

    Object.keys(propsAndChildren).forEach((key) => {
      const value = propsAndChildren[key as keyof T] as any;
      console.log(key, value instanceof Block);
      if (value instanceof Block) {
        children[key] = value as Block<any>;
      } else {
        props[key as keyof T] = value;
      }
    });

    return { children, props: props as T };
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

  protected componentDidUpdate(_oldProps: T, _newProps: T): boolean {
    return true;
  }

  public setProps(nextProps: Partial<T>): void {
    if (!nextProps) {
      return;
    }

    this._setUpdate = false;
    const oldValue = { ...this.props };

    const { children, props } = this.getChildren(nextProps as T);

    if (Object.values(children).length) {
      Object.assign(this.children, children);
    }

    if (Object.values(props).length) {
      Object.assign(this.props, props);

      if (this._setUpdate) {
        this._eventBus.emit(Block.EVENTS.FLOW_CDU, oldValue, this.props);
        this._setUpdate = false;
      }
    }
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

    Object.entries(this.lists).forEach(([key, list]) => {
      const stub = fragment.content.querySelector(`[data-id="${listIds[key]}"]`);
      if (stub && Array.isArray(list)) {
        const fragmentList = document.createDocumentFragment();
        list.forEach((child) => {
          if (child instanceof Block) {
            const childContent = child.getContent();
            if (childContent) fragmentList.appendChild(childContent);
          }
        });
        stub.replaceWith(fragmentList);
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

  private _makePropsProxy<T extends object>(props: T): T {
    const self = this;

    return new Proxy(props, {
      get(target: T, prop: string): any {
        const value = target[prop as keyof T];
        return typeof value === "function" ? value.bind(target) : value;
      },
      set(target: T, prop: string, value: any): boolean {
        if (target[prop as keyof T] !== value) {
          const oldTarget = { ...target };
          (target as any)[prop] = value;
          self._eventBus.emit(Block.EVENTS.FLOW_CDU, oldTarget, target);
          self._setUpdate = true; // Добавлено из компонента учителя
        }
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
