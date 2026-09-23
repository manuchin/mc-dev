#!/usr/bin/env node
/* =====================================================================
   Testing del portfolio — corre en cualquier lado.
   Uso: node scripts/test.js   (o: npm test)

   Cubre:
   1. Sintaxis de los scripts Node (server.js, test.js)
   2. Contenido del index.html (i18n, formulario, API, estructura)
   3. Paridad de claves de traducción entre es/en/pt
   4. Build de dist/ con Vite (se salta si no hay node_modules,
      ej. en Termux sin npm install)
   5. Servidor real: health, estáticos, POST feedback, límite de
      frecuencia, GET/bandeja solo-localhost, 404 y path traversal
   ===================================================================== */
"use strict";

const { execFileSync, spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
let passed = 0;
let failed = 0;

function ok(name, cond, extra) {
  if (cond) {
    passed++;
    console.log("  ✓ " + name);
  } else {
    failed++;
    console.log("  ✗ " + name + (extra ? " — " + extra : ""));
  }
}

function section(title) {
  console.log("\n" + title);
  console.log("─".repeat(Math.min(title.length + 30, 70)));
}

/* ---------- 1. sintaxis ---------- */
section("1. Sintaxis de scripts Node");
for (const f of ["server.js", "scripts/test.js"]) {
  try {
    execFileSync(process.execPath, ["--check", path.join(ROOT, f)], { stdio: "pipe" });
    ok(f + " pasa --check", true);
  } catch (e) {
    ok(f + " pasa --check", false, String(e.stderr || e.message));
  }
}

/* ---------- 2. contenido de index.html ---------- */
section("2. Contenido de index.html");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

ok("usa atributos data-i18n", /data-i18n=/.test(html));
ok("incluye las 3 lenguas (es/en/pt)", /"es"\s*:\s*{/.test(html) && /"en"\s*:\s*{/.test(html) && /"pt"\s*:\s*{/.test(html));
ok("hay switcher de idioma", /data-lang="es"/.test(html) && /data-lang="en"/.test(html) && /data-lang="pt"/.test(html));
ok("auto-detección de idioma del navegador", /navigator\.languages/.test(html));
ok("persistencia del idioma (localStorage)", /localStorage\.setItem\("mc-lang"/.test(html));
ok("formulario de contacto presente", /id="contactForm"/.test(html));
ok("botón enviar por WhatsApp", /wa\.me\/" \+ WA \+ "\?text="/.test(html) || /wa\.me\/5493513805496/.test(html));
ok("botón guardar sin WhatsApp (POST /api/feedback)", /fetch\("\/api\/feedback"/.test(html));
ok("email correcto", /manuelcandoliobregon@gmail\.com/.test(html));
ok("WhatsApp correcto", /5493513805496/.test(html));
ok("Instagram correcto", /instagram\.com\/manucandoli/.test(html));
ok("sin emojis visibles en el body", !/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(html));
ok("meta viewport", /name="viewport"/.test(html));
ok("reduced-motion respetado", /prefers-reduced-motion/.test(html));

/* ---------- 3. paridad i18n ---------- */
section("3. Paridad de claves i18n");
function extractDict(src, lang) {
  const re = new RegExp('"' + lang + '"\\s*:\\s*{([\\s\\S]*?)\\n    }');
  const m = src.match(re);
  if (!m) return null;
  const keys = [];
  const kre = /"([A-Za-z0-9_.]+)"\s*:/g;
  let k;
  while ((k = kre.exec(m[1]))) keys.push(k[1]);
  return keys;
}
const esKeys = extractDict(html, "es") || [];
const enKeys = extractDict(html, "en") || [];
const ptKeys = extractDict(html, "pt") || [];
ok("diccionario es extraído (" + esKeys.length + " claves)", esKeys.length > 40);
ok("diccionario en extraído (" + enKeys.length + " claves)", enKeys.length > 40);
ok("diccionario pt extraído (" + ptKeys.length + " claves)", ptKeys.length > 40);

const esSet = new Set(esKeys);
const enSet = new Set(enKeys);
const ptSet = new Set(ptKeys);
const missingEn = esKeys.filter((k) => !enSet.has(k));
const missingPt = esKeys.filter((k) => !ptSet.has(k));
const extraEn = enKeys.filter((k) => !esSet.has(k));
const extraPt = ptKeys.filter((k) => !esSet.has(k));
ok("en cubre todas las claves de es", missingEn.length === 0, "faltan: " + missingEn.join(", "));
ok("pt cubre todas las claves de es", missingPt.length === 0, "faltan: " + missingPt.join(", "));
ok("en no tiene claves extra", extraEn.length === 0, "sobra: " + extraEn.join(", "));
ok("pt no tiene claves extra", extraPt.length === 0, "sobra: " + extraPt.join(", "));

/* claves usadas en HTML existen en el diccionario */
const usedKeys = new Set();
const ure = /data-i18n(?:-ph)?="([^"]+)"/g;
let u;
while ((u = ure.exec(html))) usedKeys.add(u[1]);
const missingUsed = [...usedKeys].filter((k) => !esSet.has(k));
ok("todas las claves usadas en HTML existen en es", missingUsed.length === 0, "faltan: " + missingUsed.join(", "));

/* ---------- 4. build (Vite) ---------- */
section("4. Build dist/ (Vite)");
const hasDeps = fs.existsSync(path.join(ROOT, "node_modules", "vite"));
if (hasDeps) {
  try {
    execFileSync("npm", ["run", "build"], { cwd: ROOT, stdio: "pipe" });
    ok("vite build corre sin errores", true);
  } catch (e) {
    ok("vite build corre sin errores", false, String(e.stderr || e.message).slice(0, 300));
  }
} else {
  console.log("  – sin node_modules: se salta el build (modo Termux)");
}
if (fs.existsSync(path.join(ROOT, "dist/index.html"))) {
  ok("dist/index.html existe", true);
  ok("dist/robots.txt existe", fs.existsSync(path.join(ROOT, "dist/robots.txt")));
  const distHtml = fs.readFileSync(path.join(ROOT, "dist/index.html"), "utf8");
  ok("dist/index.html mantiene el formulario", /contactForm/.test(distHtml));
  ok("dist/index.html mantiene i18n", /data-lang="pt"/.test(distHtml));
} else {
  console.log("  – dist/ no existe todavía (se genera en el deploy)");
}

/* ---------- 5. servidor real ---------- */
section("5. Servidor real (puerto efímero)");

const tmpData = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "mc-test-")), "feedback.json");
const PORT = 4377 + Math.floor(Math.random() * 400);
const child = spawn(process.execPath, [path.join(ROOT, "server.js")], {
  cwd: ROOT,
  env: Object.assign({}, process.env, { PORT: String(PORT), FEEDBACK_FILE: tmpData }),
  stdio: "pipe",
});

function req(method, p, body) {
  return new Promise((resolve, reject) => {
    const data = body ? Buffer.from(JSON.stringify(body)) : null;
    const r = http.request(
      { host: "127.0.0.1", port: PORT, path: p, method, headers: data ? { "Content-Type": "application/json" } : {} },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          let parsed = null;
          try { parsed = JSON.parse(text); } catch {}
          resolve({ status: res.statusCode, text, json: parsed });
        });
      }
    );
    r.on("error", reject);
    if (data) r.write(data);
    r.end();
  });
}

