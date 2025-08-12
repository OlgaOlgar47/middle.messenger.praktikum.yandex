/* global document, HTMLElement */

import EventBus from "./EventBus";

export default class Block<T extends Record<string, any> = {}> {
  static readonly EVENTS = {
    INIT: "init",
    FLOW_CDM: "flow:component-did-mount",
    FLOW_CDU: "flow:component-did-update",
    FLOW_RENDER: "flow:render",
  } as const;

  private _element: HTMLElement | null = null;

  private _meta: { tagName: string; props: T };

  protected props: T;

  private _eventBus: EventBus;

  constructor(tagName = "div", props: T = {} as T) {
    this._eventBus = new EventBus();
    this._meta = {
      tagName,
      props,
    };

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
    this._element = Block._createDocumentElement(tagName);
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
    const block = this.render();
    // This unsafe method is for simplifying logic
    // Use a templating engine from npm or write your own safe one
    // Compile to DOM nodes instead of strings for better practice
    if (this._element) {
      this._element.innerHTML = block;
    }
  }

  protected render(): string {
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
        target[prop as keyof T] = value;
        self._eventBus.emit(Block.EVENTS.FLOW_CDU, oldTarget, target);
        return true;
      },
      deleteProperty(): never {
        throw new Error("No access");
      },
    }) as T;
  }

  private static _createDocumentElement(tagName: string): HTMLElement {
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
}
