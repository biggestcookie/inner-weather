<script setup lang="ts">
// The daily welcome: a soft, out-of-focus look at the map's word cloud before
// the map is revealed. On a day that already has a kept feeling, it becomes a
// quiet recap with a way back to that entry or a fresh check-in.
import type { RecordedEmotion } from "~/types/recordedEmotion";

const props = defineProps<{
  /** The latest kept feeling from today, or null when today is still open. */
  record: RecordedEmotion | null;
  /** A neutral welcome line, picked when the screen opens. */
  message: string;
}>();

const emit = defineEmits<{
  /** Reveal the word cloud. */
  start: [];
  /** Open today's kept feeling in the Logbook. */
  revisit: [];
}>();

const startButton = ref<HTMLButtonElement | null>(null);
const reducedMotion = usePreferredReducedMotion();
const version = useRuntimeConfig().public.version;
const { state: installState, install: installApp } = usePwaInstall();

const messageInitial = computed(() =>
  reducedMotion.value === "reduce" ? { opacity: 1 } : { opacity: 0, y: 18 }
);
const messageEnter = computed(() =>
  reducedMotion.value === "reduce" ? { opacity: 1 } : { opacity: 1, y: 0 }
);

/** The color fields behind the blurred words — one per core feeling family. */
const glowBackground = computed(() => {
  const spots = [
    [18, 22],
    [80, 18],
    [24, 82],
    [78, 74],
    [52, 42],
    [58, 92],
  ];

  return getCoreEmotions()
    .map((emotion, index) => {
      const [x, y] = spots[index] ?? [50, 50];
      return `radial-gradient(circle at ${x}% ${y}%, ${emotion.hue}d9 0%, transparent 32%)`;
    })
    .join(", ");
});

const feeling = computed(() =>
  props.record ? getEmotionById(props.record.emotionId) : undefined
);

const feelingWord = computed(() => feeling.value?.word ?? "a kept feeling");
const feelingHue = computed(
  () => feeling.value?.hue ?? "rgba(51, 65, 85, 0.8)"
);

/**
 * A handful of real words from the vocabulary, scattered around the center.
 * Blurred together they read as the cloud's color blobs rather than text.
 */
const previewWords = computed(() =>
  emotions
    .filter((_, index) => index % 6 === 0)
    .slice(0, 18)
    .map((emotion, index) => {
      // Golden-angle scatter keeps every run of the page looking different
      // enough without needing random positions at render time.
      const angle = index * 2.399963;
      const radius = 8 + ((index * 19) % 20);

      return {
        id: emotion.id,
        word: emotion.word,
        style: {
          left: `${50 + Math.cos(angle) * radius}%`,
          top: `${50 + Math.sin(angle) * radius}%`,
          color: emotion.hue,
          fontSize: `${2.2 + ((index * 13) % 7) * 0.36}rem`,
        },
      };
    })
);

onMounted(() => startButton.value?.focus());
</script>

