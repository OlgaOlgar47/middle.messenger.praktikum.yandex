const MODEL = "gpt-6-luna";
const ENDPOINT = "https://inference-api.openserv.ai/v1/chat/completions";
const SYSTEM = `You translate short family-chat messages between Russian and Uruguayan Spanish.
If the message is Russian, translate it into natural Uruguayan Spanish: use voseo (vos, tenés, querés) and everyday wording from Uruguay.
If the message is Spanish, translate it into natural everyday Russian.
Keep names, phone numbers, links, emoji, and the tone of the original. Do not add greetings, quotes, or notes.
Reply with the translation only.`;

function completionText(data) {
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === "string" ? part : part?.text || ""))
      .join("")
      .trim();
  }
  return "";
}

function unwrap(text) {
  const value = text.trim();
  const pairs = [
    ['"', '"'],
    ["«", "»"],
    ["“", "”"],
  ];
  for (const [open, close] of pairs) {
    if (value.startsWith(open) && value.endsWith(close) && value.length > 1) {
      return value.slice(1, -1).trim();
    }
  }
  return value;
}

export async function translateMessage(text) {
  const key = process.env.SERV_API_KEY;
  if (!key || !text) return "";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_completion_tokens: 800,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: text },
        ],
      }),
    });
    if (!response.ok) {
      const detail = await response.text();
      const requestId = response.headers.get("x-openserv-request-id") || "";
      process.stderr.write(
        `translate failed ${response.status} ${requestId} ${detail.slice(0, 180)}\n`
      );
      return "";
    }
    const data = await response.json();
    return unwrap(completionText(data));
  } catch (error) {
    const message = error instanceof Error ? error.message : "error";
    process.stderr.write(`translate failed ${message}\n`);
    return "";
  } finally {
    clearTimeout(timer);
  }
}
