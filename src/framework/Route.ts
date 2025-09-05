import { Layout } from "@/components/Layout";
import type Block from "./Block";
import { isEqual, render } from "./utils";

export default class Route {
  private _pathname: string;

  private _blockClass: new () => Block;

  private _block: Block | null = null;

  private _props: { rootQuery: string };

  constructor(pathname: string, view: new () => Block, props: { rootQuery: string }) {
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
      const layout = new Layout({ content: page });
      this._block = layout;
      render(this._props.rootQuery, layout);
      return;
    }
    this._block.show();
  }
}
