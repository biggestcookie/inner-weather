<script setup lang="ts">
// Entry page: a kept feeling — the emotion word, the moment (editable), and
// an optional note (docs/product-vision.md). First-write and read/edit share
// this screen (docs/technical-notes.md).
import type { Emotion } from "~/types/emotion";
import type { RecordedEmotion } from "~/types/recordedEmotion";

const route = useRoute();

// The "kept." confirmation belongs to the arrival from the keep flow, so it is
// captured once (`?fresh=1`) — not re-shown on every later visit.
const fresh = route.query.fresh === "1";

// `shallowRef` keeps the record a plain object — IndexedDB storage needs raw
// data, not a Vue reactive proxy.
const record = shallowRef<RecordedEmotion | null>(null);
const loaded = ref(false);
const note = ref("");
// The moment as a `datetime-local` value — local time, so backfilling a feeling
// from earlier reads the way it was lived.
const moment = ref("");
const confirmingGo = ref(false);

const emotion = computed<Emotion | undefined>(() =>
  record.value ? getEmotionById(record.value.emotionId) : undefined
);

const placeholders = [
  "What else was in the air today?",
  "anything you'd like to remember about this moment?",
  "a few words, whenever you're ready — or none at all."
];
const placeholder =
  placeholders[Math.floor(Math.random() * placeholders.length)];

onMounted(async () => {
  const found = await getRecordedEmotion(String(route.params.id));
  if (found) {
    record.value = found;
    note.value = found.note ?? "";
    moment.value = toLocalInputValue(found.occurredAt);
  }
  loaded.value = true;
});

/** ISO timestamp -> `datetime-local` value in local time. */
function toLocalInputValue(iso: string): string {
  const date = new Date(iso);
  const pad = (part: number) => String(part).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

function saveMoment() {
  if (!record.value || !moment.value) return;
  record.value.occurredAt = new Date(moment.value).toISOString();
  saveRecordedEmotion(record.value);
}

// The note autosaves — on a pause in typing, and on blur (docs/technical-notes.md
// — Data model).
let noteTimer: ReturnType<typeof setTimeout> | undefined;

function onNoteInput() {
  clearTimeout(noteTimer);
  noteTimer = setTimeout(saveNote, 600);
}

function saveNote() {
  clearTimeout(noteTimer);
  if (!record.value) return;
  record.value.note = note.value || undefined;
  saveRecordedEmotion(record.value);
}

// "let this one go" — delete (docs/product-vision.md). Two taps, so it is
// never one mis-tap away.
async function letItGo() {
  if (!record.value) return;
  if (!confirmingGo.value) {
    confirmingGo.value = true;
    return;
  }
  await deleteRecordedEmotion(record.value.id);
  await navigateTo("/logbook");
}
</script>

<template>
  <section class="entry">
    <NuxtLink to="/logbook" class="entry__back">back to The Logbook</NuxtLink>

    <p v-if="fresh" class="entry__kept" aria-live="polite">kept.</p>

    <template v-if="record">
      <p v-if="emotion" class="entry__family">{{ emotion.family }}</p>

      <h1 class="entry__word" :style="{ color: emotion?.hue }">
        {{ emotion?.word ?? "a kept feeling" }}
      </h1>

      <div class="entry__moment-row">
        <label class="entry__label" for="entry-moment">the moment</label>
        <input
          id="entry-moment"
          v-model="moment"
          class="entry__moment"
          type="datetime-local"
          @change="saveMoment"
        />
      </div>

      <textarea
        v-model="note"
        class="entry__note"
        :placeholder="placeholder"
        rows="4"
        @input="onNoteInput"
        @blur="saveNote"
      />

      <NuxtLink
        v-if="emotion"
        :to="`/?emotion=${emotion.id}`"
        class="entry__link"
      >
        back to the feeling on the map
      </NuxtLink>

      <button class="entry__go" type="button" @click="letItGo">
        {{ confirmingGo ? "let it go?" : "let this one go" }}
      </button>
      <button
        v-if="confirmingGo"
        class="entry__stay"
        type="button"
        @click="confirmingGo = false"
      >
        keep it
      </button>
    </template>

    <template v-else-if="loaded">
      <p class="entry__gone">this one has drifted away.</p>
      <NuxtLink to="/logbook" class="entry__link">back to The Logbook</NuxtLink>
    </template>
  </section>
</template>

<style scoped>
.entry {
  display: flex;
  min-height: 100dvh;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 1.5rem 6rem;
  text-align: center;
  background: radial-gradient(
      at 25% 20%,
      rgba(196, 181, 253, 0.35),
      transparent 55%
    ),
    radial-gradient(at 75% 85%, rgba(147, 197, 253, 0.3), transparent 60%),
    #faf7f2;
}

.entry__back {
  align-self: flex-start;
  font-size: 0.85rem;
  color: rgba(51, 65, 85, 0.65);
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* The "kept." confirmation of a fresh keep — it fades, then stays gone. */
.entry__kept {
  font-size: 0.9rem;
  letter-spacing: 0.12em;
  color: rgba(51, 65, 85, 0.6);
  animation: kept-fade 3s ease forwards;
}

@keyframes kept-fade {
  0%,
  55% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    visibility: hidden;
  }
}

.entry__family {
  margin-top: 1.5rem;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  color: rgba(51, 65, 85, 0.5);
}

.entry__word {
  font-size: 2.25rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.entry__moment-row {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: min(22rem, 100%);
}

.entry__label {
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  color: rgba(51, 65, 85, 0.5);
}

.entry__moment {
  padding: 0.65rem 0.9rem;
  font: inherit;
  font-size: 0.95rem;
  color: rgba(51, 65, 85, 0.85);
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 0.9rem;
}

.entry__note {
  width: min(22rem, 100%);
  padding: 0.9rem 1rem;
  font: inherit;
  font-size: 0.95rem;
  line-height: 1.6;
  color: rgba(51, 65, 85, 0.85);
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 1.1rem;
  resize: vertical;
}

.entry__note::placeholder {
  color: rgba(51, 65, 85, 0.45);
}

.entry__link {
  font-size: 0.85rem;
  color: rgba(51, 65, 85, 0.65);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.entry__go {
  margin-top: 1.5rem;
  padding: 0.5rem 1rem;
  font: inherit;
  font-size: 0.85rem;
  color: rgba(51, 65, 85, 0.55);
  background: none;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
}

.entry__go:hover {
  background: rgba(255, 255, 255, 0.6);
  color: rgba(51, 65, 85, 0.8);
}

.entry__stay {
  padding: 0.5rem 1rem;
  font: inherit;
  font-size: 0.85rem;
  color: rgba(51, 65, 85, 0.75);
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  cursor: pointer;
}

.entry__gone {
  margin-top: 1.5rem;
  font-size: 0.95rem;
  color: rgba(51, 65, 85, 0.55);
}
</style>
