<script setup lang="ts">
// The map: drift / focus / bloom mechanics land here (docs/product-vision.md).
// Layout is mobile-first (docs/technical-notes.md): the emotion card overlays
// the map on small screens and sits in a right side pane from `lg`.
import type { Emotion } from "~/types/emotion";

const route = useRoute();

const focusedEmotion = computed<Emotion | null>(() => {
  const id = route.query.emotion;
  return typeof id === "string" ? getEmotionById(id) ?? null : null;
});
</script>

<template>
  <div
    class="map relative flex min-h-dvh flex-col lg:h-dvh lg:flex-row lg:overflow-hidden"
  >
    <div class="map__canvas flex flex-1 items-center justify-center">
      <p class="map__hint">feelings will drift here</p>
    </div>

    <!-- Mobile: the peek overlays the map just above the pill. -->
    <aside v-if="focusedEmotion" class="map__peek lg:hidden">
      <EmotionCard :emotion="focusedEmotion" />
    </aside>

    <!-- Desktop: a right side pane, always visible. -->
    <aside
      class="map__pane hidden lg:flex lg:w-80 lg:shrink-0 lg:flex-col lg:overflow-y-auto xl:w-96"
    >
      <EmotionCard :emotion="focusedEmotion" />
    </aside>
  </div>
</template>

<style scoped>
.map {
  background: radial-gradient(
      at 18% 22%,
      rgba(147, 197, 253, 0.55),
      transparent 55%
    ),
    radial-gradient(at 82% 18%, rgba(196, 181, 253, 0.5), transparent 55%),
    radial-gradient(at 50% 90%, rgba(253, 186, 116, 0.45), transparent 60%),
    #faf7f2;
}

.map__hint {
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  color: rgba(51, 65, 85, 0.55);
}

.map__peek {
  position: absolute;
  right: 0.75rem;
  bottom: calc(5.5rem + env(safe-area-inset-bottom, 0px));
  left: 0.75rem;
  z-index: 10;
}

.map__pane {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.25);
  border-left: 1px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
}
</style>
