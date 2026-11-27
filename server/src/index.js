import { createServer } from "node:http";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { createReadStream, existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { WebSocketServer } from "ws";
import { db, findUserById, findUserByLogin, publicUser, uploadDir } from "./db.js";
import { loadEnv } from "./env.js";
import { translateMessage } from "./translate.js";

loadEnv();

const PORT = Number(process.env.PORT || 3002);
const HOST = process.env.HOST || "127.0.0.1";
const JSON_LIMIT = 1024 * 1024;
const FILE_LIMIT = 5 * 1024 * 1024;
const rooms = new Map();
const userSockets = new Map();
const socketChats = new WeakMap();

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

function checkPassword(password, stored) {
  const [salt, hash] = String(stored).split(":");
  if (!salt || !hash) return false;
  const actual = scryptSync(password, salt, 32);
  const expected = Buffer.from(hash, "hex");
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

function token() {
  return randomBytes(24).toString("hex");
}

function now() {
  return new Date().toISOString();
}

function cookiesOf(req) {
  const header = req.headers.cookie || "";
  const pairs = header.split(";").filter((part) => part.includes("="));
  return Object.fromEntries(
    pairs.map((part) => {
      const index = part.indexOf("=");
      return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())];
    })
  );
}

function saveLocale(userId, locale) {
  if (locale !== "ru" && locale !== "es") return;
  db.prepare("UPDATE users SET locale = ? WHERE id = ? AND locale != ?").run(
    locale,
    userId,
    locale
  );
}

function sessionUser(req) {
  const { auth } = cookiesOf(req);
  if (!auth) return null;
  const session = db.prepare("SELECT user_id FROM sessions WHERE token = ?").get(auth);
  if (!session) return null;
  const user = findUserById(session.user_id);
  if (!user) return null;
  saveLocale(user.id, String(req.headers["x-locale"] || ""));
  return user;
}

function textLanguage(text) {
  const cyrillic = text.match(/[А-Яа-яЁё]/g)?.length ?? 0;
  const latin = text.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g)?.length ?? 0;
  if (cyrillic === 0 && latin === 0) return "";
  return cyrillic > latin ? "ru" : "es";
}

function recipientLanguage(chatId, senderId, source) {
  const others = db
    .prepare(
      `SELECT users.locale FROM chat_users
       JOIN users ON users.id = chat_users.user_id
       WHERE chat_users.chat_id = ? AND chat_users.user_id != ?`
    )
    .all(chatId, senderId);
  const chosen = others.map((row) => row.locale).find((locale) => locale && locale !== source);
  if (chosen) return chosen;
  if (source === "ru") return "es";
  if (source === "es") return "ru";
  return "";
}

function send(res, status, body) {
  const payload = body == null ? "" : JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(payload);
}

function fail(res, status, reason) {
  send(res, status, { reason });
}

