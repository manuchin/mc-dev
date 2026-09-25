import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/* Base de datos real en la nube (Convex).
   Una sola tabla: los mensajes que dejan los visitantes
   ("Guardar sin WhatsApp") + su estado de respuesta. */
export default defineSchema({
  messages: defineTable({
    name: v.string(),
    reply: v.string(), // contacto para responderle: email o WhatsApp
    message: v.string(),
    lang: v.string(),
    page: v.string(),
    ip: v.optional(v.string()),
    answered: v.boolean(), // true cuando Manuel ya le respondió
    ts: v.number(), // epoch ms
  }).index("by_ts", ["ts"]),
});
