import { defineConfig } from "vite";

// Build del portfolio para Freebuff hosting: procesa index.html y emite
// dist/ con assets estáticos. El sitio sigue siendo vanilla puro.
export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    port: Number(process.env.PORT) || 4180,
  },
});
