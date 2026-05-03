import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  // ssr: false,
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["./app/assets/css/main.css"],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:8000",
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  modules: [
    "@nuxt/fonts",
    "@nuxt/image",
    "@nuxtjs/color-mode",
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "shadcn-nuxt",
  ],
  colorMode: {
    classSuffix: "",
  },
  shadcn: {
    prefix: "",
    componentDir: "./app/components/ui",
  },
});