function authCookie(value, req, maxAge) {
  const parts = [`auth=${value}`, "HttpOnly", "Path=/", "SameSite=Lax", `Max-Age=${maxAge}`];
  if (req.headers["x-forwarded-proto"] === "https") parts.push("Secure");
  return parts.join("; ");
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(Object.assign(new Error("Payload too large"), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function readJson(req) {
  const raw = await readBody(req, JSON_LIMIT);
  if (!raw.length) return {};
  return JSON.parse(raw.toString("utf8"));
}

function filePart(buffer, contentType) {
  const match = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType || "");
  if (!match) return null;
  const boundary = Buffer.from(`--${(match[1] || match[2]).trim()}`);
  let start = buffer.indexOf(boundary);
  while (start !== -1) {
    const next = buffer.indexOf(boundary, start + boundary.length);
    if (next === -1) break;
    const chunk = buffer.subarray(start + boundary.length, next);
    const headerEnd = chunk.indexOf("\r\n\r\n");
    if (headerEnd !== -1) {
      const headers = chunk.subarray(0, headerEnd).toString("utf8");
      if (/name="avatar"/i.test(headers)) {
        const type = /Content-Type:\s*([^\r\n]+)/i.exec(headers);
        let body = chunk.subarray(headerEnd + 4);
        if (body.subarray(-2).toString() === "\r\n") body = body.subarray(0, -2);
        return { body, type: type ? type[1].trim() : "" };
      }
    }
    start = next;
  }
  return null;
}

function requireFields(body, fields) {
  const missing = fields.find((field) => !String(body[field] ?? "").trim());
  if (!missing) return "";
  return `${missing} is empty, but required`;
}

function unreadCount(chatId, userId) {
  const read = db
    .prepare("SELECT message_id FROM chat_reads WHERE chat_id = ? AND user_id = ?")
    .get(chatId, userId);
  const row = db
    .prepare(
      `SELECT COUNT(*) AS count FROM messages
       WHERE chat_id = ? AND id > ? AND user_id != ?`
    )
    .get(chatId, read ? read.message_id : 0, userId);
  return row.count;
}

function memberRole(chatId, userId) {
  const row = db
    .prepare("SELECT role FROM chat_users WHERE chat_id = ? AND user_id = ?")
    .get(chatId, userId);
  return row ? row.role : "";
}

function chatList(userId) {
  const chats = db
    .prepare(
      `SELECT chats.* FROM chats
       JOIN chat_users ON chat_users.chat_id = chats.id
       WHERE chat_users.user_id = ?
       ORDER BY chats.id DESC`
    )
    .all(userId);

  return chats
    .map((chat) => {
      const message = db
        .prepare(
          `SELECT messages.*, users.first_name, users.second_name, users.avatar,
                  users.email, users.login, users.phone
           FROM messages JOIN users ON users.id = messages.user_id
           WHERE messages.chat_id = ?
           ORDER BY messages.id DESC LIMIT 1`
        )
        .get(chat.id);
      return {
        id: chat.id,
        title: chat.title,
        avatar: chat.avatar,
        unread_count: unreadCount(chat.id, userId),
        last_message: message
          ? {
              user: {
                first_name: message.first_name,
                second_name: message.second_name,
                avatar: message.avatar,
                email: message.email,
                login: message.login,
                phone: message.phone,
              },
              time: message.time,
              content: message.content,
              translation: message.translation || "",
              user_id: message.user_id,
            }
          : null,
        sortTime: message ? message.time : chat.created_at,
      };
    })
    .sort((a, b) => (a.sortTime < b.sortTime ? 1 : -1))
    .map(({ sortTime: _sortTime, ...chat }) => chat);
}

async function signup(req, res) {
  const body = await readJson(req);
  const reason = requireFields(body, [
    "first_name",
    "second_name",
    "login",
    "email",
    "password",
    "phone",
  ]);
  if (reason) return fail(res, 400, reason);
  if (findUserByLogin(body.login)) return fail(res, 400, "Login already exists");
  const emailTaken = db.prepare("SELECT id FROM users WHERE email = ?").get(body.email);
  if (emailTaken) return fail(res, 400, "Email already exists");
  const result = db
    .prepare(
      `INSERT INTO users (
        first_name, second_name, display_name, login, email, phone,
        password_hash, avatar, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?)`
    )
    .run(
      body.first_name.trim(),
      body.second_name.trim(),
      body.first_name.trim(),
      body.login.trim(),
      body.email.trim(),
      body.phone.trim(),
      hashPassword(body.password),
      now()
    );
  const auth = token();
  db.prepare("INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)").run(
    auth,
    Number(result.lastInsertRowid),
    now()
  );
  res.setHeader("Set-Cookie", authCookie(auth, req, 60 * 60 * 24 * 14));
  return send(res, 200, { id: Number(result.lastInsertRowid) });
}

async function signin(req, res) {
  if (sessionUser(req)) return fail(res, 400, "User already in system");
  const body = await readJson(req);
  const user = findUserByLogin(String(body.login || "").trim());
  if (!user || !checkPassword(String(body.password || ""), user.password_hash)) {
    return fail(res, 401, "Login or password is incorrect");
  }
  const auth = token();
  db.prepare("INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)").run(
    auth,
    user.id,
    now()
  );
  res.setHeader("Set-Cookie", authCookie(auth, req, 60 * 60 * 24 * 14));
  return send(res, 200, "OK");
}

function logout(req, res) {
  const { auth } = cookiesOf(req);
  if (auth) db.prepare("DELETE FROM sessions WHERE token = ?").run(auth);
  res.setHeader("Set-Cookie", authCookie("", req, 0));
  return send(res, 200, "OK");
}

function me(req, res) {
  const user = sessionUser(req);
  if (!user) return fail(res, 401, "Cookie is not valid");
  return send(res, 200, publicUser(user));
}

async function updateProfile(req, res) {
  const user = sessionUser(req);
  if (!user) return fail(res, 401, "Cookie is not valid");
  const body = await readJson(req);
  const reason = requireFields(body, ["first_name", "second_name", "login", "email", "phone"]);
  if (reason) return fail(res, 400, reason);
  const loginTaken = db
    .prepare("SELECT id FROM users WHERE login = ? AND id != ?")
    .get(body.login.trim(), user.id);
  if (loginTaken) return fail(res, 400, "Login already exists");
  const emailTaken = db
    .prepare("SELECT id FROM users WHERE email = ? AND id != ?")
    .get(body.email.trim(), user.id);
  if (emailTaken) return fail(res, 400, "Email already exists");
  db.prepare(
    `UPDATE users
     SET first_name = ?, second_name = ?, display_name = ?, login = ?, email = ?, phone = ?
     WHERE id = ?`
  ).run(
    body.first_name.trim(),
    body.second_name.trim(),
    String(body.display_name || "").trim(),
    body.login.trim(),
    body.email.trim(),
    body.phone.trim(),
    user.id
  );
  return send(res, 200, publicUser(findUserById(user.id)));
}

function imageExtension(mime) {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

function imageContentType(filePath) {
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

async function updateAvatar(req, res) {
  const user = sessionUser(req);
  if (!user) return fail(res, 401, "Cookie is not valid");
  const raw = await readBody(req, FILE_LIMIT);
  const part = filePart(raw, req.headers["content-type"]);
  if (!part || !part.body.length) return fail(res, 400, "Avatar is empty");
  if (!part.type.startsWith("image/")) return fail(res, 400, "Avatar must be an image");
  const extension = imageExtension(part.type);
  const name = `${token()}.${extension}`;
  const folder = path.join(uploadDir, String(user.id));
  mkdirSync(folder, { recursive: true });
  writeFileSync(path.join(folder, name), part.body);
  const avatar = `/${user.id}/${name}`;
  db.prepare("UPDATE users SET avatar = ? WHERE id = ?").run(avatar, user.id);
  return send(res, 200, publicUser(findUserById(user.id)));
}

async function changePassword(req, res) {
  const user = sessionUser(req);
  if (!user) return fail(res, 401, "Cookie is not valid");
  const body = await readJson(req);
  if (!checkPassword(String(body.oldPassword || ""), user.password_hash)) {
    return fail(res, 400, "Password is incorrect");
  }
  if (!String(body.newPassword || "").trim())
    return fail(res, 400, "newPassword is empty, but required");
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(
    hashPassword(body.newPassword),
    user.id
  );
  return send(res, 200, "OK");
}

async function searchUsers(req, res) {
  const user = sessionUser(req);
  if (!user) return fail(res, 401, "Cookie is not valid");
  const body = await readJson(req);
  const login = String(body.login || "")
    .trim()
    .toLowerCase();
  if (!login) return send(res, 200, []);
  const exact = db
    .prepare("SELECT * FROM users WHERE id != ? AND lower(login) = ?")
    .get(user.id, login);
  const rows = db
    .prepare(
      `SELECT * FROM users
       WHERE id != ?
         AND (
           instr(lower(login), ?) > 0
           OR instr(lower(first_name), ?) > 0
           OR instr(lower(second_name), ?) > 0
           OR instr(lower(display_name), ?) > 0
         )
       LIMIT 20`
    )
    .all(user.id, login, login, login, login);
  const merged = exact ? [exact, ...rows.filter((row) => row.id !== exact.id)] : rows;
  return send(res, 200, merged.map(publicUser));
}

function getChats(req, res) {
  const user = sessionUser(req);
  if (!user) return fail(res, 401, "Cookie is not valid");
  return send(res, 200, chatList(user.id));
}

async function createChat(req, res) {
  const user = sessionUser(req);
  if (!user) return fail(res, 401, "Cookie is not valid");
  const body = await readJson(req);
  const title = String(body.title || "").trim();
  if (!title) return fail(res, 400, "title is empty, but required");
  const created = db
    .prepare("INSERT INTO chats (title, avatar, created_by, created_at) VALUES (?, NULL, ?, ?)")
    .run(title, user.id, now());
  const id = Number(created.lastInsertRowid);
  db.prepare("INSERT INTO chat_users (chat_id, user_id, role) VALUES (?, ?, 'admin')").run(
    id,
    user.id
  );
  return send(res, 200, { id });
}

async function updateChat(req, res) {
  const user = sessionUser(req);
  if (!user) return fail(res, 401, "Cookie is not valid");
  const body = await readJson(req);
  const chatId = Number(body.chatId);
  if (!memberRole(chatId, user.id)) return fail(res, 403, "You are not a chat member");
  const title = String(body.title || "").trim().slice(0, 100);
  if (!title) return fail(res, 400, "title is empty, but required");
  db.prepare("UPDATE chats SET title = ? WHERE id = ?").run(title, chatId);
  broadcast(chatId, { type: "chat-updated", chatId, title });
  return send(res, 200, "OK");
}

async function deleteChat(req, res) {
  const user = sessionUser(req);
  if (!user) return fail(res, 401, "Cookie is not valid");
  const body = await readJson(req);
  const chatId = Number(body.chatId);
  if (!memberRole(chatId, user.id)) return fail(res, 403, "You are not a chat member");
  broadcast(chatId, { type: "chat-deleted", chatId });
  const room = rooms.get(chatId);
  if (room) {
    [...room].forEach((socket) => socket.close());
  }
  db.prepare("DELETE FROM chats WHERE id = ?").run(chatId);
  return send(res, 200, "OK");
}

async function addUsers(req, res) {
  const user = sessionUser(req);
  if (!user) return fail(res, 401, "Cookie is not valid");
  const body = await readJson(req);
  const chatId = Number(body.chatId);
  if (!memberRole(chatId, user.id)) return fail(res, 403, "You are not a chat member");
  const ids = Array.isArray(body.users) ? body.users.map(Number) : [];
  const insert = db.prepare(
    "INSERT OR IGNORE INTO chat_users (chat_id, user_id, role) VALUES (?, ?, 'regular')"
  );
  ids.forEach((id) => {
    if (findUserById(id)) insert.run(chatId, id);
  });
  return send(res, 200, "OK");
}

async function removeUsers(req, res) {
  const user = sessionUser(req);
  if (!user) return fail(res, 401, "Cookie is not valid");
  const body = await readJson(req);
  const chatId = Number(body.chatId);
  const role = memberRole(chatId, user.id);
  if (!role) return fail(res, 403, "You are not a chat member");
  const ids = Array.isArray(body.users) ? body.users.map(Number) : [];
  const remove = db.prepare("DELETE FROM chat_users WHERE chat_id = ? AND user_id = ?");
  ids.forEach((id) => {
    if (role === "admin" || id === user.id) remove.run(chatId, id);
  });
  return send(res, 200, "OK");
}

function getChatUsers(req, res, chatId) {
  const user = sessionUser(req);
  if (!user) return fail(res, 401, "Cookie is not valid");
  if (!memberRole(Number(chatId), user.id)) return fail(res, 403, "You are not a chat member");
  const rows = db
    .prepare(
      `SELECT users.*, chat_users.role FROM users
       JOIN chat_users ON chat_users.user_id = users.id
       WHERE chat_users.chat_id = ?`
    )
    .all(Number(chatId));
  return send(
    res,
    200,
    rows.map((row) => ({ ...publicUser(row), display_name: row.display_name, role: row.role }))
  );
}

function markRead(req, res, chatId) {
  const user = sessionUser(req);
  if (!user) return fail(res, 401, "Cookie is not valid");
  const id = Number(chatId);
  if (!memberRole(id, user.id)) return fail(res, 403, "You are not a chat member");
  const last = db.prepare("SELECT MAX(id) AS id FROM messages WHERE chat_id = ?").get(id);
  db.prepare(
    `INSERT INTO chat_reads (chat_id, user_id, message_id) VALUES (?, ?, ?)
     ON CONFLICT(chat_id, user_id) DO UPDATE SET
       message_id = MAX(chat_reads.message_id, excluded.message_id)`
  ).run(id, user.id, last?.id || 0);
  pushReadState(id);
  return send(res, 200, "OK");
}

function othersReadId(chatId, userId) {
  const others = db
    .prepare(
      `SELECT COALESCE(chat_reads.message_id, 0) AS message_id
       FROM chat_users
       LEFT JOIN chat_reads
         ON chat_reads.chat_id = chat_users.chat_id
        AND chat_reads.user_id = chat_users.user_id
       WHERE chat_users.chat_id = ? AND chat_users.user_id != ?`
    )
    .all(chatId, userId);
  if (others.length === 0) return 0;
  return others.reduce((min, row) => Math.min(min, row.message_id), others[0].message_id);
}

function pushReadState(chatId) {
  const members = db.prepare("SELECT user_id FROM chat_users WHERE chat_id = ?").all(chatId);
  members.forEach((member) => {
    const sockets = userSockets.get(member.user_id);
    if (!sockets) return;
    const payload = JSON.stringify({
      type: "read",
      chatId: Number(chatId),
      messageId: othersReadId(chatId, member.user_id),
    });
    sockets.forEach((socket) => {
      if (socketChats.get(socket) === Number(chatId) && socket.readyState === 1) {
        socket.send(payload);
      }
    });
  });
}

function chatToken(req, res, chatId) {
  const user = sessionUser(req);
  if (!user) return fail(res, 401, "Cookie is not valid");
  if (!memberRole(Number(chatId), user.id)) return fail(res, 403, "You are not a chat member");
  const value = token();
  db.prepare(
    "INSERT INTO chat_tokens (token, chat_id, user_id, created_at) VALUES (?, ?, ?, ?)"
  ).run(value, Number(chatId), user.id, now());
  return send(res, 200, { token: value });
}

function readResource(req, res, filePath) {
  const full = path.join(uploadDir, filePath);
  if (!full.startsWith(uploadDir) || !existsSync(full)) return fail(res, 404, "File not found");
  const stream = createReadStream(full);
  res.writeHead(200, {
    "Content-Type": imageContentType(filePath),
    "Cache-Control": "private, max-age=3600",
  });
  stream.pipe(res);
  return undefined;
}

const routes = [
  ["POST", /^\/api\/v2\/auth\/signup$/, signup],
  ["POST", /^\/api\/v2\/auth\/signin$/, signin],
  ["POST", /^\/api\/v2\/auth\/logout$/, logout],
  ["GET", /^\/api\/v2\/auth\/user$/, me],
  ["PUT", /^\/api\/v2\/user\/profile$/, updateProfile],
  ["PUT", /^\/api\/v2\/user\/profile\/avatar$/, updateAvatar],
  ["PUT", /^\/api\/v2\/user\/password$/, changePassword],
  ["POST", /^\/api\/v2\/user\/search$/, searchUsers],
  ["GET", /^\/api\/v2\/chats$/, getChats],
  ["POST", /^\/api\/v2\/chats$/, createChat],
  ["PUT", /^\/api\/v2\/chats$/, updateChat],
  ["DELETE", /^\/api\/v2\/chats$/, deleteChat],
  ["PUT", /^\/api\/v2\/chats\/users$/, addUsers],
  ["DELETE", /^\/api\/v2\/chats\/users$/, removeUsers],
  ["GET", /^\/api\/v2\/chats\/(\d+)\/users$/, getChatUsers],
  ["POST", /^\/api\/v2\/chats\/(\d+)\/read$/, markRead],
  ["POST", /^\/api\/v2\/chats\/token\/(\d+)$/, chatToken],
  ["GET", /^\/api\/v2\/resources\/(\d+\/[^/]+)$/, readResource],
];

async function onRequest(req, res) {
  try {
    const url = new URL(req.url || "/", "http://localhost");
    const route = routes.find(
      ([method, pattern]) => method === req.method && pattern.test(url.pathname)
    );
    if (!route) return fail(res, 404, "Not found");
    const match = url.pathname.match(route[1]);
    return await route[2](req, res, match[1]);
  } catch (error) {
    if (error.status === 413) return fail(res, 413, "Payload too large");
    return fail(res, 500, "Server error");
  }
}

function socketMessages(chatId) {
  return db
    .prepare(
      `SELECT id, user_id, chat_id, type, time, content, translation
       FROM messages WHERE chat_id = ? ORDER BY id ASC`
    )
    .all(chatId);
}

function joinRoom(chatId, userId, socket) {
  const key = Number(chatId);
  if (!rooms.has(key)) rooms.set(key, new Set());
  rooms.get(key).add(socket);
  socketChats.set(socket, key);
  if (!userSockets.has(userId)) userSockets.set(userId, new Set());
  userSockets.get(userId).add(socket);
}

function notifyOthers(chatId, senderId, content, translation, update) {
  const chat = db.prepare("SELECT title FROM chats WHERE id = ?").get(Number(chatId));
  const author = db
    .prepare("SELECT first_name, second_name FROM users WHERE id = ?")
    .get(senderId);
  const payload = JSON.stringify({
    type: "incoming",
    chatId: Number(chatId),
    content,
    translation: translation || "",
    title: chat?.title || "URUS",
    author: [author?.first_name, author?.second_name].filter(Boolean).join(" "),
    update: Boolean(update),
  });
  const members = db.prepare("SELECT user_id FROM chat_users WHERE chat_id = ?").all(Number(chatId));
  members.forEach((member) => {
    if (member.user_id === senderId) return;
    const sockets = userSockets.get(member.user_id);
    if (!sockets) return;
    sockets.forEach((socket) => {
      if (socketChats.get(socket) === Number(chatId)) return;
      if (socket.readyState === 1) socket.send(payload);
    });
  });
}

async function handleSocketMessage(socket, chatId, userId, raw) {
  let body;
  try {
    body = JSON.parse(String(raw));
  } catch {
    return;
  }
  if (body.type === "locale") {
    saveLocale(userId, String(body.locale || ""));
    return;
  }
  if (body.type === "get old") {
    socket.send(JSON.stringify(socketMessages(chatId)));
    socket.send(
      JSON.stringify({
        type: "read",
        chatId: Number(chatId),
        messageId: othersReadId(chatId, userId),
      })
    );
    return;
  }
  if (body.type !== "message") return;
  const content = String(body.content || "").trim();
  if (!content) return;
  saveLocale(userId, String(body.locale || ""));
  const time = now();
  const saved = db
    .prepare(
      `INSERT INTO messages (chat_id, user_id, type, content, translation, time)
       VALUES (?, ?, 'message', ?, '', ?)`
    )
    .run(chatId, userId, content, time);
  const messageId = Number(saved.lastInsertRowid);
  broadcast(chatId, {
    id: messageId,
    user_id: userId,
    chat_id: chatId,
    type: "message",
    time,
    content,
    translation: "",
  });
  notifyOthers(chatId, userId, content, "", false);
  const source = textLanguage(content);
  const target = recipientLanguage(chatId, userId, source);
  if (target && target !== source) {
    publishTranslation(messageId, chatId, userId, content, target);
  }
}

function publishTranslation(messageId, chatId, userId, content, target) {
  translateMessage(content.slice(0, 4000), target)
    .then((translation) => {
      if (!translation) return;
      db.prepare("UPDATE messages SET translation = ? WHERE id = ?").run(translation, messageId);
      broadcast(chatId, {
        type: "message-translated",
        id: messageId,
        chat_id: chatId,
        translation,
      });
      notifyOthers(chatId, userId, content, translation, true);
    })
    .catch((error) => {
      const message = error instanceof Error ? error.message : "error";
      process.stderr.write(`translate failed ${message}\n`);
    });
}

function leaveRoom(socket) {
  const chatId = socketChats.get(socket);
  const room = rooms.get(chatId);
  if (room) {
    room.delete(socket);
    if (room.size === 0) rooms.delete(chatId);
  }
  userSockets.forEach((sockets, userId) => {
    sockets.delete(socket);
    if (sockets.size === 0) userSockets.delete(userId);
  });
}

function broadcast(chatId, payload) {
  const room = rooms.get(Number(chatId));
  if (!room) return;
  const data = JSON.stringify(payload);
  room.forEach((socket) => {
    if (socket.readyState === 1) socket.send(data);
  });
}

const server = createServer((req, res) => {
  onRequest(req, res);
});

const sockets = new WebSocketServer({ server });

sockets.on("connection", (socket, req) => {
  const url = new URL(req.url || "/", "http://localhost");
  const match = url.pathname.match(/^\/ws\/chats\/(\d+)\/(\d+)\/([^/]+)$/);
  if (!match) {
    socket.close();
    return;
  }
  const userId = Number(match[1]);
  const chatId = Number(match[2]);
  const row = db
    .prepare("SELECT user_id FROM chat_tokens WHERE token = ? AND chat_id = ?")
    .get(match[3], chatId);
  if (!row || row.user_id !== userId || !memberRole(chatId, userId)) {
    socket.close();
    return;
  }
  joinRoom(chatId, userId, socket);
  socket.on("message", (raw) => {
    const text = String(raw);
    handleSocketMessage(socket, chatId, userId, text).catch((error) => {
      const message = error instanceof Error ? error.message : "error";
      process.stderr.write(`message failed ${message}\n`);
    });
  });
  socket.on("close", () => leaveRoom(socket));
});

server.listen(PORT, HOST, () => {
  process.stdout.write(`uruschat server http://${HOST}:${PORT}\n`);
});
