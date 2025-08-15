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

  protected children: Record<string, Block<any>>;

  protected lists: Record<string, Array<Block<any> | string>>;

  private _meta: { tagName: string; props: T };

  protected props: T;

  private _setUpdate = false;

  private _eventBus: EventBus;

  constructor(tagName: string = "div", propsAndChilds: T = {} as T) {
    console.log("propsAndChilds: ", propsAndChilds);
    const { children, props, lists } = this.getChildren(propsAndChilds);
    console.log("Constructor lists: ", lists);

    this._eventBus = new EventBus();

    this._meta = {
      tagName,
      props: props as T,
    };

    this._id = Math.floor(100000 + Math.random() * 900000);

    this.lists = this._makePropsProxy(lists);
    this.props = this._makePropsProxy({ ...(props as T), _id: this._id });
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

  public getChildren(propsAndChildren: T): {
    children: Record<string, Block<any>>;
    props: Partial<T>;
    lists: Record<string, Block<any>[]>;
  } {
    const children: Record<string, Block<any>> = {};
    const props: Partial<T> = {};
    const lists: Record<string, Block<any>[]> = {};
    Object.entries(propsAndChildren).forEach(([key, value]) => {
      if (value instanceof Block) {
        children[key] = value;
      } else if (
        Array.isArray(value) &&
        (value.length === 0 || value.every((v) => v instanceof Block))
      ) {
        lists[key] = value;
      } else {
        props[key as keyof T] = value;
      }
    });
    console.log("lists from getChildren: ", lists);

    return { children, props, lists };
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

    const { children, props, lists } = this.getChildren(nextProps as T);

    if (Object.values(children).length) {
      Object.assign(this.children, children);
    }

    if (Object.values(lists).length) {
      Object.assign(this.lists, lists);
    }

    if (Object.values(props).length) {
      Object.assign(this.props, props);
    }

    if (this._setUpdate) {
      this._eventBus.emit(Block.EVENTS.FLOW_CDU, oldValue, this.props);
      this._setUpdate = false;
    }
  }

  public get element(): HTMLElement | null {
    return this._element;
  }

  private _render(): void {
    console.log("Render called for", this.constructor.name);
    const propsAndStubs: Record<string, any> = { ...this.props };
    console.log("propsAndStubs", propsAndStubs);
    console.log("this.lists before forEach:", this.lists);

    // Обработка children: добавляем заглушки в props для Handlebars
    Object.entries(this.children).forEach(([key, child]) => {
      propsAndStubs[key] = `<div data-id="${child._id}"></div>`;
    });

    Object.entries(this.lists).forEach(([key, list]) => {
      console.log("lists: ", this.lists);
      if (Array.isArray(list)) {
        propsAndStubs[key] = list.map((child) =>
          child instanceof Block ? `<div data-id="${child._id}"></div>` : String(child)
        );
      }
    });

    // Создание фрагмента и компиляция шаблона Handlebars
    const fragment = this._createDocumentElement("template") as HTMLTemplateElement;
    fragment.innerHTML = Handlebars.compile(this.render())(propsAndStubs);
    console.log("Compiled template innerHTML:", fragment.innerHTML);

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

    Object.values(this.lists).forEach((list) => {
      console.log("list222222222222222222222: ", list);
      if (Array.isArray(list)) {
        list.forEach((child) => {
          if (child instanceof Block) {
            const stub = fragment.content.querySelector(`[data-id="${child._id}"]`);
            console.log("Replacing stub for child ID", child._id, "stub found?", !!stub); // Должен показать true для каждого Link
            if (stub) {
              const childContent = child.getContent();
              console.log("childContent for ID", child._id, childContent?.outerHTML);
              if (childContent) stub.replaceWith(childContent);
            }
          }
        });
      }
    });

    // Замена старого элемента на новый
    const newElement = fragment.content.firstElementChild as HTMLElement | null;
    if (this._element && newElement) {
      this._element.replaceWith(newElement);
    }
    this._element = newElement || this._element;

    // Добавление событий и атрибутов (как в примере наставника)
    this._addEvents();
    this.addAttributes();
  }

  public compile(template: string, props: T = this.props): DocumentFragment {
    const propsAndStubs: Record<string, any> = { ...props };

    Object.entries(this.children).forEach(([key, child]) => {
      propsAndStubs[key] = `<div data-id="${child._id}"></div>`;
    });

    Object.entries(this.lists).forEach(([key]) => {
      propsAndStubs[key] = `<div data-id="__l_${key}"></div>`;
    });

    const fragment = this._createDocumentElement("template") as HTMLTemplateElement;
    fragment.innerHTML = Handlebars.compile(template)(propsAndStubs);

    Object.values(this.children).forEach((child) => {
      const stub = fragment.content.querySelector(`[data-id="${child._id}"]`);
      if (stub && child.getContent()) stub.replaceWith(child.getContent()!);
    });

    Object.entries(this.lists).forEach(([key, list]) => {
      const stub = fragment.content.querySelector(`[data-id="__l_${key}"]`);
      if (!stub) return;

      const listContent = this._createDocumentElement("template") as HTMLTemplateElement;
      list.forEach((item) => {
        if (item instanceof Block && item.getContent()) {
          listContent.content.append(item.getContent()!);
        } else {
          listContent.content.append(`${item}`);
        }
      });

      stub.replaceWith(listContent.content);
    });

    return fragment.content;
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
          self._setUpdate = true;
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
