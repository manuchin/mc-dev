// Portfolio de Manuel Candoli — React + Tailwind, estructura shadcn.
// El build emite dist/ estático para hosting y para Termux (se sirve con server.js).
// admin.html compila aparte: es el dashboard /admin (bandeja de mensajes).
import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        admin: resolve(__dirname, "admin.html"),
      },
    },
  },
  server: {
    host: "0.0.0.0",
    port: Number(process.env.PORT) || 4180,
  },
});