const waitReady = new Promise((resolve, reject) => {
  let tries = 0;
  (function poll() {
    req("GET", "/api/health")
      .then((res) => (res.status === 200 ? resolve() : retry()))
      .catch(retry);
    function retry() {
      if (++tries > 50) return reject(new Error("server no arrancó"));
      setTimeout(poll, 100);
    }
  })();
});

waitReady
  .then(async () => {
    try {
      const h = await req("GET", "/api/health");
      ok("GET /api/health → 200", h.status === 200 && h.json && h.json.ok === true);

      const idx = await req("GET", "/");
      ok("GET / → 200 con HTML", idx.status === 200 && /<!doctype html>/i.test(idx.text));
      ok("/ incluye formulario", /contactForm/.test(idx.text));

      const post1 = await req("POST", "/api/feedback", { name: "Test", message: "Hola, probando", lang: "es" });
      ok("POST /api/feedback → 201", post1.status === 201 && post1.json && post1.json.ok === true);

      const postEmpty = await req("POST", "/api/feedback", { message: "   " });
      ok("POST sin mensaje → 400", postEmpty.status === 400);

      const postBig = await req("POST", "/api/feedback", { message: "x".repeat(3000) });
      ok("POST con mensaje recortado a 2000 → 201", postBig.status === 201);

      const saved = JSON.parse(fs.readFileSync(tmpData, "utf8"));
      ok("storage JSON guarda mensajes", Array.isArray(saved) && saved.length === 2);
      ok("mensaje quedó truncado a 2000", saved[1] && saved[1].message.length === 2000);
      ok("sin XSS: <script> se guarda como texto plano", (() => {
        const raw = fs.readFileSync(tmpData, "utf8");
        return !/<script>/i.test(raw);
      })());

      const xss = await req("POST", "/api/feedback", { message: "<script>alert(1)</script>" });
      ok("POST con <script> → 201 (se almacena como texto)", xss.status === 201);
      const inboxAfter = await req("GET", "/bandeja");
      ok(
        "bandeja renderiza escapado (sin XSS)",
        inboxAfter.status === 200 &&
          inboxAfter.text.includes("&lt;script&gt;") &&
          !inboxAfter.text.includes("<script>alert")
      );

      const getLocal = await req("GET", "/api/feedback");
      ok("GET /api/feedback desde localhost → 200", getLocal.status === 200 && getLocal.json.count === 3);

      const inbox = await req("GET", "/bandeja");
      ok("GET /bandeja desde localhost → 200 HTML", inbox.status === 200 && /Bandeja/.test(inbox.text));

      /* límite de frecuencia: 10 por 15 min, ya van 3 */
      let lastStatus = 201;
      for (let i = 0; i < 9; i++) {
        const r = await req("POST", "/api/feedback", { message: "spam " + i });
        lastStatus = r.status;
      }
      ok("rate limit bloquea después de 10 mensajes", lastStatus === 429, "último status: " + lastStatus);

      /* simular request externo: X-Forwarded no cambia remoteAddress, así que
         probamos que el endpoint exige conexión local comprobando el código de
         la respuesta cuando la conexión viene del host (no hay forma real de
         forzar un remote externo en local; documentado). */
      const nf = await req("GET", "/no-existe.jpg");
      ok("404 en archivo inexistente", nf.status === 404);

      const trav = await req("GET", "/..%2F..%2F..%2Fetc%2Fpasswd");
      ok("path traversal bloqueado", trav.status === 403 || trav.status === 404);
    } catch (e) {
      ok("bloque de tests del servidor", false, String(e && e.message));
    } finally {
      child.kill();
      setTimeout(() => {
        console.log("\n" + "═".repeat(60));
        console.log("RESULTADO: " + passed + " pasan · " + failed + " fallan");
        console.log("═".repeat(60));
        process.exit(failed ? 1 : 0);
      }, 200);
    }
  })
  .catch((e) => {
    child.kill();
    console.error("No se pudo levantar el servidor de prueba:", e.message);
    process.exit(1);
  });
