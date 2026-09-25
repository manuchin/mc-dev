import { mutation } from "./_generated/server.js";
import { v } from "convex/values";

/* Acciones de dueño (protegidas con ADMIN_TOKEN):
   marcar como respondido y borrar. El dashboard /admin las usa. */

function authorized(adminKey) {
  return !!adminKey && adminKey === process.env.ADMIN_TOKEN;
}

export const markAnswered = mutation({
  args: { adminKey: v.string(), id: v.id("messages"), answered: v.boolean() },
  handler: async (ctx, args) => {
    if (!authorized(args.adminKey)) return { ok: false, error: "unauthorized" };
    const row = await ctx.db.get(args.id);
    if (!row) return { ok: false, error: "not found" };
    await ctx.db.patch(args.id, { answered: args.answered });
    return { ok: true };
  },
});

export const remove = mutation({
  args: { adminKey: v.string(), id: v.id("messages") },
  handler: async (ctx, args) => {
    if (!authorized(args.adminKey)) return { ok: false, error: "unauthorized" };
    const row = await ctx.db.get(args.id);
    if (!row) return { ok: false, error: "not found" };
    await ctx.db.delete(args.id);
    return { ok: true };
  },
});
