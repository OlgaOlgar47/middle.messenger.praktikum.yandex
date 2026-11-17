import { Layout } from "@/components/Layout";
import type Block from "./Block";
import { isEqual, render } from "./utils";

export default class Route {
  private _pathname: string;

  private _blockClass: new (props?: Record<string, unknown>) => Block;

  private _block: Block | null = null;

  private _props: { rootQuery: string };

  constructor(
    pathname: string,
    view: new (props?: Record<string, unknown>) => Block,
    props: { rootQuery: string }
  ) {
    this._pathname = pathname;
    this._blockClass = view;
    this._props = props;
  }

  navigate(pathname: string) {
    if (this.match(pathname)) {
      this._pathname = pathname;
      this.render();
    }
  }

  leave() {
    if (this._block) this._block.hide();
  }

  match(pathname: string) {
    return isEqual(pathname, this._pathname);
  }

  render() {
    if (!this._block) {
      const page = new this._blockClass();
      this._block = new Layout({ content: page });
    }

    const element = this._block.getContent();
    const root = document.querySelector(this._props.rootQuery);
    if (element && root && !root.contains(element)) {
      render(this._props.rootQuery, this._block);
      return;
    }
    this._block.show();
  }
}
