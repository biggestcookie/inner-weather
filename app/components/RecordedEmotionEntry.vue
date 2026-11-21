<script setup lang="ts">
// One entry, two modes. A new feeling starts as an in-memory draft in edit
// mode; a kept feeling opens read-only and can be edited in place. Drafts are
// mirrored to sessionStorage so a refresh does not lose the note.
import type { RecordedEmotion } from "~/types/recordedEmotion";

const props = defineProps<{
  emotionId: string;
  /** The saved record; omitted for a new, unkept draft. */
  record?: RecordedEmotion | null;
}>();

const isKept = computed(() => Boolean(props.record));
const emotion = computed(() => getEmotionById(props.emotionId));
const keptRecord = shallowRef<RecordedEmotion | null>(
  props.record ? { ...props.record } : null
);

const mode = ref<"read" | "edit">(isKept.value ? "read" : "edit");
const moment = ref("");
const note = ref("");
const baseline = reactive({ moment: "", note: "" });
const saving = ref(false);
const discardOpen = ref(false);

const draftKey = "inner-weather:entry-draft";
let draftId = "";
let pendingAction: "close" | "back" | "delete" | null = null;

interface StoredDraft {
  id: string;
  emotionId: string;
  moment: string;
  note: string;
  baselineMoment: string;
  baselineNote: string;
}

/** ISO timestamp -> `datetime-local` value in local time. */
function toLocalInputValue(iso: string): string {
  const date = new Date(iso);
  const pad = (part: number) => String(part).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

/** Load a saved record's values into the form and mark them as clean. */
function syncForm(occurredAt: string, text: string) {
  moment.value = toLocalInputValue(occurredAt);
  note.value = text;
  baseline.moment = moment.value;
  baseline.note = note.value;
}

function readDraft(): StoredDraft | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const value = sessionStorage.getItem(draftKey);
    return value ? (JSON.parse(value) as StoredDraft) : null;
  } catch {
    return null;
  }
}

function persistDraft() {
  if (isKept.value || typeof sessionStorage === "undefined") return;
  const draft: StoredDraft = {
    id: draftId,
    emotionId: props.emotionId,
    moment: moment.value,
    note: note.value,
    baselineMoment: baseline.moment,
    baselineNote: baseline.note,
  };
  sessionStorage.setItem(draftKey, JSON.stringify(draft));
}

function clearDraft() {
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.removeItem(draftKey);
  }
}

if (props.record) {
  syncForm(props.record.occurredAt, props.record.note ?? "");
} else {
  const stored = readDraft();
  if (stored && stored.emotionId === props.emotionId && stored.moment) {
    draftId = stored.id || crypto.randomUUID();
    moment.value = stored.moment;
    note.value = stored.note ?? "";
    baseline.moment = stored.baselineMoment || stored.moment;
    baseline.note = stored.baselineNote ?? "";
  } else {
    draftId = crypto.randomUUID();
    syncForm(new Date().toISOString(), "");
    persistDraft();
  }
}

watch([moment, note], persistDraft);

const dirty = computed(
  () => moment.value !== baseline.moment || note.value !== baseline.note
);

const mapHref = computed(() =>
  emotion.value ? `/?emotion=${emotion.value.id}` : "/"
);

