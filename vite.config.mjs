import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Portfolio de Manuel Candoli — React + Tailwind, estructura shadcn.
// El build emite dist/ estático para hosting y para Termux (se sirve con server.js).
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    port: Number(process.env.PORT) || 4180,
  },
});
