import * as Handlebars from "handlebars";
import EventBus from "./EventBus";

export interface BaseProps {
  attributes?: Record<string, string>;
  events?: Record<string, (e: Event) => void>;
}

export default class Block<T extends BaseProps = BaseProps> {
  static readonly EVENTS = {
    INIT: "init",
    FLOW_CDM: "flow:component-did-mount",
    FLOW_CDU: "flow:component-did-update",
    FLOW_RENDER: "flow:render",
  } as const;

  private _id: number;

  private _element: HTMLElement | null = null;

  // eslint-disable-next-line no-use-before-define
  protected children: Record<string, Block<object>> = {};

  // eslint-disable-next-line no-use-before-define
  protected lists: Record<string, Array<Block<object> | string>> = {};

  private _meta: { tagName: string; props: T };

  protected props: T;

  private _setUpdate = false;

  private _eventBus: EventBus;

  constructor(tagName: string = "div", propsAndChilds: T = {} as T) {
    const { children, props, lists } = this.getChildren(propsAndChilds);

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

  protected addAttributes(): void {
    const attributes = (this.props.attributes as Record<string, string> | undefined) ?? {};
    if (this._element) {
      Object.entries(attributes).forEach(([key, value]) => {
        this._element!.setAttribute(key, value);
      });
    }
  }

  public getChildren(propsAndChildren: T): {
    children: Record<string, Block<BaseProps>>;
    props: Partial<T>;
    lists: Record<string, Block<BaseProps>[]>;
  } {
    const children: Record<string, Block<BaseProps>> = {};
    const props: Partial<T> = {};
    const lists: Record<string, Block<BaseProps>[]> = {};
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
    // Компиляция шаблона с помощью compile
    const fragment = this.compile(this.render(), this.props);

    // Получаем новый элемент из фрагмента
    const newElement = fragment.firstElementChild as HTMLElement | null;

    // Замена старого элемента на новый
    if (this._element && newElement) {
      this._removeEvents();
      this._element.replaceWith(newElement);
    }
    this._element = newElement || this._element;

    // Добавление событий и атрибутов
    this._addEvents();
    this.addAttributes();
  }

  public compile(template: string, props: T = this.props): DocumentFragment {
    const propsAndStubs: Record<string, unknown> = { ...(props as object) };

    // Добавляем заглушки для children
    Object.entries(this.children).forEach(([key, child]) => {
      propsAndStubs[key] = `<div data-id="${child._id}"></div>`;
    });

    // Добавляем заглушки для lists как массив строк (для {{#each}} в шаблоне)
    Object.entries(this.lists).forEach(([key, list]) => {
      if (Array.isArray(list)) {
        propsAndStubs[key] = list.map((item) =>
          item instanceof Block ? `<div data-id="${item._id}"></div>` : `${item}`
        );
      }
    });

    // Компиляция шаблона с защитой от XSS
    const fragment = this._createDocumentElement("template") as HTMLTemplateElement;
    const compiledTemplate = Handlebars.compile(template);
    const htmlContent = compiledTemplate(propsAndStubs);

    // Дополнительная защита от XSS - проверяем на подозрительные теги
    if (this.containsMaliciousContent(htmlContent)) {
      console.warn("Обнаружен потенциально опасный контент в шаблоне");
    }

    fragment.innerHTML = htmlContent;

    // Замена заглушек для children
    Object.values(this.children).forEach((child) => {
      const stub = fragment.content.querySelector(`[data-id="${child._id}"]`);
      const childContent = child.getContent();
      if (stub && childContent) {
        stub.replaceWith(childContent);
      }
    });

    // Замена заглушек для lists (по каждому элементу списка)
    Object.values(this.lists).forEach((list) => {
      if (Array.isArray(list)) {
        list.forEach((item) => {
          if (item instanceof Block) {
            const stub = fragment.content.querySelector(`[data-id="${item._id}"]`);
            const itemContent = item.getContent();
            if (stub && itemContent) {
              stub.replaceWith(itemContent);
            }
          }
        });
      }
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

  private _makePropsProxy<U extends object>(props: U): U {
    const self = this;

    return new Proxy(props, {
      get(target: U, prop: string): unknown {
        const value = target[prop as keyof U];
        return typeof value === "function" ? value.bind(target) : value;
      },
      set(target: U, prop: string, value: unknown): boolean {
        if (target[prop as keyof U] !== value) {
          const oldTarget = { ...target };
          (target as Record<string, unknown>)[prop] = value;
          self._eventBus.emit(Block.EVENTS.FLOW_CDU, oldTarget, target);
          self._setUpdate = true;
        }
        return true;
      },
      deleteProperty(): never {
        throw new Error("No access");
      },
    }) as U;
  }

  private _createDocumentElement(tagName: string): HTMLElement {
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
    const events = this.props.events as Record<string, (e: Event) => void> | undefined;
    if (events && this._element) {
      Object.entries(events).forEach(([eventType, listener]) => {
        this._element!.addEventListener(eventType, listener);
      });
    }
  }

  private _removeEvents() {
    const { events = {} } = this.props;
    Object.keys(events).forEach((eventName) => {
      if (events[eventName] !== undefined) {
        this._element?.removeEventListener(eventName, events[eventName]);
      }
    });
  }

  // Защита от XSS - проверка на подозрительный контент
  private containsMaliciousContent(html: string): boolean {
    const dangerousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /<object[^>]*>.*?<\/object>/gi,
      /<embed[^>]*>/gi,
      /<link[^>]*>/gi,
      /<meta[^>]*>/gi,
    ];

    return dangerousPatterns.some((pattern) => pattern.test(html));
  }
}
