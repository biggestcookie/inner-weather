<script setup lang="ts">
// The Logbook — the calendar plus the selected day's kept feelings. Kept
// feelings land here as soft dots (docs/product-vision.md). Layout is
// mobile-first (docs/technical-notes.md): stacked on small screens, side by
// side from `lg`.
const weekdayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const cursor = ref(new Date());
// The day whose kept feelings show in the list — today, until another is tapped.
const selectedDay = ref<number | null>(new Date().getDate());

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
          {{ day ?? "" }}
        </button>
      </div>
    </div>

    <aside
      class="logbook__list border-t border-white/60 lg:border-t-0 lg:border-l"
    >
      <h2 class="logbook__list-title">
        {{ selectedLabel || "whenever you're ready" }}
      </h2>

      <!-- Kept feelings render here once IndexedDB storage lands
           (docs/technical-notes.md). -->
      <p class="logbook__list-hint">
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
</style>
