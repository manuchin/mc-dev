import { query } from "./_generated/server.js";
import { v } from "convex/values";

/* Bandeja protegida: solo responde con la clave de admin correcta
   (ADMIN_TOKEN, la guarda Manuel en Freebuff → Settings → Environment).
   Lee los mensajes, más nuevos primero, + estadísticas simples.
   Todo también se puede ver en el dashboard de Convex. */
export const list = query({
  args: {
    adminKey: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (!args.adminKey || args.adminKey !== process.env.ADMIN_TOKEN) {
      return { ok: false, error: "unauthorized" };
    }
    const limit = Math.min(args.limit || 500, 500);
    const rows = await ctx.db
      .query("messages")
      .withIndex("by_ts")
      .order("desc")
      .take(limit);
    const pending = rows.filter((m) => !m.answered).length;
    return {
      ok: true,
      count: rows.length,
      pending,
      items: rows.map((m) => ({
        id: m._id,
        ts: new Date(m.ts).toISOString(),
        name: m.name,
        reply: m.reply,
        message: m.message,
        lang: m.lang,
        page: m.page,
        answered: m.answered,
      })),
    };
  },
});
