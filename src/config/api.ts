export const API_CONFIG = {
  BASE_URL: "/api/v2",
  TIMEOUT: 5000,
} as const;

export const getApiUrl = () => import.meta.env.VITE_API_URL || API_CONFIG.BASE_URL;

export function resourceUrl(filePath?: string | null): string {
  if (!filePath) return "";
  return `${getApiUrl()}/resources${filePath}`;
}

export function chatSocketUrl(userId: number, chatId: number, authToken: string): string {
  const api = getApiUrl();
  let origin: string;
  if (api.startsWith("http://") || api.startsWith("https://")) {
    const url = new URL(api);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    origin = url.origin;
  } else {
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    origin = `${proto}//${window.location.host}`;
  }
  return `${origin}/ws/chats/${userId}/${chatId}/${authToken}`;
}