const displayDate = computed(() => {
  const record = keptRecord.value;
  if (!record) return "";
  const date = new Date(record.occurredAt);
  const day = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${day} · ${time}`;
});

function startEdit() {
  if (!keptRecord.value) return;
  syncForm(keptRecord.value.occurredAt, keptRecord.value.note ?? "");
  mode.value = "edit";
}

async function save() {
  if (saving.value || !moment.value || !emotion.value) return;
  saving.value = true;

  try {
    const occurredAt = new Date(moment.value).toISOString();
    const cleanNote = note.value || undefined;

    if (isKept.value && keptRecord.value) {
      const updated = { ...keptRecord.value, occurredAt, note: cleanNote };
      await saveRecordedEmotion(updated);
      keptRecord.value = updated;
      baseline.moment = moment.value;
      baseline.note = note.value;
      mode.value = "read";
      return;
    }

    const record: RecordedEmotion = {
      id: draftId || crypto.randomUUID(),
      emotionId: props.emotionId,
      occurredAt,
      note: cleanNote,
      createdAt: new Date().toISOString(),
    };
    await saveRecordedEmotion(record);
    clearDraft();
    await navigateTo(`/logbook/${record.id}`, { replace: true });
  } finally {
    saving.value = false;
  }
}

function requestLeave(action: "close" | "back" | "delete") {
  if (dirty.value) {
    pendingAction = action;
    discardOpen.value = true;
    return;
  }
  void performLeave(action);
}

async function performLeave(action: "close" | "back" | "delete") {
  if (action === "close") {
    if (isKept.value && keptRecord.value) {
      syncForm(keptRecord.value.occurredAt, keptRecord.value.note ?? "");
      mode.value = "read";
    } else {
      clearDraft();
      await navigateTo(mapHref.value);
    }
    return;
  }

  if (action === "back") {
    if (!isKept.value) clearDraft();
    await navigateTo(isKept.value ? "/logbook" : mapHref.value);
    return;
  }

  if (isKept.value && keptRecord.value) {
    await deleteRecordedEmotion(keptRecord.value.id);
    await navigateTo("/logbook");
  } else {
    clearDraft();
    await navigateTo(mapHref.value);
  }
}

function confirmDiscard() {
  const action = pendingAction;
  discardOpen.value = false;
  pendingAction = null;
  if (action) void performLeave(action);
}

function cancelDiscard() {
  discardOpen.value = false;
  pendingAction = null;
}

const placeholders = [
  "What else was in the air today?",
  "anything you'd like to remember about this moment?",
  "a few words, whenever you're ready — or none at all.",
];
const placeholder =
  placeholders[Math.floor(Math.random() * placeholders.length)];
</script>

<template>
  <section class="entry">
    <header class="entry__header">
      <button
        class="entry__back"
        type="button"
        @click="requestLeave('back')"
      >
        go back
      </button>

      <button
        v-if="mode === 'read'"
        class="entry__header-action"
        type="button"
        @click="startEdit"
      >
        edit
      </button>
      <button
        v-else
        class="entry__header-action"
        type="button"
        aria-label="close"
        @click="requestLeave('close')"
      >
        <UIcon name="i-lucide-x" />
      </button>
    </header>

    <template v-if="emotion">
      <h1 class="entry__word" :style="{ color: emotion.hue }">
        {{ emotion.word }}
      </h1>

      <template v-if="mode === 'read' && keptRecord">
        <p class="entry__date">{{ displayDate }}</p>
        <p v-if="keptRecord.note" class="entry__note-text">
          {{ keptRecord.note }}
        </p>
      </template>

      <template v-else>
        <div class="entry__moment-row">
          <input
            id="entry-moment"
            v-model="moment"
            class="entry__moment"
            type="datetime-local"
          />
        </div>

        <textarea
          v-model="note"
          class="entry__note"
          :placeholder="placeholder"
          rows="4"
        />

        <button
          class="entry__save"
          type="button"
          :disabled="saving || !moment"
          @click="save"
        >
          {{ isKept ? "save changes" : "log this feeling" }}
        </button>
      </template>

      <button
        v-if="!isKept || mode === 'read'"
        class="entry__go"
        type="button"
        @click="requestLeave('delete')"
      >
        let this one go
      </button>
    </template>

    <template v-else>
      <p class="entry__gone">this one has drifted away.</p>
      <NuxtLink to="/logbook" class="entry__link">go back</NuxtLink>
    </template>

    <DiscardChangesDialog
      :open="discardOpen"
      @confirm="confirmDiscard"
      @cancel="cancelDiscard"
    />
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

.entry__header {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
}

.entry__back {
  padding: 0;
  font: inherit;
  font-size: 0.85rem;
  color: rgba(51, 65, 85, 0.65);
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
  background: none;
  border: 0;
}

.entry__header-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.6rem;
  font: inherit;
  font-size: 0.85rem;
  color: rgba(51, 65, 85, 0.65);
  cursor: pointer;
  background: none;
  border: 0;
  border-radius: 999px;
}

.entry__header-action:hover {
  color: rgba(51, 65, 85, 0.85);
  background: rgba(255, 255, 255, 0.65);
}

/* The feeling word anchors the page. */
.entry__word {
  margin-top: 1rem;
  font-size: 2.25rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.entry__date {
  font-size: 0.9rem;
  color: rgba(51, 65, 85, 0.6);
}

.entry__note-text {
  width: min(22rem, 100%);
  margin-top: 0.25rem;
  padding: 0.9rem 1rem;
  font-size: 0.95rem;
  line-height: 1.7;
  color: rgba(51, 65, 85, 0.78);
  text-align: left;
  white-space: pre-wrap;
  background: rgba(255, 255, 255, 0.55);
  border-radius: 1.1rem;
}

.entry__moment-row {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: min(22rem, 100%);
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

.entry__save {
  width: min(22rem, 100%);
  margin-top: 0.5rem;
  padding: 0.75rem 1.25rem;
  font: inherit;
  font-size: 0.95rem;
  letter-spacing: 0.02em;
  color: rgba(51, 65, 85, 0.85);
  cursor: pointer;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  transition: box-shadow 0.25s ease;
}

.entry__save:hover {
  box-shadow: 0 6px 18px rgba(51, 65, 85, 0.12);
}

.entry__save:disabled {
  cursor: default;
  opacity: 0.65;
}

.entry__go {
  margin-top: 1.5rem;
  padding: 0.5rem 1rem;
  font: inherit;
  font-size: 0.85rem;
  color: rgba(51, 65, 85, 0.55);
  cursor: pointer;
  background: none;
  border: 0;
  border-radius: 999px;
}

.entry__go:hover {
  color: rgba(51, 65, 85, 0.8);
  background: rgba(255, 255, 255, 0.6);
}

.entry__link {
  font-size: 0.85rem;
  color: rgba(51, 65, 85, 0.65);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.entry__gone {
  margin-top: 1.5rem;
  font-size: 0.95rem;
  color: rgba(51, 65, 85, 0.55);
}
</style>
