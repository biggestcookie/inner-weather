<script setup lang="ts">
// The explorer peek (docs/product-vision.md — "the dwell"): the word, its
// definition, and nearby feelings. Shows a quiet empty state when nothing is
// focused. Placement is responsive (docs/technical-notes.md): an overlay over
// the map on mobile, the map's right side pane on desktop.
import type { Emotion } from "~/types/emotion";

const props = defineProps<{
  /** The focused feeling, or null when the map has nothing in focus. */
  emotion: Emotion | null;
}>();

const nearby = computed<Emotion[]>(() =>
  (props.emotion?.relatedIds ?? [])
    .map((id) => getEmotionById(id))
    .filter((emotion): emotion is Emotion => emotion !== undefined)
);

const keeping = ref(false);

// "keep this feeling" — save the moment, then open its journal page
// (docs/product-vision.md — the keep).
async function keep() {
  if (!props.emotion || keeping.value) return;
  keeping.value = true;

  const record = createRecordedEmotion(props.emotion.id);
  await saveRecordedEmotion(record);
  await navigateTo(`/logbook/${record.id}?fresh=1`);
}
</script>

<template>
  <article class="card">
    <template v-if="emotion">
      <p class="card__family">{{ emotion.family }}</p>

      <h2 class="card__word" :style="{ color: emotion.hue }">
        {{ emotion.word }}
      </h2>

      <p class="card__definition">{{ emotion.definition }}</p>

      <div v-if="nearby.length" class="card__nearby">
        <p class="card__label">nearby feelings</p>

        <!-- Soft-swapping to a nearby feeling arrives with the bloom mechanics. -->
        <ul class="card__chips">
          <li v-for="other in nearby" :key="other.id" class="card__chip">
            {{ other.word }}
          </li>
        </ul>
      </div>

      <button
        class="card__keep"
        type="button"
        :disabled="keeping"
        @click="keep"
      >
        keep this feeling
      </button>
    </template>

    <p v-else class="card__empty">
      nothing in focus yet.<br />
      whenever you're ready, tap a feeling — it will rest here.
    </p>
  </article>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 1.25rem;
  box-shadow: 0 12px 32px rgba(51, 65, 85, 0.12);
  backdrop-filter: blur(12px);
}

.card__family,
.card__label {
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  color: rgba(51, 65, 85, 0.5);
}

.card__word {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.card__definition {
  font-size: 0.95rem;
  line-height: 1.6;
  color: rgba(51, 65, 85, 0.75);
}

.card__nearby {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.card__chip {
  padding: 0.35rem 0.75rem;
  font-size: 0.85rem;
  color: rgba(51, 65, 85, 0.75);
  background: rgba(255, 255, 255, 0.7);
  border-radius: 999px;
}

.card__keep {
  margin-top: 0.25rem;
  padding: 0.65rem 1.25rem;
  font: inherit;
  font-size: 0.95rem;
  letter-spacing: 0.02em;
  color: rgba(51, 65, 85, 0.8);
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  cursor: pointer;
  transition: box-shadow 0.25s ease;
}

.card__keep:hover {
  box-shadow: 0 4px 12px rgba(51, 65, 85, 0.12);
}

.card__keep:disabled {
  cursor: default;
  opacity: 0.7;
}

.card__empty {
  padding: 1rem 0.5rem;
  font-size: 0.95rem;
  line-height: 1.7;
  text-align: center;
  color: rgba(51, 65, 85, 0.55);
}
</style>
