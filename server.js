#!/usr/bin/env node
/* =====================================================================
   Servidor estático + bandeja de mensajes, sin dependencias.

   - Sirve dist/ (build de Vite) si existe; si no, el index.html raíz.
     En Termux alcanza con git pull + node server.js: dist/ está versionado.
   - POST /api/feedback   → guarda mensajes de visitantes (data/feedback.json)
   - GET  /api/feedback   → lista los mensajes (SOLO desde localhost)
   - GET  /bandeja        → bandeja legible (SOLO desde localhost)
   - GET  /api/health     → check rápido para scripts

   Blindaje (probado en scripts/test.js):
   - Cabeceras de seguridad en todas las respuestas.
   - data/, .env*, server.js, configs y scripts/ NUNCA se sirven como
     archivos estáticos (la bandeja se lee por /bandeja, solo localhost).
   - Byte nulo, traversal y métodos raros rechazados.
   - Base de datos con tope de 500 mensajes y escritura atómica.
   ===================================================================== */
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const https = require("https");

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 4173;
const HOST = "0.0.0.0";
const DATA_FILE = process.env.FEEDBACK_FILE || path.join(ROOT, "data", "feedback.json");
const BODY_LIMIT = 10 * 1024; // 10 KB
const MAX_MESSAGES = 500;

/* Aviso por email (opcional): si existe RESEND_API_KEY, cada mensaje que
   llega a la bandeja avisa a NOTIFY_EMAIL con un mailto de respuesta listo.
   Sin la key, todo sigue funcionando igual — la bandeja es la fuente. */
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || "manuelcandoliobregon@gmail.com";
const OWNER_NAME = "Manuel";

/* Sirve dist/ (build de Vite) si existe; si no, el index.html raíz. */
const STATIC_ROOT = fs.existsSync(path.join(ROOT, "dist", "index.html"))
  ? path.join(ROOT, "dist")
  : ROOT;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

/* Cabeceras de seguridad en TODAS las respuestas. */
const SEC = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

/* ---------- archivos que nunca se sirven ---------- */
const BLOCKED_EXACT = new Set([
  "server.js",
  "package.json",
  "package-lock.json",
  "bun.lock",
  "components.json",
  "postcss.config.cjs",
  "tailwind.config.js",
  "vite.config.mjs",
  "readme.md",
]);
const BLOCKED_PREFIX = ["data/", "scripts/", ".git/"];

function isBlockedRepoPath(rel) {
  const norm = rel.replace(/\\/g, "/").toLowerCase();
  if (norm.split("/").some((part) => part.startsWith("."))) return true; // .env, .env.local, .gitignore, ...
  if (BLOCKED_EXACT.has(norm)) return true;
  return BLOCKED_PREFIX.some((p) => norm.startsWith(p));
}

/* ---------- storage: lista de mensajes en JSON ---------- */
function loadFeedback() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveFeedback(list) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  const tmp = DATA_FILE + ".tmp-" + crypto.randomBytes(4).toString("hex");
  fs.writeFileSync(tmp, JSON.stringify(list, null, 2), "utf8");
  fs.renameSync(tmp, DATA_FILE); // escritura atómica: nunca corrompe el archivo
}

/* ---------- límite de frecuencia por IP (memoria, sin deps) ---------- */
const hits = new Map();
function tooManyRequests(ip) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const arr = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  if (arr.length >= 10) {
    hits.set(ip, arr);
    return true;
  }
  arr.push(now);
  hits.set(ip, arr);
  return false;
}