<template>
  <div
    class="welcome"
    role="dialog"
    aria-modal="true"
    :aria-label="record ? 'kept feeling today' : 'welcome'"
  >
    <!-- The map, zoomed in and far out of focus: just color and light. -->
    <div class="welcome__visual" aria-hidden="true">
      <div class="welcome__glow" :style="{ background: glowBackground }" />
      <div class="welcome__zoom">
        <div class="welcome__cloud">
          <span
            v-for="word in previewWords"
            :key="word.id"
            class="welcome__word"
            :style="word.style"
          >
            {{ word.word }}
          </span>
        </div>
      </div>
      <div class="welcome__veil" />
    </div>

    <div class="welcome__content">
      <p
        v-motion
        class="welcome__message"
        :initial="messageInitial"
        :enter="messageEnter"
        :delay="450"
        :duration="900"
      >
        <template v-if="record">
          earlier today you logged that you were feeling
          <span class="welcome__feeling" :style="{ color: feelingHue }">{{
            feelingWord
          }}</span
          >.
        </template>
        <template v-else>{{ message }}</template>
      </p>

      <div class="welcome__actions">
        <template v-if="record">
          <button class="welcome__button" @click="emit('revisit')">
            revisit this
          </button>
          <button
            ref="startButton"
            class="welcome__button welcome__button--primary"
            @click="emit('start')"
          >
            log a new feeling
          </button>
        </template>

        <button
          v-else
          ref="startButton"
          class="welcome__button welcome__button--primary"
          @click="emit('start')"
        >
          let's start
        </button>
      </div>

      <!-- The quiet offer to install: under the buttons, out of the way. -->
      <p v-if="installState === 'supported'" class="welcome__install">
        <button type="button" class="welcome__install-link" @click="installApp">
          install this app
        </button>
      </p>
      <p v-else-if="installState === 'partial'" class="welcome__install">
        share → add to home screen
      </p>

      <p class="welcome__version">v{{ version }}</p>
    </div>
  </div>
</template>

<style scoped>
.welcome {
  position: fixed;
  inset: 0;
  z-index: 30;
  overflow: hidden;
  background: radial-gradient(
      at 18% 22%,
      rgba(147, 197, 253, 0.55),
      transparent 55%
    ),
    radial-gradient(at 82% 18%, rgba(196, 181, 253, 0.5), transparent 55%),
    radial-gradient(at 50% 90%, rgba(253, 186, 116, 0.45), transparent 60%),
    #faf7f2;
}

.welcome__visual {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.welcome__glow {
  position: absolute;
  inset: -10%;
  filter: blur(16px);
  animation: glow-drift 14s ease-in-out infinite alternate;
  will-change: transform;
}

/* A second, slower pass over the same color fields deepens the drift. */
.welcome__glow::after {
  position: absolute;
  inset: 0;
  content: "";
  background: inherit;
  opacity: 0.4;
  filter: blur(24px);
  transform-origin: center;
  animation: glow-drift-reverse 18s ease-in-out infinite alternate;
}

@keyframes glow-drift {
  from {
    transform: translate(-2%, 1.5%) scale(1.02) rotate(-1deg);
  }
  to {
    transform: translate(2%, -1.5%) scale(1.08) rotate(1deg);
  }
}

@keyframes glow-drift-reverse {
  from {
    transform: translate(2.5%, -1%) scale(1.12) rotate(1.5deg);
  }
  to {
    transform: translate(-2.5%, 2%) scale(1.02) rotate(-1.5deg);
  }
}

/* The zoom lives on its own layer: the opening settles from a very close view,
   and dismissing pulls the whole blurred cloud further back before the map
   appears. */
.welcome__zoom {
  position: absolute;
  inset: 0;
  transform: scale(1.45);
  transform-origin: center;
  will-change: transform;
}

/* One filter on the group is cheaper than blurring every word separately.
   The group drifts as one so the filter isn't recomputed per word. */
.welcome__cloud {
  position: absolute;
  inset: -20%;
  filter: blur(24px) saturate(1.35);
  animation: cloud-drift 9s ease-in-out infinite alternate;
  will-change: transform;
}

.welcome__word {
  position: absolute;
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
  opacity: 0.9;
  transform: translate(-50%, -50%);
}

@keyframes cloud-drift {
  from {
    transform: translate(-2.5%, 1.5%) scale(1.02) rotate(-0.5deg);
  }
  to {
    transform: translate(2.5%, -2%) scale(1.1) rotate(0.5deg);
  }
}

/* Frosted glass over the color blobs, so the copy stays soft but readable. */
.welcome__veil {
  position: absolute;
  inset: 0;
  background: radial-gradient(
      circle at 50% 42%,
      rgba(255, 255, 255, 0.28),
      rgba(250, 247, 242, 0.02) 55%,
      rgba(250, 247, 242, 0.1)
    ),
    rgba(250, 247, 242, 0.04);
  backdrop-filter: blur(6px) saturate(1.2);
}

/* Opening: fade the frame in quickly while the cloud keeps zooming out. */
.welcome-enter-active {
  transition: opacity 0.35s ease;
}

.welcome-enter-from {
  opacity: 0;
}

.welcome-enter-from .welcome__zoom {
  transform: scale(2.4);
}

.welcome-enter-active .welcome__zoom {
  transition: transform 3.2s cubic-bezier(0.33, 0, 0.67, 1);
}

/* Dismissing: the cloud recedes into the map instead of just fading. */
.welcome-leave-active {
  transition: opacity 1.2s ease-in;
}

.welcome-leave-to {
  opacity: 0;
}

.welcome-leave-active .welcome__zoom {
  transition: transform 1.2s cubic-bezier(0.4, 0, 0.8, 0.6);
}

.welcome-leave-to .welcome__zoom {
  transform: scale(0.65);
}

.welcome-leave-active .welcome__content {
  transition: opacity 0.5s ease, transform 1.2s ease;
}

.welcome-leave-to .welcome__content {
  opacity: 0;
  transform: translateY(1.5rem);
}

.welcome__content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  padding: 2rem 1.5rem calc(2.5rem + env(safe-area-inset-bottom, 0px));
}

