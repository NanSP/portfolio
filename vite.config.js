import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  // Keeps generated asset URLs valid when the portfolio is deployed in a subfolder.
  base: "./",
  build: {
    rollupOptions: {
      input: {
        redirect: resolve(import.meta.dirname, "index.html"),
        home: resolve(import.meta.dirname, "pages/index.html"),
        professional: resolve(import.meta.dirname, "pages/professional.html"),
        projects: resolve(import.meta.dirname, "pages/projects.html"),
        contact: resolve(import.meta.dirname, "pages/contact.html"),
      },
    },
  },
});
