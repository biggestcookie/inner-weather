<script setup lang="ts">
// The Logbook — the calendar plus the selected day's kept feelings. Kept
// feelings land here as soft dots (docs/product-vision.md). Layout is
// mobile-first (docs/technical-notes.md): stacked on small screens, side by
// side from `lg`.
import type { RecordedEmotion } from "~/types/recordedEmotion";

const weekdayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// The most dots a day shows before the month's sky becomes busy.
const maxDots = 3;

const cursor = ref(new Date());
// The day whose kept feelings show in the list — today, until another is tapped.
const selectedDay = ref<number | null>(new Date().getDate());

// Every kept feeling, newest moment first (IndexedDB, client-only).
const records = ref<RecordedEmotion[]>([]);

onMounted(async () => {
  records.value = await getRecordedEmotions();
});

const monthLabel = computed(() =>
  cursor.value.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })
);

const days = computed(() => {
  const year = cursor.value.getFullYear();
  const month = cursor.value.getMonth();
  const leading = new Date(year, month, 1).getDay();
  const dayCount = new Date(year, month + 1, 0).getDate();

  const cells: Array<number | null> = Array(leading).fill(null);
  for (let day = 1; day <= dayCount; day++) {
    cells.push(day);
  }
  return cells;
});

/** Local calendar key — a day is named the way it was lived, not in UTC. */
function dayKey(date: Date): string {
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Kept feelings grouped by the local day they happened. */
const recordsByDay = computed(() => {
  const grouped = new Map<string, RecordedEmotion[]>();
  for (const record of records.value) {
    const key = dayKey(new Date(record.occurredAt));
    const day = grouped.get(key);
    if (day) {
      day.push(record);
    } else {
      grouped.set(key, [record]);
    }
  }
  return grouped;
});

function recordsForDay(day: number): RecordedEmotion[] {
  const date = new Date(
    cursor.value.getFullYear(),
    cursor.value.getMonth(),
    day
  );
  return recordsByDay.value.get(dayKey(date)) ?? [];
}

function hueOf(record: RecordedEmotion): string {
  return getEmotionById(record.emotionId)?.hue ?? "rgba(51, 65, 85, 0.35)";
}

/** The day's soft dots, capped so the month's sky stays quiet. */
function dotsForDay(day: number): string[] {
  return recordsForDay(day)
    .slice(0, maxDots)
    .map((record) => hueOf(record));
}

function wordOf(record: RecordedEmotion): string {
  return getEmotionById(record.emotionId)?.word ?? "a kept feeling";
}

function timeOf(record: RecordedEmotion): string {
  return new Date(record.occurredAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

const selectedRecords = computed(() =>
  selectedDay.value === null ? [] : recordsForDay(selectedDay.value)
);

const selectedLabel = computed(() => {
  if (selectedDay.value === null) {
    return "";
  }
  return new Date(
    cursor.value.getFullYear(),
    cursor.value.getMonth(),
    selectedDay.value
  ).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
});

function shiftMonth(delta: number) {
  cursor.value = new Date(
    cursor.value.getFullYear(),
    cursor.value.getMonth() + delta,
    1
  );
  // A day in the month just left can't stay selected.
  selectedDay.value = null;
}

function isToday(day: number): boolean {
  const now = new Date();
  return (
    day === now.getDate() &&
    cursor.value.getMonth() === now.getMonth() &&
    cursor.value.getFullYear() === now.getFullYear()
  );
}
</script>

<template>
  <section
    class="logbook flex min-h-dvh flex-col lg:h-dvh lg:flex-row lg:overflow-hidden"
  >
    <div class="logbook__calendar flex flex-1 flex-col lg:overflow-y-auto">
      <header class="logbook__header">
        <button
          class="logbook__step"
          aria-label="Previous month"
          @click="shiftMonth(-1)"
        >
          <UIcon name="i-lucide-chevron-left" />
        </button>

        <h1 class="logbook__month">{{ monthLabel }}</h1>

        <button
          class="logbook__step"
          aria-label="Next month"
          @click="shiftMonth(1)"
        >
          <UIcon name="i-lucide-chevron-right" />
        </button>
      </header>

      <div class="logbook__weekdays">
        <span
          v-for="label in weekdayLabels"
          :key="label"
          class="logbook__weekday"
        >
          {{ label }}
        </span>
      </div>

      <div class="logbook__grid">
        <button
          v-for="(day, index) in days"
          :key="index"
          class="logbook__cell"
          :class="{
            'logbook__cell--muted': day === null,
            'logbook__cell--today': day !== null && isToday(day),
            'logbook__cell--selected': day !== null && day === selectedDay,
          }"
          :disabled="day === null"
          :aria-pressed="day !== null && day === selectedDay"
          @click="selectedDay = day"
        >
          <span>{{ day ?? "" }}</span>

          <span v-if="day !== null" class="logbook__dots" aria-hidden="true">
            <span
              v-for="(hue, dot) in dotsForDay(day)"
              :key="dot"
              class="logbook__dot"
              :style="{ background: hue }"
            />
          </span>
        </button>
      </div>
    </div>

    <aside
      class="logbook__list border-t border-white/60 lg:w-80 lg:shrink-0 lg:overflow-y-auto lg:border-t-0 lg:border-l xl:w-96"
    >
      <h2 class="logbook__list-title">
        {{ selectedLabel || "whenever you're ready" }}
      </h2>

      <ul v-if="selectedRecords.length" class="logbook__rows">
        <li v-for="record in selectedRecords" :key="record.id">
          <NuxtLink :to="`/logbook/${record.id}`" class="logbook__row">
            <span class="logbook__row-line">
              <span
                class="logbook__row-word"
                :style="{ color: hueOf(record) }"
              >
                {{ wordOf(record) }}
              </span>
              <span class="logbook__row-time">{{ timeOf(record) }}</span>
            </span>

            <span v-if="record.note" class="logbook__row-note">
              {{ record.note }}
            </span>
          </NuxtLink>
        </li>
      </ul>

      <p v-else class="logbook__list-hint">
        {{
          selectedDay === null
            ? "tap a day to see what was in the air."
            : "a quiet day. kept feelings will rest here."
        }}
      </p>
    </aside>
  </section>
</template>

<style scoped>
.logbook {
  background: radial-gradient(
      at 20% 15%,
      rgba(147, 197, 253, 0.35),
      transparent 55%
    ),
    radial-gradient(at 80% 85%, rgba(253, 186, 116, 0.3), transparent 60%),
    #faf7f2;
}

/* Bottom padding clears the floating pill at every size. */
.logbook__calendar {
  gap: 1.25rem;
  padding: 2rem 1.25rem 6rem;
}

.logbook__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logbook__month {
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: rgba(51, 65, 85, 0.85);
}

.logbook__step {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  color: rgba(51, 65, 85, 0.65);
  border-radius: 999px;
}

.logbook__step:hover {
  background: rgba(255, 255, 255, 0.6);
}

.logbook__weekdays,
.logbook__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
}

.logbook__weekday {
  font-size: 0.75rem;
  text-align: center;
  color: rgba(51, 65, 85, 0.45);
}

.logbook__cell {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  aspect-ratio: 1;
  align-items: center;
  justify-content: center;
  font: inherit;
  font-size: 0.9rem;
  color: rgba(51, 65, 85, 0.8);
  background: none;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
}

.logbook__cell--muted {
  color: transparent;
  cursor: default;
}

.logbook__cell--today {
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 0 0 1px rgba(51, 65, 85, 0.15);
}

.logbook__cell--selected {
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 4px 12px rgba(51, 65, 85, 0.12);
}

.logbook__dots {
  display: flex;
  gap: 3px;
  height: 5px;
}

.logbook__dot {
  width: 5px;
  height: 5px;
  border-radius: 999px;
}

.logbook__list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem 1.25rem 6rem;
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(10px);
}

.logbook__list-title {
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: rgba(51, 65, 85, 0.85);
}

.logbook__list-hint {
  font-size: 0.85rem;
  color: rgba(51, 65, 85, 0.5);
}

.logbook__rows {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.logbook__row {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.6rem 0.75rem;
  color: inherit;
  text-decoration: none;
  border-radius: 0.9rem;
  transition: background 0.2s ease;
}

.logbook__row:hover {
  background: rgba(255, 255, 255, 0.55);
}

.logbook__row-line {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}

.logbook__row-word {
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.logbook__row-time {
  font-size: 0.75rem;
  color: rgba(51, 65, 85, 0.5);
}

.logbook__row-note {
  overflow: hidden;
  font-size: 0.8rem;
  color: rgba(51, 65, 85, 0.6);
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