.welcome__message {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  max-width: 26rem;
  margin: 0 auto;
  font-size: clamp(1.4rem, 4.5vw, 1.9rem);
  font-weight: 500;
  line-height: 1.5;
  color: rgba(51, 65, 85, 0.85);
  text-align: center;
  text-wrap: balance;
  text-shadow: 0 1px 24px rgba(250, 247, 242, 0.9);
}

.welcome__feeling {
  font-weight: 600;
}

.welcome__actions {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  align-items: stretch;
  width: 100%;
  max-width: 24rem;
  margin: 0 auto;
}

.welcome__button {
  padding: 0.8rem 1.4rem;
  font: inherit;
  font-size: 0.95rem;
  letter-spacing: 0.02em;
  color: rgba(51, 65, 85, 0.8);
  cursor: pointer;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.75);
  border-radius: 999px;
  backdrop-filter: blur(10px);
  transition: background-color 0.25s ease, box-shadow 0.25s ease;
}

.welcome__button:hover {
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 6px 18px rgba(51, 65, 85, 0.12);
}

.welcome__button--primary {
  color: rgba(51, 65, 85, 0.88);
  background: rgba(255, 255, 255, 0.85);
  border-color: rgba(255, 255, 255, 0.95);
}

/* Quiet provenance for the build that's running — bottom of the screen. */
.welcome__version {
  margin: 1.5rem auto 0;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  color: rgba(51, 65, 85, 0.35);
}

.welcome__install {
  margin: 1.25rem auto 0;
  font-size: 0.8rem;
  color: rgba(51, 65, 85, 0.45);
  text-align: center;
}

.welcome__install-link {
  padding: 0;
  font: inherit;
  color: inherit;
  cursor: pointer;
  background: none;
  border: 0;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.welcome__install-link:hover {
  color: rgba(51, 65, 85, 0.7);
}

/* Room for two side-by-side choices once the screen widens. */
@media (min-width: 40rem) {
  .welcome__actions {
    flex-direction: row;
    justify-content: center;
    max-width: 30rem;
  }

  .welcome__actions > .welcome__button {
    flex: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .welcome__glow,
  .welcome__glow::after,
  .welcome__cloud {
    animation: none;
  }

  .welcome-enter-active .welcome__zoom,
  .welcome-leave-active .welcome__zoom,
  .welcome-leave-active .welcome__content {
    transition: none;
  }

  .welcome-enter-from .welcome__zoom,
  .welcome-leave-to .welcome__zoom {
    transform: scale(1.45);
  }

  .welcome-leave-to .welcome__content {
    transform: none;
  }
}
</style>
