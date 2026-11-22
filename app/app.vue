<script setup lang="ts">
const baseURL = useRuntimeConfig().app.baseURL;

useHead({
  link: [{ rel: "icon", href: `${baseURL}favicon.ico` }],
  htmlAttrs: {
    lang: "en",
  },
});

const route = useRoute();

const isLogbook = computed(() => route.path.startsWith("/logbook"));
</script>

<template>
  <UApp>
    <UMain class="shell">
      <NuxtPage />
    </UMain>

    <nav class="pill" aria-label="Main">
      <span
        class="pill__slider"
        :class="{ 'pill__slider--logbook': isLogbook }"
      />

      <NuxtLink
        to="/"
        class="pill__link"
        :class="{ 'pill__link--active': !isLogbook }"
      >
        map
      </NuxtLink>

      <NuxtLink
        to="/logbook"
        class="pill__link"
        :class="{ 'pill__link--active': isLogbook }"
      >
        logbook
      </NuxtLink>
    </nav>
  </UApp>
</template>

<style scoped>
/* Mobile-first shell frame (docs/technical-notes.md — Responsive layout):
   pages fill the viewport, and the pill floats above them at every size. */
.shell {
  min-height: 100dvh;
}

.pill {
  position: fixed;
  left: 50%;
  bottom: calc(1.25rem + env(safe-area-inset-bottom, 0px));
  z-index: 20;
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: min(16rem, calc(100vw - 2.5rem));
  padding: 0.25rem;
  background: rgba(255, 255, 255, 0.55);
  border-radius: 999px;
  transform: translateX(-50%);
  backdrop-filter: blur(8px);
}

.pill__slider {
  position: absolute;
  top: 0.25rem;
  bottom: 0.25rem;
  left: 0.25rem;
  width: calc(50% - 0.25rem);
  background: rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  transition: transform 0.35s ease;
}

.pill__slider--logbook {
  transform: translateX(100%);
}

.pill__link {
  position: relative;
  z-index: 1;
  padding: 0.55rem 0;
  font-size: 0.85rem;
  text-align: center;
  color: rgba(51, 65, 85, 0.6);
  border-radius: 999px;
  transition: color 0.25s ease;
}

.pill__link--active {
  color: rgba(51, 65, 85, 0.9);
}
</style>
