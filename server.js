#!/usr/bin/env node
/* =====================================================================
   Servidor estático + bandeja de mensajes, sin dependencias.
   - Sirve el portfolio (index.html) y archivos estáticos.
   - POST /api/feedback   → guarda mensajes de visitantes (data/feedback.json)
   - GET  /api/feedback   → lista los mensajes (SOLO desde localhost)
   - GET  /bandeja        → bandeja legible (SOLO desde localhost)
   - GET  /api/health     → check rápido para scripts

   Uso: node server.js   (usa process.env.PORT o 4173)
   Base de datos: data/feedback.json — un archivo JSON simple, cero deps.
   ===================================================================== */
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 4173;
const HOST = "0.0.0.0";
const DATA_FILE = process.env.FEEDBACK_FILE || path.join(ROOT, "data", "feedback.json");
const BODY_LIMIT = 10 * 1024; // 10 KB

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
function json(res, code, obj) {
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
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
      const lang = m.lang ? ' <span style="color:#5b6357">[' + escapeHtml(m.lang) + "]</span>" : "";
      const page = m.page && !/localhost/.test(m.page)
        ? ' <span style="color:#5b6357">(desde ' + escapeHtml(m.page) + ")</span>" : "";
      return (
        '<li style="margin:0 0 18px">' +
        '<div style="font:11px monospace;color:#8f9686;letter-spacing:.08em">' +
        escapeHtml(when) + lang + page + "</div>" +
        '<div style="font:17px Georgia,serif;color:#e9e6da;margin:4px 0 0">' + name +
        escapeHtml(m.message) + "</div></li>"
      );
    })
    .reverse()
    .join("\n");

  return "<!doctype html><html lang=\"es\"><head><meta charset=\"utf-8\">" +
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />" +
    "<title>Bandeja — Manuel Candoli</title></head>" +
    "<body style=\"margin:0;background:#0d0f0d;padding:40px 24px\">" +
    "<div style=\"max-width:720px;margin:0 auto\">" +
    "<h1 style=\"font:400 34px Georgia,serif;color:#c9f25e;margin:0 0 6px\">Bandeja de mensajes</h1>" +
    "<p style=\"font:12px monospace;color:#5b6357;letter-spacing:.14em;margin:0 0 30px\">" +
    list.length + " MENSAJE(S) · SOLO VOS VES ESTO (ES LOCAL)</p>" +
    "<ul style=\"list-style:none;padding:0;margin:0\">" +
    (rows || '<li style="color:#8f9686;font:16px Georgia,serif">Todavía no hay mensajes.</li>') +
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
        message,
        lang: clean(body.lang, 5),
        page: clean(body.page, 120),
      };
      const list = loadFeedback();
      list.push(entry);
      saveFeedback(list);
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
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
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
  const filePath = path.normalize(path.join(ROOT, urlPath));

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403).end("Forbidden");
    return;
  }

  fs.readFile(filePath, (readErr, data) => {
    if (readErr) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("404 — no encontrado");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    res.end(data);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Portfolio corriendo en http://${HOST}:${PORT}`);
  console.log(`Bandeja de mensajes: http://localhost:${PORT}/bandeja (solo en tu máquina)`);
});
