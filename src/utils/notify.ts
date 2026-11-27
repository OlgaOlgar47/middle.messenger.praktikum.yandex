import { getLocale } from "@/locale";

const lastAlert = new Map<number, string>();
const openAlerts = new Map<number, Notification>();

function shownText(content: string, translation?: string): string {
  const original = content || "";
  const translated = (translation || "").trim();
  if (!translated || translated === original) return original;
  const cyrillic = original.match(/[А-Яа-яЁё]/g)?.length ?? 0;
  const latin = original.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g)?.length ?? 0;
  const script = cyrillic === 0 && latin === 0 ? "" : cyrillic > latin ? "ru" : "es";
  if (script === getLocale() || script === "") return original;
  return translated;
}

export function enableMessageAlerts(): void {
  if (typeof Notification === "undefined" || Notification.permission !== "default") return;
  Notification.requestPermission().catch(() => undefined);
}

export function dismissAlert(chatId: number): void {
  openAlerts.get(chatId)?.close();
  openAlerts.delete(chatId);
  lastAlert.delete(chatId);
}

export function alertNewMessage(
  chatId: number,
  title: string,
  author: string,
  content: string,
  translation?: string
): void {
  const text = shownText(content, translation);
  const body = author ? `${author}: ${text}` : text;
  const key = `${title}\n${body}`;
  if (lastAlert.get(chatId) === key) return;
  lastAlert.set(chatId, key);
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  openAlerts.get(chatId)?.close();
  const note = new Notification(title || "URUS", {
    body,
    icon: "/icons/icon.svg",
    tag: `urus-${chatId}`,
  });
  openAlerts.set(chatId, note);
  note.onclose = () => {
    if (openAlerts.get(chatId) === note) openAlerts.delete(chatId);
  };
  note.onclick = () => {
    window.focus();
    note.close();
    window.dispatchEvent(new CustomEvent("urus-open-chat", { detail: chatId }));
  };
}
