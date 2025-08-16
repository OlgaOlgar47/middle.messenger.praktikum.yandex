type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE";
type RequestOptions = {
  method: HTTPMethod;
  data?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
};

export class HTTPTransport {
  private baseURL: string;

  constructor(baseURL: string = "/api") {
    this.baseURL = baseURL;
  }

  private queryStringify(data: Record<string, any>): string {
    if (!data) return "";
    return Object.entries(data)
      .map(([key, value]) => `${key}=${encodeURIComponent(value.toString())}`)
      .join("&");
  }

  private request(url: string, options: RequestOptions): Promise<any> {
    const { method, data, headers = {}, timeout = 5000 } = options;
    const fullURL =
      method === "GET" && data
        ? `${this.baseURL}${url}?${this.queryStringify(data)}`
        : `${this.baseURL}${url}`;

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
          let response: any;
          try {
            response = JSON.parse(xhr.responseText);
          } catch {
            response = xhr.responseText;
          }
          resolve(response);
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

  get(url: string, options: Omit<RequestOptions, "method"> = {}): Promise<any> {
    return this.request(url, { ...options, method: "GET" });
  }

  post(url: string, options: Omit<RequestOptions, "method"> = {}): Promise<any> {
    return this.request(url, { ...options, method: "POST" });
  }

  put(url: string, options: Omit<RequestOptions, "method"> = {}): Promise<any> {
    return this.request(url, { ...options, method: "PUT" });
  }

  delete(url: string, options: Omit<RequestOptions, "method"> = {}): Promise<any> {
    return this.request(url, { ...options, method: "DELETE" });
  }
}