/* ---------- helpers ---------- */
function notifyByEmail(entry) {
  if (!RESEND_API_KEY) return; // sin key: silencioso, la bandeja es la fuente
  const subject =
    "Nuevo mensaje del portfolio" + (entry.name ? " — " + entry.name : "") +
    (entry.lang ? " [" + entry.lang + "]" : "");
  const lines = [
    entry.message,
    "",
    "— — —",
    "Nombre: " + (entry.name || "(no dijo)"),
    "Contacto para responder: " + (entry.reply || "(NO DEJO CONTACTO — responder por la bandeja no aplica)"),
    "Idioma: " + (entry.lang || "?") + " · Página: " + (entry.page || "local"),
    "Fecha: " + entry.ts,
  ];
  const payload = JSON.stringify({
    from: "Portfolio <onboarding@resend.dev>",
    to: [NOTIFY_EMAIL],
    subject,
    text: lines.join("\n"),
  });
  const req = https.request(
    {
      hostname: "api.resend.com",
      path: "/emails",
      method: "POST",
      headers: {
        "Authorization": "Bearer " + RESEND_API_KEY,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
      timeout: 8000,
    },
    (r) => { r.resume(); } // drenar respuesta
  );
  req.on("error", () => {}); // nunca romper el guardado por un fallo de email
  req.on("timeout", () => req.destroy());
  req.end(payload);
}

function json(res, code, obj) {
  res.writeHead(code, Object.assign({ "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }, SEC));
  res.end(JSON.stringify(obj));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > BODY_LIMIT) {
        reject(new Error("body too large"));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function isLocal(req) {
  const ra = req.socket.remoteAddress || "";
  return ra === "127.0.0.1" || ra === "::1" || ra === "::ffff:127.0.0.1";
}

function clean(str, max) {
  return String(str || "").replace(/\s+/g, " ").trim().slice(0, max);
}

/* ---------- bandeja HTML (solo localhost) ---------- */
function inboxHtml(list) {
  const rows = list
    .map((m) => {
      const when = new Date(m.ts).toLocaleString("es-AR");
      const name = m.name ? "<b>" + escapeHtml(m.name) + "</b> — " : "";
      const lang = m.lang ? ' <span style="color:#565e66">[' + escapeHtml(m.lang) + "]</span>" : "";
      const page = m.page && !/localhost/.test(m.page)
        ? ' <span style="color:#565e66">(desde ' + escapeHtml(m.page) + ")</span>" : "";
      /* cómo responderle a esta persona */
      const contact = (m.reply || "").trim();
      let replyBtn = '<span style="color:#8a929a;font:13px Arial,sans-serif">Sin contacto — se perdió</span>';
      if (contact) {
        const digits = contact.replace(/\D/g, "");
        const looksPhone = digits.length >= 8 && !contact.includes("@");
        const looksMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
        if (looksMail) {
          replyBtn =
            '<a href="mailto:' + escapeHtml(contact) + '?subject=' + encodeURIComponent("Tu mensaje del portfolio") +
            '" style="display:inline-block;margin-top:8px;background:#38bdf8;color:#04121b;font:bold 13px Arial,sans-serif;padding:8px 14px;border-radius:6px;text-decoration:none">RESPONDER POR EMAIL</a>';
        } else if (looksPhone) {
          let wa = digits;
          if (wa.length === 10) wa = "54" + wa; // móvil argentino sin país
          replyBtn =
            '<a href="https://wa.me/' + wa + '?text=' + encodeURIComponent("Hola! Soy Manuel, te escribo por tu mensaje del portfolio.") +
            '" target="_blank" style="display:inline-block;margin-top:8px;background:#38bdf8;color:#04121b;font:bold 13px Arial,sans-serif;padding:8px 14px;border-radius:6px;text-decoration:none">RESPONDER POR WHATSAPP</a>';
        } else {
          replyBtn = '<span style="font:13px Arial,sans-serif;color:#e8eaed">Contacto tal cual: <b>' + escapeHtml(contact) + "</b></span>";
        }
      }
      return (
        '<li style="margin:0 0 18px">' +
        '<div style="font:11px monospace;color:#565e66;letter-spacing:.08em">' +
        escapeHtml(when) + lang + page + "</div>" +
        '<div style="font:17px Arial,sans-serif;color:#e8eaed;margin:4px 0 0">' + name +
        escapeHtml(m.message) + "</div>" +
        '<div style="margin-top:6px">' + replyBtn + "</div></li>"
      );
    })
    .reverse()
    .join("\n");

  return "<!doctype html><html lang=\"es\"><head><meta charset=\"utf-8\">" +
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />" +
    "<title>Bandeja — Manuel Candoli</title></head>" +
    "<body style=\"margin:0;background:#0a0a0a;padding:40px 24px\">" +
    "<div style=\"max-width:720px;margin:0 auto\">" +
    "<h1 style=\"font:600 34px Arial,sans-serif;color:#38bdf8;margin:0 0 6px\">Bandeja de mensajes</h1>" +
    "<p style=\"font:12px monospace;color:#565e66;letter-spacing:.14em;margin:0 0 30px\">" +
    list.length + " MENSAJE(S) · SOLO VOS VES ESTO (ES LOCAL)</p>" +
    "<ul style=\"list-style:none;padding:0;margin:0\">" +
    (rows || '<li style="color:#8a929a;font:16px Arial,sans-serif">Todavía no hay mensajes.</li>') +
    "</ul></div></body></html>";
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/* ---------- servidor ---------- */
const server = http.createServer(async (req, res) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch {
    json(res, 400, { ok: false, error: "bad request" });
    return;
  }
  if (urlPath.indexOf("\0") !== -1) {
    json(res, 400, { ok: false, error: "bad request" });
    return;
  }
  urlPath = path.posix.normalize(urlPath);
  if (urlPath.startsWith("..") || urlPath.includes("../")) {
    json(res, 403, { ok: false, error: "forbidden" });
    return;
  }

  const ip = req.socket.remoteAddress || "?";

  /* ---- API: guardar mensaje (público, con límite de frecuencia) ---- */
  if (req.method === "POST" && urlPath === "/api/feedback") {
    if (tooManyRequests(ip)) {
      json(res, 429, { ok: false, error: "too many requests" });
      return;
    }
    try {
      const body = JSON.parse((await readBody(req)) || "{}");
      const message = clean(body.message, 2000);
      if (!message) {
        json(res, 400, { ok: false, error: "message required" });
        return;
      }
      const entry = {
        id: crypto.randomBytes(6).toString("hex"),
        ts: new Date().toISOString(),
        name: clean(body.name, 80),
        reply: clean(body.reply, 120),
        message,
        lang: clean(body.lang, 5),
        page: clean(body.page, 120),
      };
      const list = loadFeedback();
      list.push(entry);
      if (list.length > MAX_MESSAGES) list.splice(0, list.length - MAX_MESSAGES);
      saveFeedback(list);
      notifyByEmail(entry);
      json(res, 201, { ok: true, id: entry.id });
    } catch {
      json(res, 400, { ok: false, error: "invalid body" });
    }
    return;
  }

  /* ---- API + bandeja: solo desde la propia máquina ---- */
  if (urlPath === "/api/feedback" || urlPath === "/bandeja") {
    if (!isLocal(req)) {
      json(res, 403, { ok: false, error: "local only" });
      return;
    }
    const list = loadFeedback();
    if (urlPath === "/bandeja") {
      res.writeHead(200, Object.assign({ "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" }, SEC));
      res.end(inboxHtml(list));
    } else {
      json(res, 200, { ok: true, count: list.length, items: list.reverse() });
    }
    return;
  }

  if (req.method === "GET" && urlPath === "/api/health") {
    json(res, 200, { ok: true });
    return;
  }

  /* ---- archivos estáticos ---- */
  if (req.method !== "GET" && req.method !== "HEAD") {
    json(res, 405, { ok: false, error: "method not allowed" });
    return;
  }

  if (urlPath.endsWith("/")) urlPath += "index.html";
  let filePath = null;

  /* prioridad: dist/ (build de Vite) si existe ahí; fallback al repo */
  if (STATIC_ROOT !== ROOT) {
    const inDist = path.normalize(path.join(STATIC_ROOT, urlPath));
    if (inDist.startsWith(STATIC_ROOT) && fs.existsSync(inDist)) {
      filePath = inDist;
    }
  }
  if (!filePath) {
    const inRepo = path.normalize(path.join(ROOT, urlPath));
    if (!inRepo.startsWith(ROOT)) {
      res.writeHead(403, SEC).end("Forbidden");
      return;
    }
    const rel = path.relative(ROOT, inRepo);
    if (isBlockedRepoPath(rel)) {
      res.writeHead(403, SEC).end("Forbidden");
      return;
    }
    if (fs.existsSync(inRepo)) {
      filePath = inRepo;
    }
  }
  if (!filePath) {
    res.writeHead(404, Object.assign({ "Content-Type": "text/plain; charset=utf-8" }, SEC)).end("404 — no encontrado");
    return;
  }

  fs.readFile(filePath, (readErr, data) => {
    if (readErr) {
      res.writeHead(404, Object.assign({ "Content-Type": "text/plain; charset=utf-8" }, SEC)).end("404 — no encontrado");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, Object.assign({
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": "no-cache",
    }, SEC));
    res.end(req.method === "HEAD" ? undefined : data);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Portfolio corriendo en http://localhost:${PORT}`);
  console.log(`Bandeja de mensajes: http://localhost:${PORT}/bandeja (solo en tu máquina)`);
});
