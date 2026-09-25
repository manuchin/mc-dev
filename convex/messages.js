import { mutation } from "./_generated/server.js";
import { v } from "convex/values";

/* La IP viaja dentro del body (la agrega http.js): Convex no la expone
   directo en las mutations por HTTP actions. */

/* Límite de frecuencia por IP: 10 mensajes cada 15 minutos.
   Cero dependencias. */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_WINDOW = 10;

function clean(str, max) {
  return String(str || "").replace(/\s+/g, " ").trim().slice(0, max);
}

export const save = mutation({
  args: {
    name: v.optional(v.string()),
    reply: v.optional(v.string()),
    message: v.string(),
    lang: v.optional(v.string()),
    page: v.optional(v.string()),
    clientIp: v.optional(v.string()),
    hp: v.optional(v.string()), // honeypot: si viene lleno, era un bot
  },
  handler: async (ctx, args) => {
    /* Honeypot: campo invisible para humanos. Un bot lo llena → lo
       aceptamos con 200 pero no guardamos nada. */
    if (clean(args.hp, 80)) return { ok: true, ignored: true };

    const message = clean(args.message, 2000);
    if (!message) throw new Error("message required");

    /* Rate limit: contamos mensajes recientes de esta IP. */
    const ip = args.clientIp || "?";
    const cutoff = Date.now() - WINDOW_MS;
    const recent = await ctx.db
      .query("messages")
      .withIndex("by_ts", (q) => q.gt("ts", cutoff))
      .collect();
    const fromThisIp = recent.filter((m) => m.ip === ip);
    if (fromThisIp.length >= MAX_PER_WINDOW) {
      throw new Error("too many requests");
    }

    const id = await ctx.db.insert("messages", {
      name: clean(args.name, 80),
      reply: clean(args.reply, 120),
      message,
      lang: clean(args.lang, 5),
      page: clean(args.page, 120),
      ip,
      answered: false,
      ts: Date.now(),
    });
    return { ok: true, id };
  },
});
