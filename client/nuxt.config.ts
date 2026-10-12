// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from "node:url";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  srcDir: "./src",
  serverDir: "./src/server",
  dir: {
    pages: "pages",
  },
  app: {
    baseURL: "/",
  },
  devtools: { enabled: true },
  alias: {
    "~": fileURLToPath(new URL("./", import.meta.url)),
    "@": fileURLToPath(new URL("./", import.meta.url)),
    "@assets": fileURLToPath(new URL("./assets", import.meta.url)),
    "@scss": fileURLToPath(new URL("./assets/scss", import.meta.url)),
  },
  css: ["~/assets/scss/main.scss"],
  runtimeConfig: {
    gameApiUrl: process.env.NUXT_GAME_API_URL,
  },
});
