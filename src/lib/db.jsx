import { ConvexProvider, ConvexReactClient } from "convex/react";

/* Cliente de la base de datos real (Convex). La URL la inyecta Vite en
   build (VITE_CONVEX_URL) — en producción apunta al deployment cloud,
   en local al deployment local. Si la env no está, este wrapper no se
   monta y el sitio sigue funcionando con el fallback JSON de server.js. */
const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;

export function DbProvider({ children }) {
  if (!CONVEX_URL) return children;
  const client = new ConvexReactClient(CONVEX_URL);
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}

export const hasDb = !!CONVEX_URL;
