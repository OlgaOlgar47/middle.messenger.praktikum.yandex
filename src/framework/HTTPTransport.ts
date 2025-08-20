type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE";

type RequestOptions = {
  method: HTTPMethod;
  data?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
};

type HTTPMethodFn = <R = unknown>(
  url: string,
  options?: Omit<RequestOptions, "method">
) => Promise<R>;

export class HTTPTransport {
  private baseURL: string;

  constructor(baseURL: string = "/api") {
    this.baseURL = baseURL;
  }

  private queryStringify(data: unknown): string {
    if (typeof data !== "object" || data === null) {
      return "";
    }

    return Object.entries(data)
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join("&");
  }

  private request<ResponseT = unknown>(url: string, options: RequestOptions): Promise<ResponseT> {
    const { method, data, headers = {}, timeout = 5000 } = options;
    const query = method === "GET" && data ? `?${this.queryStringify(data)}` : "";
    const fullURL = `${this.baseURL}${url}${query}`;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, fullURL);
      xhr.timeout = timeout;
      xhr.withCredentials = true;

      Object.entries(headers).forEach(([key, value]) => xhr.setRequestHeader(key, value));

      if (method !== "GET" && !headers["Content-Type"]) {
        xhr.setRequestHeader("Content-Type", "application/json");
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          let response: unknown;
          try {
            response = JSON.parse(xhr.responseText);
          } catch {
            response = xhr.responseText;
          }
          resolve(response as ResponseT);
        } else {
          reject(new Error(`Error ${xhr.status}: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => reject(new Error("Network error"));
      xhr.ontimeout = () => reject(new Error("Request timeout"));
      xhr.onabort = () => reject(new Error("Request aborted"));

      if (method === "GET" || !data) {
        xhr.send();
      } else {
        xhr.send(JSON.stringify(data));
      }
    });
  }

  get: HTTPMethodFn = (url, options = {}) => this.request(url, { ...options, method: "GET" });

  post: HTTPMethodFn = (url, options = {}) => this.request(url, { ...options, method: "POST" });

  put: HTTPMethodFn = (url, options = {}) => this.request(url, { ...options, method: "PUT" });

  delete: HTTPMethodFn = (url, options = {}) => this.request(url, { ...options, method: "DELETE" });
}
