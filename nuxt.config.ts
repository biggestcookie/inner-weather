import { defineNuxtConfig } from "nuxt/config";

// GitHub Pages serves the app under /inner-weather/; dev stays at the root.
const baseURL =
  process.env.NODE_ENV === "production" ? "/inner-weather/" : "/";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  modules: [
    "@nuxt/eslint",
    "@nuxt/ui",
    "@nuxtjs/device",
    "@nuxtjs/google-fonts",
    "@pinia/nuxt",
    "@vite-pwa/nuxt",
    "@vueuse/nuxt",
    "@vueuse/motion/nuxt",
  ],
  devtools: {
    enabled: true,
  },
  app: {
    baseURL,
    pageTransition: {
      name: "page",
      mode: "out-in",
    },
    head: {
      title: "inner-weather",
      // Static so Chrome finds the manifest before the client bundle runs.
      link: [
        { rel: "manifest", href: `${baseURL}manifest.webmanifest` },
        {
          rel: "apple-touch-icon",
          href: `${baseURL}apple-touch-icon.png`,
          sizes: "180x180",
        },
      ],
      meta: [
        { charset: "utf-8" },
        { name: "theme-color", content: "#faf7f2" },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1, viewport-fit=cover",
        },
        {
          name: "description",
          content:
            "An atmospheric feelings map. No accounts, no servers, fully private.",
        },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "inner-weather" },
        { property: "og:title", content: "inner-weather" },
        {
          property: "og:description",
          content:
            "An atmospheric feelings map. No accounts, no servers, fully private.",
        },
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: "inner-weather" },
        {
          name: "twitter:description",
          content:
            "An atmospheric feelings map. No accounts, no servers, fully private.",
        },
      ],
    },
  },
  nitro: {
    preset: "github-pages",
  },
  css: ["~/assets/css/main.css"],
  routeRules: {
    "/": { prerender: true },
  },
  compatibilityDate: "2025-01-15",
  typescript: {
    tsConfig: {
      include: ["eslint.config.mts"],
    },
  },
  eslint: {
    config: {
      stylistic: {
        commaDangle: "never",
        braceStyle: "1tbs",
      },
    },
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          charset: false,
          silenceDeprecations: [],
        },
      },
    },
    plugins: [
      {
        name: "vite-plugin-ignore-sourcemap-warnings",
        apply: "build",
        configResolved(config) {
          config.build.rollupOptions.onwarn = (warning, warn) => {
            if (
              warning.code === "SOURCEMAP_BROKEN" ||
              warning.code === "INVALID_ANNOTATION"
            ) {
              return;
            }

            warn(warning);
          };
        },
      },
    ],
  },
  pwa: {
    registerType: "autoUpdate",

    scope: baseURL,
    base: baseURL,

    manifest: {
      id: baseURL,
      name: "inner-weather",
      short_name: "inner-weather",
      description:
        "An atmospheric feelings map. No accounts, no servers, fully private.",
      theme_color: "#faf7f2",
      background_color: "#faf7f2",
      display: "standalone",
      start_url: baseURL,
      scope: baseURL,
      icons: [
        {
          src: `${baseURL}pwa-192x192.png`,
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `${baseURL}pwa-512x512.png`,
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `${baseURL}pwa-maskable-512x512.png`,
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },

    workbox: {
      globPatterns: ["**/*.{js,css,html,png,svg,ico,woff,woff2,json,webmanifest}"],
    },
  },
});
