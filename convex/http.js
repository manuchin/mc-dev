import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server.js";
import { api } from "./_generated/api.js";

/* Endpoint público: POST /api/feedback
   El navegador manda un fetch común, sin SDK ni keys en el cliente.
   La validación y el rate limit corren server-side en la mutation. */
const http = httpRouter();

http.route({
  path: "/api/feedback",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      /* Honeypot anti-spam: campo invisible para humanos, los bots lo llenan. */
      const hp = typeof body.hp === "string" ? body.hp : "";

      /* IP real detrás de proxies: Freebuff/Vercel/etc. la mandan en headers. */
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        "?";

      const result = await ctx.runMutation(api.messages.save, {
        name: body.name,
        reply: body.reply,
        message: body.message,
        lang: body.lang,
        page: body.page,
        clientIp: ip,
        hp,
      });

      return new Response(JSON.stringify(result), {
        status: 201,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (err) {
      const msg = String(err && err.message ? err.message : err);
      const status = msg.includes("too many requests") ? 429 : 400;
      return new Response(JSON.stringify({ ok: false, error: msg }), {
        status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  }),
});

/* CORS preflight para que el navegador del sitio pueda llamar directo. */
http.route({
  path: "/api/feedback",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      },
    });
  }),
});

export default http;
