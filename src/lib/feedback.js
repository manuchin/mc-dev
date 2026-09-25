/* Una sola función de guardado para todo el sitio (Contact + ProjectModal).

   Cadena de fallback honesta:
   1. Base de datos real (Convex): si hay backend configurado
      (VITE_CONVEX_URL, la inyecta Vite al compilar), el mensaje va ahí,
      con honeypot y límite de frecuencia server-side.
   2. Si Convex no responde (backend dormido, Termux), usa el
      /api/feedback local de server.js (JSON con tope de 500 y
      escritura atómica).
   3. Si tampoco existe (hosting estático puro sin API), tira error y
      la UI avisa con el toast de fallo — nunca se finge éxito.

   Ojo: los errores de validación o límite de frecuencia (400/429) NO
   hacen fallback: son respuestas autoritativas del backend. */

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;

async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const ct = res.headers.get("content-type") || "";
  if (!res.ok || ct.indexOf("application/json") === -1) {
    const e = new Error("no api");
    e.status = res.status; // conservamos el código: 400/429 son respuestas reales
    throw e;
  }
  const data = await res.json();
  if (!data || data.ok !== true) {
    const e = new Error("bad payload");
    e.status = res.status;
    throw e;
  }
  return data;
}

export async function saveMessage(fields) {
  const payload = { ...fields };

  /* Honeypot anti-spam: input invisible para personas (afuera del
     layout); los bots que autocompletan lo llenan y el server descarta
     el mensaje sin romper nada. */
  const hpEl = typeof document !== "undefined" ? document.getElementById("hp-field") : null;
  if (hpEl && hpEl.value) payload.hp = hpEl.value;

  if (CONVEX_URL) {
    try {
      await postJson(CONVEX_URL.replace(/\/$/, "") + "/api/feedback", payload);
      return "saved";
    } catch (err) {
      /* 400/429 son respuestas autoritativas del backend (validación o
         límite de frecuencia): no se reintentan contra el local. */
      if (err && (err.status === 400 || err.status === 429)) throw err;
    }
  }

  await postJson("/api/feedback", payload);
  return "saved";
}
