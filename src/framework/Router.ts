import Route from "./Route";

export default class Router {
  // eslint-disable-next-line no-use-before-define
  private static __instance: Router | null = null;

  private routes: Route[] = [];

  private history = window.history;

  private _currentRoute: Route | null = null;

  private _rootQuery!: string;

  constructor(rootQuery: string) {
    if (Router.__instance) return Router.__instance;
    this._rootQuery = rootQuery;
    Router.__instance = this;
  }

  use(pathname: string, BlockClass: any) {
    const route = new Route(pathname, BlockClass, { rootQuery: this._rootQuery });
    this.routes.push(route);
    return this; // чейним .use().use()
  }

  start() {
    window.onpopstate = () => this._onRoute(window.location.pathname);
    this._onRoute(window.location.pathname);
  }

  private _onRoute(pathname: string) {
    const route = this.getRoute(pathname);
    if (!route) {
      // 404 fallback: отрисуй свою страницу 404, если есть
      const notFound = this.getRoute("/404");
      if (notFound) {
        if (this._currentRoute && this._currentRoute !== notFound) this._currentRoute.leave();
        this._currentRoute = notFound;
        notFound.render();
      }
      return;
    }

    if (this._currentRoute && this._currentRoute !== route) this._currentRoute.leave();
    this._currentRoute = route;
    route.render();
  }

  go(pathname: string) {
    this.history.pushState({}, "", pathname);
    this._onRoute(pathname);
  }

  back() {
    this.history.back();
  }

  forward() {
    this.history.forward();
  }

  getRoute(pathname: string) {
    return this.routes.find((r) => r.match(pathname));
  }
}
