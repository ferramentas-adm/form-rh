import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8090,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        integracao: resolve(__dirname, "integracao.html"),
        talentos: resolve(__dirname, "talentos.html"),
        vagas: resolve(__dirname, "vagas.html"),
      },
    },
  },
});
